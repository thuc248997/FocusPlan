# Fix: Task Display và Sync Issues

## Vấn đề
1. **Tasks không hiển thị ngay trên Month Calendar**: Sau khi tạo task, nó không xuất hiện ngay lập tức trên calendar
2. **Tasks báo đã đồng bộ nhưng không có trên Google Calendar**: User thấy thông báo "đã đồng bộ" nhưng không thấy task trên Google Calendar

## Nguyên nhân
1. **Polling chậm**: Calendar polling localStorage mỗi 1 giây, gây ra độ trễ trong việc hiển thị tasks mới
2. **Không lưu vào localStorage**: Các thao tác create/update/delete task không trigger localStorage.setItem() ngay lập tức
3. **Checkbox sync mặc định tắt**: Khi tạo task mới, checkbox "Đồng bộ lên Google Calendar" mặc định là unchecked, user không biết cần phải check

## Giải pháp

### 1. Tăng tốc độ cập nhật Calendar (page.tsx)
```typescript
// Giảm polling interval từ 1000ms xuống 500ms
const interval = setInterval(() => {
  handleStorageChange()
}, 500) // Faster updates

// Thêm log để debug
console.log('📋 Tasks updated:', tasksWithDates.length, 'tasks')
```

### 2. Force save localStorage ngay lập tức (ChatInterface.tsx)
#### Create Task
```typescript
const updatedTasks = [newTask, ...tasks]
setTasks(updatedTasks)

// Force save to localStorage to trigger immediate update
localStorage.setItem('tasks', JSON.stringify(updatedTasks))
```

#### Update Task
```typescript
const updatedTasks = tasks.map((task) => { ... })
setTasks(updatedTasks)

// Force save to localStorage to trigger immediate update
localStorage.setItem('tasks', JSON.stringify(updatedTasks))
```

#### Delete Task
```typescript
const updatedTasks = tasks.filter((task) => task.id !== taskId)
setTasks(updatedTasks)

// Force save to localStorage to trigger immediate update
localStorage.setItem('tasks', JSON.stringify(updatedTasks))
```

### 3. Auto-check sync checkbox (NewTaskModal.tsx)
```typescript
// Auto-check sync checkbox when calendar is connected
useEffect(() => {
  if (isCalendarConnected && isOpen) {
    setSyncToCalendar(true)
  }
}, [isCalendarConnected, isOpen])
```

### 4. Cải thiện UX cho Modal

#### NewTaskModal.tsx
- ✅ Auto-check "Đồng bộ lên Google Calendar" khi đã kết nối
- ✅ Hiển thị thông báo khi chưa kết nối calendar
- ✅ Text rõ ràng hơn: "Đồng bộ lên Google Calendar ngay"

#### EditTaskModal.tsx
- ✅ Auto-check sync cho tasks chưa đồng bộ
- ✅ Hiển thị trạng thái task (đã đồng bộ / chưa đồng bộ)
- ✅ Text động: "Cập nhật lên Google Calendar" vs "Đồng bộ lên Google Calendar"

### 5. Cập nhật messages rõ ràng hơn
```typescript
// Khi tạo task
if (calendarEventId) {
  alert('✅ Task đã được tạo và đồng bộ lên Google Calendar!')
} else if (syncToCalendar) {
  alert('⚠️ Task đã được tạo nhưng chưa đồng bộ được lên Google Calendar')
} else {
  alert('✅ Task đã được tạo! (Chưa đồng bộ lên Google Calendar)')
}
```

## Files Changed

1. **src/app/page.tsx**
   - Giảm polling interval từ 1000ms → 500ms
   - Thêm logging để debug
   - Reset sharedTasks về [] khi localStorage trống

2. **src/components/ChatInterface.tsx**
   - Force save localStorage sau mọi thao tác create/update/delete
   - Cải thiện alert messages
   - Thêm logging chi tiết

3. **src/components/NewTaskModal.tsx**
   - Auto-check sync checkbox khi calendar connected
   - Thêm import useEffect
   - Cải thiện UI/UX

4. **src/components/EditTaskModal.tsx**
   - Auto-check sync cho unsynced tasks
   - Hiển thị trạng thái sync
   - Text động theo trạng thái

## Testing Checklist

### Scenario 1: Tạo task mới
- [ ] Tạo task từ New Task button
- [ ] Verify task xuất hiện ngay trên sidebar
- [ ] Verify task xuất hiện ngay trên Month Calendar (màu cam - chưa đồng bộ)
- [ ] Check checkbox "Đồng bộ lên Google Calendar" được auto-check
- [ ] Tạo task với sync enabled
- [ ] Verify task chuyển sang màu xanh (đã đồng bộ) trên calendar
- [ ] Verify task xuất hiện trên Google Calendar web

### Scenario 2: Tạo task từ chat
- [ ] Nói với AI: "Tạo task họp team lúc 3pm ngày mai"
- [ ] Verify task xuất hiện ngay trên calendar
- [ ] Verify task hiển thị màu cam (chưa đồng bộ)
- [ ] Nói: "Đồng bộ task họp team"
- [ ] Verify task chuyển màu xanh
- [ ] Verify task xuất hiện trên Google Calendar

### Scenario 3: Edit task
- [ ] Edit một task chưa đồng bộ
- [ ] Verify checkbox sync được auto-check
- [ ] Edit một task đã đồng bộ
- [ ] Verify hiển thị "✅ Task này đã được đồng bộ"
- [ ] Check sync và update
- [ ] Verify thay đổi được cập nhật trên Google Calendar

### Scenario 4: Delete task
- [ ] Delete task từ sidebar
- [ ] Verify task biến mất ngay khỏi calendar
- [ ] Delete task đã sync
- [ ] Verify task bị xóa khỏi Google Calendar
- [ ] Delete task từ chat
- [ ] Verify tất cả thay đổi được áp dụng ngay lập tức

## Performance Notes

- Polling interval 500ms là hợp lý cho real-time updates
- localStorage operations rất nhanh (< 1ms)
- Không ảnh hưởng đến performance vì chỉ chạy khi có thay đổi

## Future Improvements

1. **WebSocket/Server-Sent Events**: Thay thế polling bằng real-time updates
2. **IndexedDB**: Lưu tasks vào IndexedDB thay vì localStorage để tăng performance
3. **Optimistic UI**: Hiển thị UI ngay lập tức trước khi sync hoàn tất
4. **Background Sync**: Tự động retry sync khi network khôi phục
5. **Conflict Resolution**: Xử lý conflicts khi task được sửa ở nhiều nơi
