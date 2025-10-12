# Task Sync & Merge - Documentation

## Tổng quan

Khi đồng bộ task lên Google Calendar, task sẽ **gộp vào Calendar** và không hiển thị riêng lẻ nữa. MonthCalendar chỉ hiển thị:
- ✅ **Google Calendar Events** (bao gồm cả tasks đã đồng bộ)
- ⏳ **Tasks chưa đồng bộ** (local tasks)

## Workflow

### Before Sync:
```
MonthCalendar hiển thị:
├─ 📅 Google Calendar Events (màu xanh)
└─ ⏳ Local Tasks chưa đồng bộ (màu cam)
```

### After Sync:
```
MonthCalendar hiển thị:
├─ 📅 Google Calendar Events (màu xanh)
│   ├─ Events gốc từ Google Calendar
│   └─ Tasks đã đồng bộ (đã gộp vào Calendar)
└─ ⏳ Local Tasks chưa đồng bộ (màu cam)
```

## Use Cases

### Case 1: Tạo task và đồng bộ

**Bước 1: Tạo task**
```
User: "Tạo lịch họp 10h-11h ngày mai"

Result:
✅ Task "Họp" được tạo (local)
⏳ Hiển thị màu cam trong MonthCalendar
```

**Bước 2: Đồng bộ task**
```
User: "Đồng bộ task họp"

Result:
✅ Task được sync lên Google Calendar
✅ Task nhận được calendarEventId
📅 Task biến mất khỏi danh sách "local tasks"
📅 Task xuất hiện trong Google Calendar events (màu xanh)
```

**MonthCalendar trước sync:**
```
10:00-11:00 ⏳ Họp [màu cam - local task]
```

**MonthCalendar sau sync:**
```
10:00-11:00 📅 Họp [màu xanh - Google Calendar event]
```

### Case 2: Đồng bộ tất cả tasks

**Trước đồng bộ:**
```
Tasks:
├─ ⏳ Họp team (10:00-11:00) - chưa sync
├─ ⏳ Gym (18:00-19:00) - chưa sync
└─ ⏳ Học tiếng Anh (20:00-21:00) - chưa sync

MonthCalendar:
├─ 10:00-11:00 ⏳ Họp team [cam]
├─ 18:00-19:00 ⏳ Gym [cam]
└─ 20:00-21:00 ⏳ Học tiếng Anh [cam]
```

**Câu lệnh:**
```
User: "Đồng bộ tất cả tasks"
```

**Sau đồng bộ:**
```
Tasks:
├─ ✅ Họp team (10:00-11:00) - calendarEventId: abc123
├─ ✅ Gym (18:00-19:00) - calendarEventId: def456
└─ ✅ Học tiếng Anh (20:00-21:00) - calendarEventId: ghi789

MonthCalendar:
├─ 10:00-11:00 📅 Họp team [xanh]
├─ 18:00-19:00 📅 Gym [xanh]
└─ 20:00-21:00 📅 Học tiếng Anh [xanh]
```

### Case 3: Mix Google Calendar Events + Local Tasks

**Scenario:**
- Google Calendar có sẵn: "Meeting với client" (14:00-15:00)
- Local task: "Gym" (18:00-19:00) - chưa sync

**MonthCalendar hiển thị:**
```
14:00-15:00 📅 Meeting với client [xanh - từ Google Calendar]
18:00-19:00 ⏳ Gym [cam - local task chưa sync]
```

**Sau khi sync task "Gym":**
```
14:00-15:00 📅 Meeting với client [xanh]
18:00-19:00 📅 Gym [xanh - đã gộp vào Google Calendar]
```

## Implementation Details

### File: `MonthCalendar.tsx`

#### 1. Filter chỉ hiển thị tasks chưa đồng bộ

**Before:**
```typescript
const getTasksForDay = (day: number) => {
  return tasks.filter(task => {
    // ... filter by date
  })
}
```

**After:**
```typescript
const getTasksForDay = (day: number) => {
  // Only show tasks that haven't been synced to Google Calendar
  return tasks.filter(task => {
    const taskDate = new Date(task.date)
    return taskDate.getDate() === day &&
           taskDate.getMonth() === month &&
           taskDate.getFullYear() === year &&
           !task.calendarEventId // 🔑 Only show unsynced tasks
  })
}
```

#### 2. Update statistics để phản ánh đúng

**Before:**
```typescript
return {
  totalEvents: monthEvents.length,
  totalTasks: monthTasks.length,
  syncedTasks: monthTasks.filter(t => t.calendarEventId).length,
  unsyncedTasks: monthTasks.filter(t => !t.calendarEventId).length,
}
```

**After:**
```typescript
// Only count unsynced tasks (synced tasks are already in monthEvents)
const monthTasks = tasks.filter(task => {
  // ... filter by date
  !task.calendarEventId // Only count unsynced tasks
})

return {
  totalEvents: monthEvents.length,
  totalTasks: monthTasks.length, // Only unsynced
  syncedTasks: tasks.filter(t => 
    // ... filter by date AND
    t.calendarEventId
  ).length,
  unsyncedTasks: monthTasks.length,
}
```

#### 3. Simplify UI - Chỉ hiển thị 2 loại

**Before (3 colors):**
```typescript
// Blue: Google Calendar events
// Green: Synced tasks
// Orange: Unsynced tasks
```

**After (2 colors):**
```typescript
// Blue: Google Calendar events (bao gồm cả synced tasks)
// Orange: Unsynced tasks only
```

**Code:**
```typescript
{/* Display Local Tasks (Only unsynced) */}
{dayTasks.map(task => (
  <div className="bg-orange-600/30 text-orange-300">
    ⏳ {task.title}
  </div>
))}
```

#### 4. Update footer statistics

**Before:**
```typescript
<div>Google Calendar: X</div>
<div>Đã đồng bộ: Y</div>
<div>Chưa đồng bộ: Z</div>
```

**After:**
```typescript
<div>Google Calendar: X (includes synced tasks)</div>
<div>Chưa đồng bộ: Z</div>
{syncedTasks > 0 && (
  <div className="text-gray-500 italic">
    ℹ️ {syncedTasks} tasks đã được đồng bộ và hiển thị trên Google Calendar
  </div>
)}
```

## Color Legend

| Color | Icon | Meaning | Source |
|-------|------|---------|--------|
| 🔵 Blue | 📅 | Google Calendar Event | Google Calendar API |
| 🟠 Orange | ⏳ | Local Task (chưa đồng bộ) | localStorage |

## Benefits

### ✅ 1. Tránh duplicate
- Tasks đã sync **không** hiển thị 2 lần
- Chỉ xuất hiện trong Google Calendar events

### ✅ 2. UI sạch sẽ hơn
- Giảm từ 3 màu xuống 2 màu
- Dễ phân biệt: Xanh (đã sync) vs Cam (chưa sync)

### ✅ 3. Source of truth rõ ràng
- Tasks đã sync → Google Calendar là source of truth
- Tasks chưa sync → localStorage là source of truth

### ✅ 4. Workflow tự nhiên
```
Tạo task (local) 
  → Chỉnh sửa nếu cần
    → Đồng bộ lên Google Calendar
      → Task "gộp" vào Calendar
        → Quản lý từ Google Calendar
```

## Testing

### Test Case 1: Create và Sync một task

**Steps:**
1. Tạo task "Họp" 10:00-11:00 ngày mai
2. Verify: Task hiển thị màu cam (⏳) trong MonthCalendar
3. Nói: "Đồng bộ task họp"
4. Verify: 
   - ✅ Task biến mất khỏi danh sách cam
   - ✅ Task xuất hiện màu xanh (📅) trong MonthCalendar
   - ✅ Footer shows: "X tasks đã được đồng bộ..."

### Test Case 2: Đồng bộ tất cả tasks

**Steps:**
1. Tạo 3 tasks: Họp, Gym, Học
2. Verify: 3 tasks màu cam trong MonthCalendar
3. Nói: "Đồng bộ tất cả tasks"
4. Verify:
   - ✅ Tất cả tasks biến mất khỏi màu cam
   - ✅ Tất cả tasks xuất hiện màu xanh
   - ✅ Google Calendar có 3 events mới

### Test Case 3: Mix events và tasks

**Steps:**
1. Google Calendar có event "Meeting" 14:00-15:00
2. Tạo task "Gym" 18:00-19:00
3. Verify MonthCalendar:
   ```
   14:00-15:00 📅 Meeting [xanh]
   18:00-19:00 ⏳ Gym [cam]
   ```
4. Sync task "Gym"
5. Verify MonthCalendar:
   ```
   14:00-15:00 📅 Meeting [xanh]
   18:00-19:00 📅 Gym [xanh]
   ```

### Test Case 4: Statistics accuracy

**Before any sync:**
```
Tổng số sự kiện: 5
- Google Calendar: 2
- Chưa đồng bộ: 3
```

**After sync all:**
```
Tổng số sự kiện: 5
- Google Calendar: 5 (includes synced tasks)
- Chưa đồng bộ: 0
ℹ️ 3 tasks đã được đồng bộ và hiển thị trên Google Calendar
```

## Edge Cases

### 1. Task được sync nhưng sau đó bị xóa trên Google Calendar

**Scenario:**
- User sync task "Họp" lên Calendar
- User xóa event "Họp" trực tiếp trên Google Calendar web
- Task vẫn có `calendarEventId` trong localStorage

**Current behavior:**
- Task không hiển thị trong MonthCalendar (vì có `calendarEventId`)
- Event không tồn tại trên Google Calendar

**Solution (Future):**
- Implement periodic sync để detect deleted events
- Clear `calendarEventId` nếu event không còn tồn tại

### 2. Nhiều tasks sync cùng lúc fail

**Scenario:**
```
User: "Đồng bộ tất cả tasks"
Result:
- Task 1: ✅ Success
- Task 2: ❌ Failed (network error)
- Task 3: ✅ Success
```

**Current behavior:**
- Task 1, 3 có `calendarEventId` → hiển thị xanh
- Task 2 không có `calendarEventId` → vẫn màu cam
- User được thông báo: "Thành công: 2, Thất bại: 1"

**Good:** Partial sync is handled correctly ✅

### 3. Task duplicate trên Google Calendar

**Prevention:**
- Mỗi task chỉ sync một lần (check `calendarEventId`)
- Nếu `calendarEventId` đã tồn tại, không sync lại

## Future Enhancements

### 1. Bi-directional sync
```typescript
// Sync FROM Google Calendar TO local tasks
// If user creates event on Google Calendar web,
// it appears in app automatically
```

### 2. Conflict resolution
```typescript
// If task is modified both locally and on Google Calendar
// Show conflict resolution UI
```

### 3. Offline sync queue
```typescript
// If offline, queue sync operations
// Auto-sync when back online
```

### 4. Smart re-sync
```typescript
// Detect if Google Calendar event was modified
// Update local task accordingly
```

## Conclusion

Tính năng "gộp task vào Calendar khi đồng bộ" mang lại:

✅ **UX tốt hơn** - Không duplicate, UI sạch  
✅ **Logic rõ ràng** - Source of truth phân biệt rõ  
✅ **Workflow tự nhiên** - Create → Edit → Sync → Manage in Calendar  
✅ **Maintainable** - Code đơn giản, dễ hiểu  

Người dùng có thể:
- 📝 Tạo tasks local để draft
- ✏️ Chỉnh sửa tasks trước khi sync
- 📤 Sync lên Google Calendar khi sẵn sàng
- 📅 Quản lý từ Google Calendar sau khi sync
