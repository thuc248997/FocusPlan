# Test Cases - Calendar AI Integration

## Danh sách Test Cases

### Test 1: Kiểm tra API Calendar Context
**Mục đích**: Đảm bảo API `/api/calendar/context` hoạt động đúng

**Bước thực hiện**:
1. Kết nối Google Calendar
2. Mở DevTools Console
3. Chạy command:
```javascript
fetch('/api/calendar/context', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('google_calendar_token')
  }
})
.then(r => r.json())
.then(data => console.log('Calendar Context:', data))
```

**Kết quả mong đợi**:
- Response status: 200
- Data có chứa: `events`, `summary`, `totalEvents`
- `summary` là string có format đẹp với thông tin lịch

---

### Test 2: AI hiểu lịch của người dùng
**Mục đích**: Kiểm tra AI có nhận được calendar context

**Bước thực hiện**:
1. Đảm bảo Google Calendar đã kết nối và có ít nhất 1 event
2. Mở chat interface
3. Hỏi: "Hôm nay tôi có lịch gì không?"

**Kết quả mong đợi**:
- AI trả lời dựa trên lịch thực tế của bạn
- Nếu có lịch: AI liệt kê các events hôm nay
- Nếu không có: AI nói "Bạn không có lịch hẹn nào hôm nay"

---

### Test 3: AI tìm kiếm trong lịch
**Mục đích**: Kiểm tra AI có thể tìm kiếm thông tin cụ thể

**Bước thực hiện**:
1. Tạo một event trên Google Calendar với title "Họp với khách hàng ABC"
2. Đợi vài giây để sync
3. Hỏi AI: "Tôi có cuộc họp với khách hàng ABC không?"

**Kết quả mong đợi**:
- AI tìm thấy event và trả lời đúng
- AI cung cấp thông tin: ngày, giờ, địa điểm (nếu có)

---

### Test 4: Tìm thời gian rảnh
**Mục đích**: Kiểm tra AI có thể phân tích lịch để tìm khoảng trống

**Bước thực hiện**:
1. Đảm bảo có một số events trong tuần
2. Hỏi: "Tuần này tôi rảnh vào thời gian nào?"

**Kết quả mong đợi**:
- AI phân tích lịch
- Đưa ra gợi ý về các khoảng thời gian rảnh
- Hoặc nói rằng không có thời gian rảnh nếu lịch đầy

---

### Test 5: Thống kê lịch
**Mục đích**: Kiểm tra AI có thể đếm và thống kê

**Bước thực hiện**:
1. Hỏi: "Tôi có bao nhiêu cuộc họp trong tháng này?"
2. Hoặc: "Tuần sau tôi bận bao nhiêu ngày?"

**Kết quả mong đợi**:
- AI đếm chính xác số lượng events
- Trả lời với số liệu cụ thể

---

### Test 6: Calendar context refresh
**Mục đích**: Đảm bảo context được refresh khi có thay đổi

**Bước thực hiện**:
1. Hỏi AI về lịch ngày mai
2. Tạo một event mới trên Google Calendar cho ngày mai
3. Đợi vài giây
4. Hỏi AI lại về lịch ngày mai

**Kết quả mong đợi**:
- Lần hỏi thứ 2, AI đã biết về event mới
- Context được refresh tự động

---

### Test 7: Không có kết nối Calendar
**Mục đích**: Kiểm tra AI hoạt động khi chưa kết nối calendar

**Bước thực hiện**:
1. Disconnect Google Calendar
2. Hỏi AI: "Hôm nay tôi có lịch gì?"

**Kết quả mong đợi**:
- AI vẫn trả lời được
- AI nói rằng không có thông tin lịch vì chưa kết nối
- Hoặc gợi ý kết nối Google Calendar

---

### Test 8: Lịch trong khoảng thời gian
**Mục đích**: Kiểm tra AI hiểu về khoảng thời gian

**Các câu hỏi test**:
- "Tuần sau tôi có lịch gì?"
- "Từ thứ 2 đến thứ 6 tuần này tôi bận không?"
- "Tháng sau tôi có cuộc họp nào quan trọng?"
- "2 tuần tới tôi có bao nhiêu events?"

**Kết quả mong đợi**:
- AI hiểu đúng khoảng thời gian
- Lọc và trả về đúng events trong khoảng đó

---

### Test 9: Chi tiết sự kiện
**Mục đích**: Kiểm tra AI cung cấp đầy đủ thông tin

**Bước thực hiện**:
1. Tạo event với đầy đủ: title, description, location, time
2. Hỏi: "Cho tôi biết chi tiết về [tên event]"

**Kết quả mong đợi**:
- AI trả về đầy đủ thông tin: ngày, giờ, địa điểm, mô tả
- Format dễ đọc

---

### Test 10: Error Handling
**Mục đích**: Kiểm tra xử lý lỗi

**Các trường hợp test**:
1. Token hết hạn
2. Mất kết nối internet
3. Google Calendar API down

**Kết quả mong đợi**:
- App không crash
- Hiển thị thông báo lỗi rõ ràng
- AI vẫn có thể trả lời các câu hỏi khác (không liên quan đến lịch)

---

## Checklist

- [ ] API `/api/calendar/context` trả về đúng dữ liệu
- [ ] Calendar context được load khi kết nối
- [ ] AI nhận được và sử dụng calendar context
- [ ] AI trả lời đúng về lịch hôm nay
- [ ] AI tìm kiếm được events cụ thể
- [ ] AI phân tích và gợi ý thời gian rảnh
- [ ] AI đếm và thống kê chính xác
- [ ] Context được refresh tự động
- [ ] Hoạt động tốt khi chưa kết nối calendar
- [ ] AI hiểu đúng các khoảng thời gian khác nhau
- [ ] Cung cấp đầy đủ chi tiết sự kiện
- [ ] Error handling hoạt động tốt

---

## Debug Commands

### Kiểm tra calendar token
```javascript
console.log('Token:', localStorage.getItem('google_calendar_token'))
console.log('Token expiry:', new Date(parseInt(localStorage.getItem('google_token_expiry'))))
```

### Test API trực tiếp
```javascript
// Get calendar context
fetch('/api/calendar/context', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('google_calendar_token')
  }
})
.then(r => r.json())
.then(console.log)

// Get events
fetch('/api/calendar/events', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('google_calendar_token')
  }
})
.then(r => r.json())
.then(console.log)
```

### Xem calendar context trong state
```javascript
// Mở React DevTools
// Tìm ChatInterface component
// Xem state: calendarContext
```
