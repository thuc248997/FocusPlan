# Bug Fix: Handle Deleting Already-Deleted Calendar Events

## Vấn đề

### Error Message

```
googleCalendar.ts:281 DELETE http://localhost:3000/api/calendar/events/1io7dq5bpteors7gj3ro1mspgs 410 (Gone)
suppressErrors.ts:32 ❌ Failed to delete calendar event: Error: Resource has been deleted
```

### Root Cause

Khi xóa task đã được đồng bộ với Google Calendar, có thể xảy ra các trường hợp:

1. **Event đã bị xóa trực tiếp trên Google Calendar** (manual delete)
2. **Event bị xóa bởi user khác** (shared calendar)
3. **Event expired hoặc cancelled**

Code hiện tại throw error khi nhận **410 Gone** response, gây:
- ❌ Console log đỏ lòm
- ❌ User thấy error message
- ❌ UX không tốt (task vẫn bị xóa nhưng có error)

### Khi nào xảy ra?

**Scenario:**
```typescript
// 1. User tạo task và sync to Calendar
const task = {
  title: 'Họp team',
  calendarEventId: '1io7dq5bpteors7gj3ro1mspgs'
}

// 2. User xóa event trực tiếp trên Google Calendar
// (hoặc event tự động expire/cancelled)

// 3. User xóa task trong FocusPlan app
handleDeleteTask(task.id)
// → Calls deleteCalendarEvent('1io7dq5bpteors7gj3ro1mspgs')
// → Google Calendar returns 410 Gone
// → Code throws error ❌
```

## Giải pháp

### Fix 1: googleCalendar.ts - Handle 410 Status

**Before:**

```typescript
export async function deleteCalendarEvent(eventId: string) {
  // ...
  const response = await fetch(`/api/calendar/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete calendar event')
  }

  return response.json()
}
```

**After:**

```typescript
export async function deleteCalendarEvent(eventId: string) {
  // ...
  const response = await fetch(`/api/calendar/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  // If event is already deleted (410 Gone), consider it success
  if (response.status === 410) {
    console.log('📌 Calendar event already deleted:', eventId)
    return { success: true, message: 'Event already deleted' }
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete calendar event')
  }

  return response.json()
}
```

### Fix 2: ChatInterface.tsx - Suppress Error Log

**Before:**

```typescript
const handleDeleteTask = async (taskId: string) => {
  const taskToDelete = tasks.find(t => t.id === taskId)
  
  if (taskToDelete?.calendarEventId && isCalendarConnected) {
    try {
      await deleteCalendarEvent(taskToDelete.calendarEventId)
      console.log('🗑️ Calendar event deleted:', taskToDelete.calendarEventId)
    } catch (error: any) {
      console.error('❌ Failed to delete calendar event:', error)
      // Continue with local deletion even if calendar deletion fails
    }
  }
  
  // ... delete local task
}
```

**After:**

```typescript
const handleDeleteTask = async (taskId: string) => {
  const taskToDelete = tasks.find(t => t.id === taskId)
  
  if (taskToDelete?.calendarEventId && isCalendarConnected) {
    try {
      await deleteCalendarEvent(taskToDelete.calendarEventId)
      console.log('🗑️ Calendar event deleted:', taskToDelete.calendarEventId)
    } catch (error: any) {
      // Only log error if it's not "already deleted" case
      if (!error.message?.includes('already deleted')) {
        console.error('❌ Failed to delete calendar event:', error)
      }
      // Continue with local deletion regardless
    }
  }
  
  // ... delete local task
}
```

## Technical Details

### HTTP 410 Gone

```
Status: 410 Gone
Meaning: The requested resource is no longer available and will not be available again
```

**Common causes in Google Calendar API:**
- Event has been deleted
- Event has been cancelled
- Event has expired
- Calendar has been deleted

### Idempotent Delete Pattern

```typescript
// Idempotent: Calling delete multiple times has same effect as calling once
deleteCalendarEvent(eventId)
deleteCalendarEvent(eventId) // ✅ Should not error
deleteCalendarEvent(eventId) // ✅ Should not error

// Our fix ensures this behavior
if (response.status === 410) {
  // Event already deleted = success!
  return { success: true, message: 'Event already deleted' }
}
```

### Error Suppression Strategy

```typescript
// Only log REAL errors, not "already deleted"
if (!error.message?.includes('already deleted')) {
  console.error('❌ Failed to delete calendar event:', error)
}

// Examples:
// ✅ Network error → Log it
// ✅ 401 Unauthorized → Log it  
// ✅ 404 Not found → Log it
// ❌ 410 Gone (already deleted) → Don't log (expected case)
```

## Testing

### Test Case 1: Delete synced task (event exists)

**Steps:**
1. Create task: "Họp team"
2. Sync to Calendar → calendarEventId = "abc123"
3. Delete task in FocusPlan

**Expected:**
```typescript
// ✅ Deletes from Google Calendar (200 OK)
// ✅ Deletes from local tasks
// ✅ Console: "🗑️ Calendar event deleted: abc123"
```

### Test Case 2: Delete synced task (event already deleted)

**Steps:**
1. Create task: "Họp team"
2. Sync to Calendar → calendarEventId = "abc123"
3. **Delete event directly on Google Calendar**
4. Delete task in FocusPlan

**Before fix:**
```typescript
// ❌ DELETE returns 410 Gone
// ❌ Console: "❌ Failed to delete calendar event: Error: Resource has been deleted"
// ✅ Task still deleted locally (but error shown)
```

**After fix:**
```typescript
// ✅ DELETE returns 410 Gone → handled gracefully
// ✅ Console: "📌 Calendar event already deleted: abc123"
// ✅ Task deleted locally
// ✅ No error shown to user
```

### Test Case 3: Delete unsynced task

**Steps:**
1. Create task: "Họp team"
2. **Don't sync** (no calendarEventId)
3. Delete task in FocusPlan

**Expected:**
```typescript
// ✅ Skips calendar deletion (no calendarEventId)
// ✅ Deletes from local tasks
// ✅ No console messages
```

### Test Case 4: Network error during delete

**Steps:**
1. Create task: "Họp team"
2. Sync to Calendar
3. Disconnect internet
4. Delete task in FocusPlan

**Expected:**
```typescript
// ❌ Network error (fetch fails)
// ✅ Console: "❌ Failed to delete calendar event: [network error]"
// ✅ Task still deleted locally (graceful degradation)
```

## Edge Cases Handled

### 1. Shared Calendar

```typescript
// User A creates event in shared calendar
// User B deletes event on Google Calendar
// User A tries to delete task in FocusPlan
// ✅ No error, graceful handling
```

### 2. Expired Events

```typescript
// Some calendar events auto-expire
// Calendar returns 410 Gone
// ✅ Treated as "already deleted"
```

### 3. Calendar Permission Changes

```typescript
// Calendar permissions revoked for specific event
// Could return 410 or 403
// ✅ 410 handled gracefully
// ✅ 403 would still log error (correct behavior)
```

### 4. Multiple Delete Attempts

```typescript
// User clicks delete button multiple times quickly
await handleDeleteTask('task-1')
await handleDeleteTask('task-1') // Task already deleted locally
// ✅ Second call won't find taskToDelete
// ✅ No calendar API call made
// ✅ No error
```

## Files Changed

### 1. `/src/lib/googleCalendar.ts`

**Changes:**
- ✅ Added check for `response.status === 410`
- ✅ Return success object instead of throwing error
- ✅ Added console.log for tracking

**Impact:**
- 410 Gone now considered successful deletion
- Idempotent delete behavior
- Better API design (success vs error)

### 2. `/src/components/ChatInterface.tsx`

**Changes:**
- ✅ Added condition `!error.message?.includes('already deleted')`
- ✅ Suppress error log for "already deleted" case
- ✅ Still log other errors (network, auth, etc.)

**Impact:**
- Cleaner console (no false-positive errors)
- Better UX (users don't see scary red errors)
- Still logs real errors for debugging

## Best Practices

### Idempotent Operations

```typescript
// DELETE should be idempotent
// Deleting something already deleted = success ✅
// Not an error ❌

// Same applies to:
PUT /resource   // Create/update (idempotent)
PATCH /resource // Update (idempotent)
DELETE /resource // Delete (idempotent) ← our fix
```

### Graceful Degradation

```typescript
try {
  await deleteCalendarEvent(eventId)
} catch (error) {
  // Don't block user action
  // Continue with local deletion
  // Log only real errors
}

// Result:
// ✅ Works offline
// ✅ Works if calendar API is down
// ✅ Works if event already deleted
```

### HTTP Status Code Meanings

```typescript
200 OK         → Success
204 No Content → Success (delete)
404 Not Found  → Resource doesn't exist (should handle?)
410 Gone       → Resource deleted (success for delete!)
403 Forbidden  → Permission denied (real error)
500 Server     → Server error (real error)
```

## Related Issues

### Similar patterns in codebase

Check other API delete operations:
- ✅ `updateCalendarEvent` - Should handle 410?
- ✅ Any other DELETE endpoints

### Google Calendar API Quirks

```typescript
// Google Calendar API returns 410 for:
// 1. Deleted events
// 2. Cancelled events
// 3. Expired recurring events
// 4. Calendar unsubscribed

// All should be treated as "already deleted"
```

## Conclusion

**Root cause:** Throwing error on 410 Gone when deleting already-deleted events

**Fix:** 
1. Treat 410 as success in `deleteCalendarEvent()`
2. Suppress error log for "already deleted" case

**Pattern:** Idempotent delete with graceful handling

**Benefits:**
- ✅ Clean console (no false-positive errors)
- ✅ Better UX (no scary error messages)
- ✅ Idempotent behavior (can delete multiple times)
- ✅ Works offline/with stale data
- ✅ Still logs real errors (network, auth)

**Lesson learned:** DELETE operations should be idempotent - deleting something already deleted should succeed, not error!
