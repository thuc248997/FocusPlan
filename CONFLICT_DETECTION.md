# Tính năng Phát hiện Trùng lịch (Schedule Conflict Detection)

## Tổng quan

Hệ thống tự động phát hiện và cảnh báo khi tạo task/lịch mới bị trùng thời gian với các sự kiện đã có (từ tasks hiện tại hoặc Google Calendar).

## Cách hoạt động

### 1. Khi nào kiểm tra trùng lịch?

Hệ thống tự động kiểm tra trùng lịch khi:
- ✅ Tạo task mới từ chat với AI
- ✅ Phát hiện thời gian của task mới trùng với:
  - Tasks hiện có trong danh sách
  - Events trên Google Calendar (nếu đã kết nối)

### 2. Điều kiện phát hiện trùng lịch

Hai sự kiện được coi là **TRÙNG LỊCH** nếu:
- Cùng ngày
- Thời gian bắt đầu hoặc kết thúc nằm trong khoảng thời gian của nhau

**Công thức kiểm tra:**
```
Sự kiện A: [startA, endA]
Sự kiện B: [startB, endB]

Trùng lịch nếu: startA < endB AND startB < endA
```

**Ví dụ:**

✅ **TRÙNG LỊCH:**
- Task A: 10:00-11:00
- Task B: 10:30-11:30 (bắt đầu trong khi A đang diễn ra)

✅ **TRÙNG LỊCH:**
- Task A: 10:00-12:00
- Task B: 11:00-11:30 (hoàn toàn nằm trong A)

❌ **KHÔNG TRÙNG:**
- Task A: 10:00-11:00
- Task B: 11:00-12:00 (bắt đầu đúng khi A kết thúc)

### 3. Quy trình kiểm tra

```typescript
// Bước 1: User yêu cầu tạo task
"Tạo lịch họp 10h-11h ngày mai"

// Bước 2: AI parse thông tin
{
  title: "Họp",
  date: "2025-10-13",
  startTime: "10:00",
  endTime: "11:00"
}

// Bước 3: Kiểm tra trùng lịch
const conflictCheck = await checkScheduleConflicts(
  "2025-10-13",
  "10:00",
  "11:00",
  existingTasks
)

// Bước 4: Nếu có trùng lịch, hiển thị cảnh báo
if (conflictCheck.hasConflicts) {
  // Vẫn tạo task nhưng cảnh báo user
  message += `
  ⚠️ CẢNH BÁO TRÙNG LỊCH:
  - Họp với khách hàng (09:30-10:30) [Google Calendar]
  - Review code (10:00-11:00) [Task]
  
  ⚠️ Lịch này bị trùng với 2 sự kiện khác.
  `
}
```

## API Reference

### `checkScheduleConflicts()`

Kiểm tra xem một khoảng thời gian có bị trùng với các sự kiện hiện có không.

**Signature:**
```typescript
async function checkScheduleConflicts(
  date: string,           // "YYYY-MM-DD"
  startTime: string,      // "HH:MM"
  endTime: string,        // "HH:MM"
  existingTasks: Task[]   // Danh sách tasks hiện tại
): Promise<{
  hasConflicts: boolean
  conflicts: Array<{
    title: string
    date: string
    startTime: string
    endTime: string
    source: 'task' | 'calendar'
  }>
}>
```

**Parameters:**
- `date`: Ngày cần kiểm tra (format: YYYY-MM-DD)
- `startTime`: Thời gian bắt đầu (format: HH:MM, 24h)
- `endTime`: Thời gian kết thúc (format: HH:MM, 24h)
- `existingTasks`: Array các task hiện có

**Returns:**
- `hasConflicts`: `true` nếu có trùng lịch
- `conflicts`: Array các sự kiện bị trùng, mỗi item bao gồm:
  - `title`: Tiêu đề sự kiện
  - `date`: Ngày
  - `startTime`: Giờ bắt đầu
  - `endTime`: Giờ kết thúc
  - `source`: Nguồn gốc (`'task'` hoặc `'calendar'`)

**Example:**
```typescript
const result = await checkScheduleConflicts(
  "2025-10-13",
  "10:00",
  "11:00",
  tasks
)

if (result.hasConflicts) {
  console.log(`Tìm thấy ${result.conflicts.length} lịch trùng:`)
  result.conflicts.forEach(conflict => {
    console.log(`- ${conflict.title} (${conflict.startTime}-${conflict.endTime})`)
  })
}
```

## Use Cases

### Case 1: Tạo task trùng với task hiện có

**Input:**
```
User: "Tạo lịch họp 10h-11h ngày mai"
Existing tasks:
- Task "Review code" (2025-10-13, 10:00-11:00)
```

**Output:**
```
✅ Đã tạo task: Họp

📋 Chi tiết:
- Tiêu đề: Họp
- Ngày: 2025-10-13
- Thời gian: 10:00 - 11:00

⚠️ CẢNH BÁO TRÙNG LỊCH:
- Review code (10:00-11:00) [Task]

⚠️ Lịch này bị trùng với 1 sự kiện khác. Bạn có thể chỉnh sửa thời gian hoặc xác nhận tạo task này.
```

### Case 2: Tạo task trùng với Google Calendar

**Input:**
```
User: "Đặt lịch gym 18h-19h hôm nay"
Google Calendar:
- Event "Họp với khách hàng" (18:00-19:00)
```

**Output:**
```
✅ Đã tạo task: Gym

📋 Chi tiết:
- Tiêu đề: Gym
- Ngày: 2025-10-12
- Thời gian: 18:00 - 19:00

⚠️ CẢNH BÁO TRÙNG LỊCH:
- Họp với khách hàng (18:00-19:00) [Google Calendar]

⚠️ Lịch này bị trùng với 1 sự kiện khác. Bạn có thể chỉnh sửa thời gian hoặc xác nhận tạo task này.
```

### Case 3: Tạo task trùng nhiều sự kiện

**Input:**
```
User: "Tạo lịch học tiếng Anh 10h-12h ngày mai"
Conflicts:
- Task "Họp team" (10:00-11:00)
- Calendar "Review code" (11:00-12:00)
```

**Output:**
```
✅ Đã tạo task: Học tiếng Anh

📋 Chi tiết:
- Tiêu đề: Học tiếng Anh
- Ngày: 2025-10-13
- Thời gian: 10:00 - 12:00

⚠️ CẢNH BÁO TRÙNG LỊCH:
- Họp team (10:00-11:00) [Task]
- Review code (11:00-12:00) [Google Calendar]

⚠️ Lịch này bị trùng với 2 sự kiện khác. Bạn có thể chỉnh sửa thời gian hoặc xác nhận tạo task này.
```

### Case 4: Không có trùng lịch

**Input:**
```
User: "Tạo lịch đi chạy 6h sáng mai"
No conflicts
```

**Output:**
```
✅ Đã tạo task: Đi chạy

📋 Chi tiết:
- Tiêu đề: Đi chạy
- Ngày: 2025-10-13
- Thời gian: 06:00 - 07:00

💡 Task đã được tạo và lưu vào danh sách. Bạn có thể đồng bộ lên Google Calendar từ sidebar hoặc nói "đồng bộ task đi chạy".
```

## Implementation Details

### File: `googleCalendar.ts`

**Function: `checkScheduleConflicts()`**

```typescript
export async function checkScheduleConflicts(
  date: string,
  startTime: string,
  endTime: string,
  existingTasks: Array<{ date: string; startTime: string; endTime: string; title: string }>
): Promise<{
  hasConflicts: boolean
  conflicts: Array<{
    title: string
    date: string
    startTime: string
    endTime: string
    source: 'task' | 'calendar'
  }>
}>
```

**Thuật toán:**

1. **Check local tasks:**
   ```typescript
   for (const task of existingTasks) {
     if (task.date === date && isTimeOverlap(...)) {
       conflicts.push({ ...task, source: 'task' })
     }
   }
   ```

2. **Check Google Calendar events:**
   ```typescript
   if (isConnectedToCalendar) {
     const { events } = await fetchCalendarEventsForMonth(...)
     for (const event of events) {
       if (isTimeOverlap(...)) {
         conflicts.push({ ...event, source: 'calendar' })
       }
     }
   }
   ```

3. **Time overlap detection:**
   ```typescript
   const isTimeOverlap = (start1, end1, start2, end2) => {
     const start1Minutes = convertToMinutes(start1)
     const end1Minutes = convertToMinutes(end1)
     const start2Minutes = convertToMinutes(start2)
     const end2Minutes = convertToMinutes(end2)
     
     return start1Minutes < end2Minutes && start2Minutes < end1Minutes
   }
   ```

### File: `ChatInterface.tsx`

**Integration trong `handleSendMessage()`:**

```typescript
case 'create_task': {
  // Kiểm tra trùng lịch
  const conflictCheck = await checkScheduleConflicts(
    data.task.date,
    data.task.startTime,
    data.task.endTime,
    tasks
  )
  
  // Tạo cảnh báo nếu có trùng
  let conflictWarning = ''
  if (conflictCheck.hasConflicts) {
    conflictWarning = `
    ⚠️ CẢNH BÁO TRÙNG LỊCH:
    ${conflictCheck.conflicts.map(c => 
      `- ${c.title} (${c.startTime}-${c.endTime}) [${c.source === 'calendar' ? 'Google Calendar' : 'Task'}]`
    ).join('\n')}
    
    ⚠️ Lịch này bị trùng với ${conflictCheck.conflicts.length} sự kiện khác.
    `
  }
  
  // Tạo task và hiển thị cảnh báo
  const newTask = { ...data.task, id: generateId(), ... }
  setTasks([newTask, ...tasks])
  
  setMessages([...messages, {
    content: `✅ Task created\n${conflictWarning}`,
    ...
  }])
}
```

## Error Handling

### 1. Google Calendar không kết nối
```typescript
// Vẫn check local tasks, bỏ qua calendar events
if (token && !isTokenExpired()) {
  try {
    // Check calendar events
  } catch (error) {
    console.error('Error checking calendar conflicts:', error)
    // Continue even if calendar check fails
  }
}
```

### 2. Token hết hạn
```typescript
if (isTokenExpired()) {
  console.warn('⚠️ Google Calendar token expired')
  disconnectGoogleCalendar()
  // Chỉ check local tasks
}
```

### 3. Network error
```typescript
try {
  const { events } = await fetchCalendarEventsForMonth(...)
} catch (error) {
  console.error('Error checking calendar conflicts:', error)
  // Continue with local tasks only
}
```

## Testing

### Test Cases

**TC1: Trùng lịch với task cùng thời gian**
- Input: Task A (10:00-11:00), Create Task B (10:00-11:00)
- Expected: Conflict detected

**TC2: Trùng lịch với task overlap một phần**
- Input: Task A (10:00-11:00), Create Task B (10:30-11:30)
- Expected: Conflict detected

**TC3: Trùng lịch với Google Calendar event**
- Input: Calendar Event (14:00-15:00), Create Task (14:30-15:30)
- Expected: Conflict detected

**TC4: Không trùng lịch**
- Input: Task A (10:00-11:00), Create Task B (11:00-12:00)
- Expected: No conflict

**TC5: Trùng nhiều sự kiện**
- Input: Task A (10:00-11:00), Calendar B (11:00-12:00), Create Task C (10:30-11:30)
- Expected: 2 conflicts detected

**TC6: All-day events được bỏ qua**
- Input: Calendar Event (all-day), Create Task (10:00-11:00)
- Expected: No conflict (all-day events are skipped)

**TC7: Calendar không kết nối**
- Input: No calendar connection, Task A (10:00-11:00), Create Task B (10:00-11:00)
- Expected: Conflict with Task A only

### Manual Testing

```bash
# Test 1: Tạo task trùng với task hiện có
1. Tạo task "Họp team" 10:00-11:00 ngày mai
2. Nói: "Tạo lịch review code 10:30-11:30 ngày mai"
3. Verify: Cảnh báo trùng lịch xuất hiện

# Test 2: Tạo task trùng với Google Calendar
1. Kết nối Google Calendar với event 14:00-15:00 hôm nay
2. Nói: "Đặt lịch gym 14:30-15:30 hôm nay"
3. Verify: Cảnh báo trùng với Google Calendar event

# Test 3: Không có trùng lịch
1. Nói: "Tạo lịch đi chạy 6h sáng mai"
2. Verify: Không có cảnh báo trùng lịch
```

## Future Improvements

### 1. Smart suggestions
- Đề xuất thời gian trống kế tiếp khi phát hiện trùng lịch
- "Lịch bị trùng. Bạn có muốn đặt lúc 11:00-12:00 không?"

### 2. Auto-resolve conflicts
- Cho phép user chọn override hoặc adjust thời gian
- "Xóa lịch cũ và tạo lịch mới?" / "Đổi thành 11:00-12:00?"

### 3. Priority-based conflicts
- Tasks với priority cao có thể override tasks priority thấp
- Cảnh báo nghiêm trọng hơn khi trùng với important events

### 4. Recurring events
- Phát hiện trùng lịch với recurring events (hàng ngày, hàng tuần)
- "Lịch này trùng với lịch họp định kỳ mỗi thứ 2"

### 5. Buffer time
- Thêm khoảng thời gian đệm giữa các events
- Cảnh báo nếu 2 events quá gần nhau (< 15 phút)

## Conclusion

Tính năng phát hiện trùng lịch giúp:
- ✅ Tránh double-booking
- ✅ Cảnh báo kịp thời khi có xung đột
- ✅ Tích hợp với cả local tasks và Google Calendar
- ✅ Không ngăn cản user tạo task (chỉ cảnh báo)
- ✅ Error handling robust cho các trường hợp edge

User vẫn có toàn quyền quyết định có tạo task hay không sau khi được cảnh báo.
