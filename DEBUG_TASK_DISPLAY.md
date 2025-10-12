# Debug: Tasks không hiển thị trên Month Calendar

## Vấn đề
Tasks không hiển thị trên Month Calendar sau khi tạo.

## Các thay đổi đã thực hiện

### 1. Luôn hiển thị MonthCalendar (page.tsx)
**Trước:**
- MonthCalendar chỉ hiển thị khi `isCalendarConnected === true`
- Khi chưa kết nối Google Calendar, chỉ có ChatInterface full-width

**Sau:**
- MonthCalendar LUÔN được render
- Khi chưa kết nối: Chat 2/3 width, Calendar 1/3 width
- Khi đã kết nối: Chat 1/2 width, Calendar 1/2 width

```typescript
{/* Calendar View - Always show (to display local tasks) */}
<div className={isCalendarConnected ? "w-1/2" : "w-1/3"}>
  <MonthCalendar tasks={sharedTasks} />
</div>
```

### 2. Hiển thị Calendar dù chưa kết nối Google (MonthCalendar.tsx)
**Trước:**
- Nếu chưa có `google_calendar_token`, hiển thị message "Chưa kết nối Google Calendar"
- Calendar grid KHÔNG được render

**Sau:**
- Calendar grid LUÔN được render
- Hiển thị thông báo nhẹ nếu chưa kết nối (ở trên calendar grid)

```typescript
{/* Show message if not connected */}
{!localStorage.getItem('google_calendar_token') && (
  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 mb-3 text-sm text-blue-300">
    ℹ️ Kết nối Google Calendar để xem thêm sự kiện từ Google Calendar
  </div>
)}
```

### 3. Thêm Debug Logging
```typescript
// In MonthCalendar.tsx
useEffect(() => {
  console.log('📅 MonthCalendar received tasks:', tasks.length, tasks)
}, [tasks])

// In getTasksForDay()
if (filteredTasks.length > 0) {
  console.log(`📋 Tasks for day ${day}:`, filteredTasks)
}
```

## Cách Debug

### Bước 1: Kiểm tra tasks trong localStorage
Mở DevTools Console và chạy:
```javascript
JSON.parse(localStorage.getItem('tasks'))
```

Kết quả mong đợi: Array of tasks với format:
```javascript
[
  {
    id: "...",
    title: "Task name",
    date: "2025-10-13",
    startTime: "09:00",
    endTime: "10:00",
    description: "...",
    calendarEventId: undefined, // hoặc null cho unsynced tasks
    createdAt: "...",
    updatedAt: "..."
  }
]
```

### Bước 2: Kiểm tra tasks được truyền vào MonthCalendar
Xem console logs:
```
📋 Tasks updated: 1 tasks
📅 MonthCalendar received tasks: 1 [...]
```

### Bước 3: Kiểm tra tasks được filter cho ngày cụ thể
Nếu có task, sẽ thấy log:
```
📋 Tasks for day 13: [...]
```

### Bước 4: Kiểm tra format date
Task date PHẢI đúng format: `YYYY-MM-DD` (e.g., `2025-10-13`)

Nếu sai format, task sẽ không match với calendar day.

## Common Issues

### Issue 1: Tasks không xuất hiện
**Nguyên nhân:** Date format không đúng hoặc task đã có `calendarEventId`

**Giải pháp:**
1. Check task.date format: `console.log(task.date)`
2. Check task.calendarEventId: `console.log(task.calendarEventId)` (phải là `undefined` hoặc `null`)

### Issue 2: MonthCalendar không được render
**Nguyên nhân:** Component không được mount

**Giải pháp:**
1. Check React DevTools - tìm `MonthCalendar` component
2. Check props `tasks` - xem có data không

### Issue 3: Calendar chỉ hiển thị khi kết nối Google
**Nguyên nhân:** Đã fix trong version mới

**Giải pháp:** Pull code mới nhất

### Issue 4: Polling không hoạt động
**Nguyên nhân:** localStorage không được update

**Giải pháp:**
1. Kiểm tra `localStorage.setItem('tasks', ...)` được gọi
2. Kiểm tra interval đang chạy: 500ms polling

## Test Cases

### Test 1: Tạo task mới (chưa kết nối Google Calendar)
```
1. Mở app (chưa kết nối Google Calendar)
2. Click "New Task"
3. Điền thông tin: Title, Date (hôm nay), Time
4. KHÔNG check "Đồng bộ lên Google Calendar"
5. Click "Tạo Task"

Expected: 
- Task xuất hiện trên sidebar
- Task xuất hiện trên calendar (màu cam, icon ⏳)
- Console log: "📋 Tasks updated: 1 tasks"
- Console log: "📅 MonthCalendar received tasks: 1"
```

### Test 2: Tạo task và đồng bộ
```
1. Kết nối Google Calendar
2. Tạo task mới với checkbox "Đồng bộ" được check
3. Click "Tạo Task"

Expected:
- Task xuất hiện trên calendar (màu xanh, icon 📅)
- Task.calendarEventId !== null
- Task KHÔNG hiển thị ở phần "Chưa đồng bộ"
```

### Test 3: Tạo task từ chat
```
1. Chat với AI: "Tạo task họp team lúc 3pm hôm nay"
2. AI tạo task

Expected:
- Task xuất hiện ngay trên calendar (< 500ms)
- Console log: "✅ Task created from chat"
- Console log: "📋 Total tasks: 1"
```

## Files Changed

1. `src/app/page.tsx` - Always render MonthCalendar
2. `src/components/MonthCalendar.tsx` - Always show calendar grid + debug logging

## Next Steps

Nếu vẫn không hiển thị tasks:

1. ✅ Kiểm tra Console logs
2. ✅ Kiểm tra localStorage data
3. ✅ Kiểm tra React DevTools props
4. ✅ Kiểm tra date format của task
5. ✅ Kiểm tra task.calendarEventId (phải null/undefined)
6. ✅ Hard refresh browser (Ctrl+Shift+R)
7. ✅ Clear localStorage và tạo task mới
