# Bug Fix: EditTaskModal & NewTaskModal - Description Undefined Error

## Vấn đề

### Error Message
```
EditTaskModal.tsx:46 Uncaught TypeError: Cannot read properties of undefined (reading 'trim')
    at handleSubmit (EditTaskModal.tsx:46:32)
```

### Root Cause
Code đang cố gọi `.trim()` trên `description` khi giá trị này có thể là `undefined`:

```typescript
// ❌ BUG: description có thể là undefined
onUpdateTask(task.id, {
  title: title.trim(),
  description: description.trim(), // 💥 Error nếu description = undefined
  date,
  startTime,
  endTime,
}, syncToCalendar)
```

### Khi nào xảy ra?
- User tạo task **KHÔNG** nhập description
- Description được lưu là empty string `""` hoặc `undefined`
- Khi edit task, `description` state có thể là `undefined`
- Gọi `description.trim()` → **TypeError**

## Giải pháp

### Fix 1: EditTaskModal.tsx

**Before:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  // ...
  onUpdateTask(task.id, {
    title: title.trim(),
    description: description.trim(), // ❌ Bug
    date,
    startTime,
    endTime,
  }, syncToCalendar)
}

useEffect(() => {
  if (task) {
    setTitle(task.title)
    setDescription(task.description) // ❌ Có thể undefined
    // ...
  }
}, [task])

const handleClose = () => {
  if (task) {
    setTitle(task.title)
    setDescription(task.description) // ❌ Có thể undefined
    // ...
  }
}
```

**After:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  // ...
  onUpdateTask(task.id, {
    title: title.trim(),
    description: description?.trim() || '', // ✅ Safe
    date,
    startTime,
    endTime,
  }, syncToCalendar)
}

useEffect(() => {
  if (task) {
    setTitle(task.title)
    setDescription(task.description || '') // ✅ Default to empty string
    // ...
  }
}, [task])

const handleClose = () => {
  if (task) {
    setTitle(task.title)
    setDescription(task.description || '') // ✅ Default to empty string
    // ...
  }
}
```

### Fix 2: NewTaskModal.tsx

**Before:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  // ...
  onCreateTask({
    title: title.trim(),
    description: description.trim(), // ❌ Bug
    date,
    startTime,
    endTime,
  }, syncToCalendar)
}
```

**After:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  // ...
  onCreateTask({
    title: title.trim(),
    description: description?.trim() || '', // ✅ Safe
    date,
    startTime,
    endTime,
  }, syncToCalendar)
}
```

## Technical Details

### Optional Chaining (`?.`)

```typescript
// Safe navigation operator
description?.trim()

// Equivalent to:
description !== null && description !== undefined 
  ? description.trim() 
  : undefined
```

### Nullish Coalescing (`||`)

```typescript
description?.trim() || ''

// If description?.trim() is:
// - undefined → return ''
// - null → return ''
// - '' → return ''
// - 'text' → return 'text'
```

### Combined Pattern

```typescript
description?.trim() || ''

// This pattern:
// 1. Safely calls trim() if description exists
// 2. Returns empty string if description is undefined/null
// 3. Ensures we always return a string (never undefined)
```

## Testing

### Test Case 1: Task với description

**Scenario:**
```typescript
const task = {
  title: 'Họp team',
  description: 'Thảo luận sprint planning',
  date: '2025-10-13',
  startTime: '10:00',
  endTime: '11:00'
}
```

**Result:**
```typescript
// ✅ No error
description?.trim() || '' 
// → 'Thảo luận sprint planning'
```

### Test Case 2: Task KHÔNG có description

**Scenario:**
```typescript
const task = {
  title: 'Họp team',
  description: undefined, // or not set
  date: '2025-10-13',
  startTime: '10:00',
  endTime: '11:00'
}
```

**Before fix:**
```typescript
description.trim() // ❌ TypeError: Cannot read properties of undefined
```

**After fix:**
```typescript
description?.trim() || '' 
// → '' (empty string)
// ✅ No error
```

### Test Case 3: Task với empty description

**Scenario:**
```typescript
const task = {
  title: 'Họp team',
  description: '', // empty string
  date: '2025-10-13',
  startTime: '10:00',
  endTime: '11:00'
}
```

**Result:**
```typescript
description?.trim() || '' 
// → '' (empty string after trim)
// ✅ No error
```

### Test Case 4: Task với whitespace description

**Scenario:**
```typescript
const task = {
  title: 'Họp team',
  description: '   ', // only spaces
  date: '2025-10-13',
  startTime: '10:00',
  endTime: '11:00'
}
```

**Result:**
```typescript
description?.trim() || '' 
// → '' (empty string after trimming spaces)
// ✅ No error
```

## Files Changed

### 1. `/src/components/EditTaskModal.tsx`

**Changes:**
- ✅ Line 46: `description.trim()` → `description?.trim() || ''`
- ✅ Line 27: `setDescription(task.description)` → `setDescription(task.description || '')`
- ✅ Line 60: `setDescription(task.description)` → `setDescription(task.description || '')`

**Impact:**
- No more TypeError when editing tasks without description
- Description always defaults to empty string
- State is always a valid string (never undefined)

### 2. `/src/components/NewTaskModal.tsx`

**Changes:**
- ✅ Line 34: `description.trim()` → `description?.trim() || ''`

**Impact:**
- No more TypeError when creating tasks without description
- Consistent empty string handling

## Prevention

### Type Safety Enhancement

Consider updating Task type to make description non-nullable:

```typescript
// Current
export interface Task {
  // ...
  description: string // Can be undefined in practice
}

// Recommended (future)
export interface Task {
  // ...
  description: string // Always string (never undefined)
}
```

### Input Validation

```typescript
// Always initialize with empty string
const [description, setDescription] = useState<string>('')

// Not this:
const [description, setDescription] = useState<string>() // Can be undefined
```

### ESLint Rule (Optional)

```json
{
  "rules": {
    "@typescript-eslint/strict-null-checks": "error"
  }
}
```

## Related Issues

### Similar patterns in codebase
Check other modals/forms that handle optional string fields:
- ✅ EditEventModal - May have similar issues
- ✅ Any other form components with optional text inputs

### Console Warnings
The error also appeared in console as:
```
Unchecked runtime.lastError: Could not establish connection
```
This is unrelated - it's from browser extensions (already handled by suppressErrors.ts)

## Conclusion

**Root cause:** Calling `.trim()` on potentially undefined value  
**Fix:** Use optional chaining `?.` and nullish coalescing `||`  
**Pattern:** `description?.trim() || ''`  

**Benefits:**
- ✅ No more TypeError crashes
- ✅ Graceful handling of missing descriptions
- ✅ Consistent empty string behavior
- ✅ Better user experience (no crashes when editing/creating tasks)

**Lesson learned:** Always check for undefined/null before calling methods on optional values!
