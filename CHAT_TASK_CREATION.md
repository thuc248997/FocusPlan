# Tính năng tạo lịch từ Chat với AI

## 🎯 Mô tả chức năng

AI có thể hiểu và tự động tạo task/lịch từ câu lệnh tự nhiên của người dùng bằng OpenAI Function Calling.

## 🚀 Cách sử dụng

### Ví dụ câu lệnh:

```
✨ "Tạo lịch họp với khách hàng ngày mai lúc 10h"
✨ "Đặt lịch hẹn bác sĩ vào thứ 5 tuần sau 14h-15h"
✨ "Nhắc tôi học tiếng Anh vào 20h hôm nay"
✨ "Tạo task đi gym vào 6h sáng mai"
✨ "Đặt lịch meeting với team lúc 14h chiều mai, kéo dài 2 tiếng"
```

### AI sẽ tự động:
1. ✅ Phân tích câu lệnh
2. ✅ Trích xuất thông tin: tiêu đề, ngày, giờ bắt đầu, giờ kết thúc
3. ✅ Tạo task và lưu vào danh sách
4. ✅ Hiển thị xác nhận với đầy đủ chi tiết

## 🎨 Phân biệt màu sắc trong Calendar

### 1. **Google Calendar Events** (Xanh dương 📅)
- Màu: Blue (`bg-blue-600/30`, `border-blue-500/30`)
- Icon: 📅
- Nguồn: Đồng bộ trực tiếp từ Google Calendar
- Đặc điểm: Có thể edit/delete trực tiếp

### 2. **Local Tasks - Đã đồng bộ** (Xanh lá ✅)
- Màu: Green (`bg-green-600/30`, `border-green-500/30`)
- Icon: ✅
- Nguồn: Tạo từ app và đã đồng bộ lên Google Calendar
- Đặc điểm: Có `calendarEventId`

### 3. **Local Tasks - Chưa đồng bộ** (Cam ⏳)
- Màu: Orange (`bg-orange-600/30`, `border-orange-500/30`)
- Icon: ⏳
- Nguồn: Tạo từ app nhưng chưa đồng bộ
- Đặc điểm: Không có `calendarEventId`

## 📊 Thống kê trong Calendar

Phần footer của calendar hiển thị:
- **Tổng số sự kiện**: Tất cả events + tasks
- **Google Calendar**: Số lượng events từ Google
- **Đã đồng bộ**: Số tasks đã sync lên Google Calendar
- **Chưa đồng bộ**: Số tasks chỉ lưu local

## 🔧 Technical Implementation

### 1. OpenAI Function Calling

**File**: `/src/app/api/chat/route.ts`

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Tạo task/lịch/sự kiện mới',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          date: { type: 'string', description: 'YYYY-MM-DD' },
          startTime: { type: 'string', description: 'HH:MM' },
          endTime: { type: 'string', description: 'HH:MM' },
        },
        required: ['title', 'date', 'startTime', 'endTime'],
      },
    },
  },
]
```

### 2. Task Creation Flow

```
User Input → OpenAI API (Function Calling)
    ↓
AI detects "create task" intent
    ↓
Returns task data (title, date, time)
    ↓
ChatInterface creates Task object
    ↓
Saves to localStorage
    ↓
Updates UI with confirmation
    ↓
Shows in Calendar with orange color (unsynced)
```

### 3. Data Sharing between Components

**File**: `/src/app/page.tsx`

```typescript
// State lưu trữ tasks để share giữa ChatInterface và MonthCalendar
const [sharedTasks, setSharedTasks] = useState<Task[]>([])

// Polling localStorage để cập nhật real-time
useEffect(() => {
  const interval = setInterval(() => {
    // Load tasks from localStorage
    // Update sharedTasks state
  }, 1000)
}, [])
```

### 4. Calendar Display Logic

**File**: `/src/components/MonthCalendar.tsx`

```typescript
// Get all items for a day
const dayEvents = getEventsForDay(day)  // Google Calendar
const dayTasks = getTasksForDay(day)    // Local tasks

// Render with different colors
{dayEvents.map(event => (
  <div className="bg-blue-600/30 border-blue-500/30">📅 {event.summary}</div>
))}

{dayTasks.map(task => (
  <div className={task.calendarEventId 
    ? "bg-green-600/30 border-green-500/30"  // Synced
    : "bg-orange-600/30 border-orange-500/30" // Unsynced
  }>
    {task.calendarEventId ? '✅' : '⏳'} {task.title}
  </div>
))}
```

## 🎯 Use Cases

### Case 1: Tạo task nhanh
**Input**: "Nhắc tôi họp lúc 3h chiều mai"

**AI Process**:
- Phân tích: Tạo task "Họp" vào ngày mai 15:00
- Tự động thêm endTime: 16:00 (mặc định 1 tiếng)

**Output**: Task được tạo và hiển thị màu cam (chưa đồng bộ)

### Case 2: Tạo task với chi tiết
**Input**: "Đặt lịch đi khám bệnh tại bệnh viện A vào 10h sáng thứ 5 tuần sau, dự kiến 1 tiếng"

**AI Process**:
- title: "Đi khám bệnh"
- description: "Tại bệnh viện A"
- date: (tính toán thứ 5 tuần sau)
- startTime: "10:00"
- endTime: "11:00"

**Output**: Task với đầy đủ thông tin

### Case 3: Đồng bộ lên Google Calendar
1. User tạo task từ chat (màu cam)
2. User click vào task trong sidebar
3. Chọn "Sync to Google Calendar"
4. Task chuyển sang màu xanh lá (đã đồng bộ)

## 📝 Changelog

### Version 1.0 - Initial Release

**Added**:
- ✅ OpenAI Function Calling để tạo task từ natural language
- ✅ Auto-create task khi AI detect intent
- ✅ Hiển thị 3 loại màu sắc trong calendar
- ✅ Real-time sync giữa ChatInterface và MonthCalendar
- ✅ Thống kê chi tiết trong calendar footer
- ✅ Support cho nhiều format câu lệnh tiếng Việt

**Modified Files**:
- `/src/app/api/chat/route.ts` - Thêm Function Calling
- `/src/components/ChatInterface.tsx` - Xử lý task creation
- `/src/components/MonthCalendar.tsx` - Hiển thị multi-color
- `/src/app/page.tsx` - Share tasks between components

## 🎨 Color Reference

```css
/* Google Calendar Events */
.calendar-event {
  background: rgba(37, 99, 235, 0.3);  /* blue-600/30 */
  border: 1px solid rgba(59, 130, 246, 0.3);  /* blue-500/30 */
  color: rgb(147, 197, 253);  /* blue-300 */
}

/* Synced Tasks */
.synced-task {
  background: rgba(22, 163, 74, 0.3);  /* green-600/30 */
  border: 1px solid rgba(34, 197, 94, 0.3);  /* green-500/30 */
  color: rgb(134, 239, 172);  /* green-300 */
}

/* Unsynced Tasks */
.unsynced-task {
  background: rgba(234, 88, 12, 0.3);  /* orange-600/30 */
  border: 1px solid rgba(249, 115, 22, 0.3);  /* orange-500/30 */
  color: rgb(253, 186, 116);  /* orange-300 */
}
```

## 🧪 Testing

### Test 1: Tạo task từ chat
```
User: "Tạo lịch meeting lúc 2h chiều mai"
Expected: 
- AI response với confirmation
- Task xuất hiện trong sidebar (màu cam)
- Task hiển thị trong calendar (màu cam với icon ⏳)
```

### Test 2: Đồng bộ task
```
1. Tạo task từ chat
2. Mở task modal từ sidebar
3. Check "Sync to Google Calendar"
4. Save
Expected:
- Task chuyển sang màu xanh lá
- Icon đổi từ ⏳ thành ✅
- Task có calendarEventId
```

### Test 3: Calendar màu sắc
```
Setup:
- 1 Google Calendar event
- 1 synced task
- 1 unsynced task

Expected trong calendar:
- Blue event (📅)
- Green task (✅)
- Orange task (⏳)
- Footer stats chính xác
```

## 🔮 Future Improvements

- [ ] Batch create multiple tasks
- [ ] Edit task từ calendar click
- [ ] Quick sync button trên calendar
- [ ] Drag & drop để reschedule
- [ ] Color picker cho custom colors
- [ ] Recurring tasks support
- [ ] Task categories/tags
- [ ] Smart scheduling (AI suggest best time)

---

**Created**: 2025-10-12  
**Last Updated**: 2025-10-12  
**Version**: 1.0.0
