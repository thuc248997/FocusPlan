# 🗑️ Xóa và Đồng bộ Task qua Chat

## 📋 Tổng quan

Giờ đây bạn có thể quản lý tasks hoàn toàn thông qua chat với AI:
- ✅ **Tạo** task
- 🗑️ **Xóa** task  
- 🔄 **Đồng bộ** task lên Google Calendar

Tất cả chỉ bằng cách nói chuyện tự nhiên với AI!

## 🎯 Các tính năng mới

### 1. 🗑️ Xóa Task

AI có thể tìm và xóa tasks dựa trên từ khóa bạn cung cấp.

#### Ví dụ câu lệnh:
```
✅ "Xóa lịch họp ngày mai"
✅ "Hủy task gym"
✅ "Bỏ cuộc hẹn với bác sĩ"
✅ "Xóa meeting với khách hàng"
✅ "Hủy lịch học tiếng Anh"
```

#### Cách hoạt động:

**Case 1: Tìm thấy 1 task duy nhất**
```
Bạn: "Xóa lịch họp với khách hàng"
AI: ✅ Đã xóa task: "Họp với khách hàng"
    - Ngày: 2025-10-13
    - Thời gian: 10:00 - 11:00
    - ✅ Đã xóa khỏi Google Calendar (nếu đã sync)
```

**Case 2: Không tìm thấy task**
```
Bạn: "Xóa lịch đi chơi"
AI: ❌ Không tìm thấy task nào có từ khóa "đi chơi".
    
    Danh sách tasks hiện tại:
    - Họp team
    - Gym
    - Học tiếng Anh
```

**Case 3: Tìm thấy nhiều tasks**
```
Bạn: "Xóa lịch họp"
AI: ⚠️ Tìm thấy 3 tasks khớp với "họp":
    
    1. Họp team (2025-10-13 09:00-10:00)
    2. Họp khách hàng (2025-10-14 14:00-15:00)
    3. Họp review (2025-10-15 16:00-17:00)
    
    Vui lòng chỉ rõ hơn task nào bạn muốn xóa.
```

#### Tự động xóa khỏi Google Calendar:
- Nếu task đã được đồng bộ (có `calendarEventId`)
- AI sẽ tự động xóa khỏi Google Calendar
- Sau đó xóa khỏi danh sách local

---

### 2. 🔄 Đồng bộ Task

AI có thể đồng bộ một task cụ thể hoặc tất cả tasks chưa sync lên Google Calendar.

#### Ví dụ câu lệnh:

**Đồng bộ một task:**
```
✅ "Đồng bộ task họp lên Google Calendar"
✅ "Sync lịch gym lên calendar"
✅ "Upload task học tiếng Anh lên Calendar"
```

**Đồng bộ tất cả:**
```
✅ "Đồng bộ tất cả tasks"
✅ "Sync tất cả lịch chưa sync"
✅ "Upload tất cả tasks lên Google Calendar"
```

#### Cách hoạt động:

**Case 1: Đồng bộ một task cụ thể**
```
Bạn: "Đồng bộ task gym"
AI: ✅ Đã đồng bộ task lên Google Calendar!
    
    📋 Task: Gym
    - Ngày: 2025-10-13
    - Thời gian: 06:00 - 07:00
    
    🎉 Task đã chuyển sang trạng thái "Đã đồng bộ" (màu xanh lá trong calendar).
```

**Case 2: Đồng bộ tất cả tasks**
```
Bạn: "Đồng bộ tất cả tasks"
AI: 📤 Kết quả đồng bộ:
    
    ✅ Gym
    ✅ Học tiếng Anh
    ✅ Meeting team
    ❌ Review code (lỗi)
    
    📊 Tổng kết:
    - Thành công: 3
    - Thất bại: 1
    - Tổng: 4
```

**Case 3: Task đã được đồng bộ**
```
Bạn: "Đồng bộ task gym"
AI: ✅ Task "gym" đã được đồng bộ lên Google Calendar trước đó rồi!
```

**Case 4: Chưa kết nối Google Calendar**
```
Bạn: "Đồng bộ tất cả tasks"
AI: ❌ Bạn chưa kết nối Google Calendar.
    
    Vui lòng kết nối Google Calendar từ sidebar để sử dụng tính năng đồng bộ.
```

**Case 5: Không có task chưa đồng bộ**
```
Bạn: "Đồng bộ tất cả tasks"
AI: ✅ Tất cả tasks đã được đồng bộ lên Google Calendar!
    
    📊 Thống kê:
    - Tổng số tasks: 5
    - Đã đồng bộ: 5
    - Chưa đồng bộ: 0
```

---

## 🔄 Workflow Examples

### Scenario 1: Tạo và đồng bộ task

```
1. Bạn: "Tạo lịch họp team ngày mai 9h"
   AI: ✅ Đã tạo task: Họp team
       (Task xuất hiện với màu cam - chưa đồng bộ)

2. Bạn: "Đồng bộ task họp team"
   AI: ✅ Đã đồng bộ task lên Google Calendar!
       (Task chuyển sang màu xanh lá - đã đồng bộ)
```

### Scenario 2: Tạo nhiều tasks rồi đồng bộ tất cả

```
1. Bạn: "Tạo lịch gym 6h sáng mai"
   AI: ✅ Đã tạo task: Gym

2. Bạn: "Tạo lịch học tiếng Anh 8h tối nay"
   AI: ✅ Đã tạo task: Học tiếng Anh

3. Bạn: "Đồng bộ tất cả tasks"
   AI: 📤 Kết quả đồng bộ:
       ✅ Gym
       ✅ Học tiếng Anh
       📊 Thành công: 2/2
```

### Scenario 3: Xóa task đã đồng bộ

```
1. Bạn: "Xóa lịch gym ngày mai"
   AI: ✅ Đã xóa task: "Gym"
       - Ngày: 2025-10-13
       - Thời gian: 06:00 - 07:00
       - ✅ Đã xóa khỏi Google Calendar
```

### Scenario 4: Quản lý task linh hoạt

```
1. Bạn: "Tạo 3 tasks: gym 6h, họp 9h, học tiếng Anh 20h, tất cả vào ngày mai"
   AI: (Có thể tạo từng task một hoặc hướng dẫn tạo riêng)

2. Bạn: "Đồng bộ task gym và họp"
   AI: (Đồng bộ từng task hoặc hướng dẫn)

3. Bạn: "Xóa task học tiếng Anh"
   AI: ✅ Đã xóa task: "Học tiếng Anh"
```

---

## 💡 Tips & Best Practices

### 1. Sử dụng từ khóa rõ ràng
**Tốt:**
- "Xóa lịch họp với khách hàng ABC"
- "Đồng bộ task gym buổi sáng"

**Chưa tốt:**
- "Xóa lịch" (quá mơ hồ)
- "Đồng bộ task" (không chỉ rõ task nào)

### 2. Xử lý nhiều kết quả
Khi AI tìm thấy nhiều tasks:
- Đọc danh sách AI cung cấp
- Dùng từ khóa cụ thể hơn
- Hoặc chỉ định ngày/giờ: "Xóa lịch họp ngày 13/10 lúc 9h"

### 3. Kiểm tra trước khi xóa
- Hỏi AI: "Tôi có những task nào?"
- Xác định task cần xóa
- Sau đó mới xóa

### 4. Đồng bộ hàng loạt
Nếu có nhiều tasks chưa sync:
- Dùng "Đồng bộ tất cả tasks" để sync một lần
- Nhanh hơn là sync từng task một

### 5. Kiểm tra kết nối
Trước khi đồng bộ:
- Đảm bảo đã kết nối Google Calendar
- Nếu chưa, kết nối từ sidebar

---

## 🔧 Technical Details

### Function Calling APIs

#### 1. Delete Task Function
```typescript
{
  name: 'delete_task',
  description: 'Xóa task dựa trên từ khóa',
  parameters: {
    taskIdentifier: string  // Từ khóa tìm kiếm
  }
}
```

#### 2. Sync Task Function
```typescript
{
  name: 'sync_task',
  description: 'Đồng bộ task lên Google Calendar',
  parameters: {
    taskIdentifier: string,  // Từ khóa (optional nếu syncAll=true)
    syncAll: boolean        // true = sync tất cả
  }
}
```

### Matching Algorithm

**Tìm task:**
```typescript
const matchingTasks = tasks.filter(task => 
  task.title.toLowerCase().includes(identifier) ||
  task.description.toLowerCase().includes(identifier)
)
```

**Ưu tiên:**
1. Khớp chính xác tiêu đề
2. Khớp một phần tiêu đề
3. Khớp trong mô tả

---

## 🧪 Test Cases

### Test 1: Xóa task thành công
```
Setup: Có task "Họp team" (2025-10-13 09:00)
Input: "Xóa lịch họp team"
Expected: 
- Task bị xóa khỏi danh sách
- Nếu đã sync, xóa khỏi Google Calendar
- AI confirm với chi tiết task đã xóa
```

### Test 2: Xóa task không tồn tại
```
Setup: Không có task nào có từ "gym"
Input: "Xóa task gym"
Expected:
- AI báo không tìm thấy
- Hiển thị danh sách tasks hiện tại
```

### Test 3: Đồng bộ một task
```
Setup: Có task "Gym" chưa sync, đã kết nối Calendar
Input: "Đồng bộ task gym"
Expected:
- Task được sync lên Google Calendar
- Task có calendarEventId
- Màu chuyển từ cam sang xanh lá
```

### Test 4: Đồng bộ tất cả tasks
```
Setup: Có 3 tasks chưa sync, đã kết nối Calendar
Input: "Đồng bộ tất cả tasks"
Expected:
- Tất cả 3 tasks được sync
- Hiển thị kết quả từng task
- Thống kê thành công/thất bại
```

### Test 5: Đồng bộ khi chưa kết nối Calendar
```
Setup: Chưa kết nối Google Calendar
Input: "Đồng bộ task gym"
Expected:
- AI báo chưa kết nối
- Hướng dẫn kết nối từ sidebar
```

---

## 📊 Action Summary

| Action | Câu lệnh mẫu | Yêu cầu | Kết quả |
|--------|-------------|---------|---------|
| **Tạo** | "Tạo lịch họp 10h" | - | Task mới (cam) |
| **Xóa** | "Xóa task gym" | Task tồn tại | Xóa local + Calendar |
| **Đồng bộ 1** | "Sync task gym" | Kết nối Calendar | Task → xanh lá |
| **Đồng bộ all** | "Sync tất cả" | Kết nối Calendar | All tasks → xanh lá |

---

## ⚠️ Error Handling

### 1. Task không tìm thấy
**Nguyên nhân:** Từ khóa không khớp với bất kỳ task nào  
**Giải pháp:** AI hiển thị danh sách tasks hiện tại

### 2. Nhiều kết quả
**Nguyên nhân:** Từ khóa quá chung chung  
**Giải pháp:** AI liệt kê tất cả, yêu cầu chỉ rõ hơn

### 3. Lỗi đồng bộ
**Nguyên nhân:** 
- Chưa kết nối Calendar
- Token hết hạn
- Lỗi mạng

**Giải pháp:** 
- Kiểm tra kết nối
- Reconnect Google Calendar
- Thử lại

### 4. Xóa khỏi Calendar thất bại
**Nguyên nhân:** Calendar API lỗi  
**Giải pháp:** 
- Task vẫn bị xóa local
- Log lỗi ra console
- Người dùng có thể xóa thủ công trên Google Calendar

---

## 🎯 Future Enhancements

- [ ] Xóa nhiều tasks cùng lúc
- [ ] Undo delete task
- [ ] Edit task qua chat
- [ ] Reschedule task qua chat
- [ ] Bulk operations (xóa tất cả tasks của tháng X)
- [ ] Smart suggestions (AI gợi ý task nào nên xóa)
- [ ] Confirmation dialog trước khi xóa
- [ ] Archive thay vì delete

---

**Version**: 1.1.0  
**Last Updated**: 2025-10-12  
**New Features**: Delete task, Sync task via chat
