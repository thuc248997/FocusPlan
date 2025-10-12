# FocusPlan - Tích hợp Calendar AI

## 🚀 Tính năng mới: AI Chat với Context từ Google Calendar

### Mô tả
AI assistant giờ đây có thể truy cập lịch của bạn trong vòng 2 tháng tới để trả lời các câu hỏi về lịch trình một cách thông minh và chính xác.

### Cách hoạt động

#### 1. Backend API
- **`/api/calendar/context`**: Endpoint mới để lấy thông tin lịch trong 2 tháng tới
  - Lấy tối đa 250 sự kiện từ Google Calendar
  - Định dạng dữ liệu thành text summary cho AI
  - Bao gồm: ngày, giờ, tiêu đề, mô tả, địa điểm của mỗi sự kiện

#### 2. AI Integration
- **System Prompt**: AI được cung cấp context về lịch của người dùng
- **Smart Responses**: AI có thể trả lời câu hỏi về:
  - Lịch hôm nay/ngày mai/tuần sau
  - Thời gian rảnh để họp
  - Các cuộc họp sắp tới
  - Số lượng sự kiện trong khoảng thời gian
  - Chi tiết về một sự kiện cụ thể

#### 3. Auto-refresh
- Calendar context được tải khi kết nối Google Calendar
- Tự động refresh trước mỗi câu hỏi để đảm bảo thông tin mới nhất
- Không yêu cầu người dùng làm gì thêm

### Ví dụ câu hỏi có thể hỏi AI

```
✅ "Hôm nay tôi có lịch gì không?"
✅ "Tuần sau tôi bận vào ngày nào?"
✅ "Tôi có cuộc họp nào trong tháng này?"
✅ "Khi nào tôi rảnh để họp với khách hàng?"
✅ "Lịch của tôi vào thứ 5 tuần sau?"
✅ "Tóm tắt lịch trình của tôi trong 2 tuần tới"
✅ "Tôi có sự kiện nào ở Hà Nội không?"
```

### Cấu trúc File mới

```
src/
├── app/
│   └── api/
│       ├── chat/
│       │   └── route.ts          # ✅ Updated: Nhận calendar context
│       └── calendar/
│           └── context/
│               └── route.ts      # 🆕 New: API lấy calendar context
└── lib/
    └── googleCalendar.ts         # ✅ Updated: Thêm fetchCalendarContextForAI()
```

### Các thay đổi chính

#### 1. `/src/app/api/calendar/context/route.ts` (MỚI)
```typescript
// Lấy events trong 2 tháng tới
// Format thành text summary cho AI
// Trả về cả raw data và formatted summary
```

#### 2. `/src/lib/googleCalendar.ts`
```typescript
// Thêm function mới:
export async function fetchCalendarContextForAI()
```

#### 3. `/src/app/api/chat/route.ts`
```typescript
// Nhận calendarContext từ client
// Thêm vào system message cho AI
// AI có đầy đủ context để trả lời
```

#### 4. `/src/components/ChatInterface.tsx`
```typescript
// State mới: calendarContext
// Load context khi kết nối calendar
// Refresh context trước mỗi message
// Gửi context cùng với message đến API
```

### Bảo mật

- ✅ `.env.local` được bảo vệ bởi `.gitignore`
- ✅ API key chỉ được sử dụng ở server-side
- ✅ Calendar token được lưu ở localStorage (client-side)
- ✅ Mỗi request đều verify authorization token

### Hiệu năng

- **Lazy Loading**: Context chỉ được load khi cần
- **Caching**: Context được cache trong state
- **Smart Refresh**: Chỉ refresh khi cần thiết
- **Optimized**: Giới hạn 250 events để tránh overload

### Lưu ý quan trọng

1. **Google Calendar phải được kết nối** để AI có thể truy cập lịch
2. Nếu chưa kết nối, AI vẫn hoạt động bình thường nhưng không có thông tin lịch
3. Calendar context tự động refresh để đảm bảo dữ liệu mới nhất
4. AI sẽ trả lời dựa trên lịch trong vòng 2 tháng tới (từ thời điểm hiện tại)

### Testing

#### Test 1: Kiểm tra kết nối
```typescript
// Đăng nhập Google Calendar
// Mở Dev Console
// Kiểm tra: "📅 Calendar context loaded: X events"
```

#### Test 2: Hỏi AI về lịch
```
User: "Hôm nay tôi có lịch gì không?"
AI: [Trả lời dựa trên calendar context]
```

#### Test 3: Refresh context
```
// Tạo event mới trên Google Calendar
// Hỏi AI về event đó
// AI sẽ biết vì context được refresh tự động
```

### Khắc phục sự cố

**Vấn đề**: AI không biết lịch của tôi
- ✅ Kiểm tra đã kết nối Google Calendar chưa
- ✅ Xem console có lỗi "Failed to load calendar context" không
- ✅ Refresh trang và thử lại

**Vấn đề**: Calendar context bị outdated
- ✅ Context tự động refresh trước mỗi message
- ✅ Nếu vẫn cũ, disconnect và reconnect Google Calendar

**Vấn đề**: API quota exceeded
- ✅ Google Calendar API có giới hạn request/day
- ✅ Nếu gặp lỗi 429, đợi một lúc rồi thử lại

### Future Improvements

- [ ] Cache calendar context với expiry time
- [ ] Cho phép AI tạo/sửa/xóa events
- [ ] Hỗ trợ multiple calendars
- [ ] Smart suggestions dựa trên lịch
- [ ] Notification khi có conflict
- [ ] Export calendar summary

---

## 📊 Thống kê

- **Lines of Code Added**: ~300 lines
- **New Files**: 1 (calendar/context/route.ts)
- **Modified Files**: 3 (chat/route.ts, googleCalendar.ts, ChatInterface.tsx)
- **API Endpoints**: +1 (GET /api/calendar/context)
- **New Functions**: +2 (fetchCalendarContextForAI, formatCalendarSummaryForAI)
