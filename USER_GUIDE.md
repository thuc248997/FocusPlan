# 🎯 Hướng dẫn sử dụng FocusPlan - AI Task & Calendar Manager

## 📋 Tổng quan tính năng

FocusPlan là ứng dụng quản lý lịch trình thông minh với AI, tích hợp Google Calendar và khả năng tạo task từ câu lệnh tự nhiên.

## ✨ Các tính năng chính

### 1. 💬 Chat với AI
- Hỏi đáp về lịch trình
- Tạo task/lịch từ câu lệnh tự nhiên
- AI hiểu ngữ cảnh và thông tin lịch của bạn

### 2. 📅 Quản lý lịch thông minh
- Xem lịch trong 2 tháng tới
- Tạo/Sửa/Xóa sự kiện
- Đồng bộ 2 chiều với Google Calendar

### 3. 🎨 Phân biệt màu sắc
- **Xanh dương (📅)**: Events từ Google Calendar
- **Xanh lá (✅)**: Tasks đã đồng bộ lên Google Calendar
- **Cam (⏳)**: Tasks chưa đồng bộ (chỉ lưu local)

## 🚀 Quick Start

### Bước 1: Mở ứng dụng
Truy cập `http://localhost:3000`

### Bước 2: Kết nối Google Calendar (tuỳ chọn)
1. Click "Kết nối Google Calendar" trong sidebar
2. Đăng nhập tài khoản Google
3. Cấp quyền truy cập calendar
4. Giao diện sẽ tự động hiển thị calendar bên phải

### Bước 3: Bắt đầu sử dụng

#### Cách 1: Tạo task từ Chat
```
Bạn: "Tạo lịch họp với khách hàng ngày mai lúc 10h"
AI: ✅ Đã tạo task: Họp với khách hàng
    📋 Chi tiết:
    - Ngày: 2025-10-13
    - Thời gian: 10:00 - 11:00
```

#### Cách 2: Hỏi về lịch
```
Bạn: "Hôm nay tôi có lịch gì không?"
AI: Hôm nay bạn có 2 sự kiện:
    - 10:00-11:00: Họp team
    - 14:00-15:00: Gặp khách hàng
```

#### Cách 3: Tìm thời gian rảnh
```
Bạn: "Tuần này tôi rảnh khi nào?"
AI: [Phân tích lịch và gợi ý thời gian rảnh]
```

## 📖 Ví dụ câu lệnh

### Tạo task/lịch:
```
✅ "Tạo lịch họp ngày mai lúc 10h"
✅ "Đặt lịch hẹn bác sĩ vào thứ 5 tuần sau 14h-15h"
✅ "Nhắc tôi học tiếng Anh vào 20h hôm nay"
✅ "Schedule meeting với team lúc 3pm ngày 20/10"
✅ "Tạo task đi gym 6h sáng thứ 2"
```

### Hỏi về lịch:
```
✅ "Hôm nay tôi có lịch gì?"
✅ "Tuần sau tôi bận vào ngày nào?"
✅ "Tháng này tôi có bao nhiêu cuộc họp?"
✅ "Khi nào tôi rảnh để họp với khách?"
✅ "Lịch của tôi vào thứ 5 tuần sau?"
```

### Tìm kiếm:
```
✅ "Tôi có cuộc họp nào với khách hàng ABC?"
✅ "Sự kiện nào ở Hà Nội?"
✅ "Meeting nào vào tuần sau?"
```

## 🎨 Giao diện Calendar

### Màu sắc và Icon:

| Loại | Màu | Icon | Ý nghĩa |
|------|-----|------|---------|
| Google Calendar Event | 🔵 Xanh dương | 📅 | Sự kiện từ Google Calendar |
| Synced Task | 🟢 Xanh lá | ✅ | Task đã đồng bộ lên Google Calendar |
| Unsynced Task | 🟠 Cam | ⏳ | Task chưa đồng bộ, chỉ lưu local |

### Thống kê (Footer):
- **Tổng số sự kiện**: Tổng cộng tất cả items
- **Google Calendar**: Số events từ Google
- **Đã đồng bộ**: Số tasks đã sync
- **Chưa đồng bộ**: Số tasks chỉ có local

## 🔄 Đồng bộ Google Calendar

### Cách 1: Khi tạo task mới
1. Tạo task từ sidebar (New Task)
2. Điền thông tin
3. Check ✅ "Sync to Google Calendar"
4. Click "Create Task"
→ Task sẽ có màu xanh lá (✅)

### Cách 2: Đồng bộ task đã tạo
1. Click vào task trong sidebar
2. Mở modal edit
3. Check ✅ "Sync to Google Calendar"
4. Click "Update Task"
→ Task chuyển từ cam (⏳) sang xanh lá (✅)

## 💡 Tips & Tricks

### 1. Tạo task nhanh
Chỉ cần nói với AI, không cần mở modal:
```
"Tạo lịch họp ngày mai 10h"
```

### 2. Xem lịch tháng khác
Click nút ◀️ ▶️ trên calendar để xem tháng trước/sau

### 3. Kiểm tra chi tiết
Click vào bất kỳ event/task nào trong calendar để xem chi tiết

### 4. Tìm thời gian rảnh
Hỏi AI: "Khi nào tôi rảnh tuần này?"

### 5. Thống kê nhanh
Nhìn vào footer calendar để biết tổng số sự kiện và trạng thái đồng bộ

## ⚙️ Cài đặt & Cấu hình

### Requirements:
- Node.js 18+
- npm hoặc yarn
- Google Cloud Project (cho Calendar API)
- OpenAI API Key

### Environment Variables (.env.local):
```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Google Calendar
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# App Info
NEXT_PUBLIC_APP_NAME="FocusPlan"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Chạy ứng dụng:
```bash
npm install
npm run dev
```

## 📱 Workflow Examples

### Scenario 1: Lên kế hoạch tuần
```
1. Mở calendar, xem tuần tới
2. Hỏi AI: "Tuần sau tôi có lịch gì?"
3. AI liệt kê các events
4. Tạo task mới: "Tạo lịch review code thứ 3 lúc 2h"
5. Task xuất hiện ngay trong calendar (màu cam)
6. Mở task từ sidebar, check "Sync to Calendar"
7. Task chuyển sang màu xanh lá
```

### Scenario 2: Tìm thời gian họp
```
1. Khách hàng hỏi: "Tuần này bạn rảnh khi nào?"
2. Hỏi AI: "Tuần này tôi rảnh khi nào để họp?"
3. AI phân tích và gợi ý các khoảng trống
4. Tạo lịch: "Đặt lịch họp khách hàng thứ 4 lúc 3h"
5. Task được tạo và có thể sync ngay
```

### Scenario 3: Quản lý task hàng ngày
```
1. Sáng: "Hôm nay tôi có việc gì?"
2. AI liệt kê các tasks
3. Chiều: "Tạo task tổng kết công việc lúc 5h"
4. Tối: Review calendar, đồng bộ các task quan trọng
```

## 🐛 Troubleshooting

### Vấn đề: AI không tạo task
**Giải pháp**: 
- Thử câu lệnh rõ ràng hơn: "Tạo lịch [tên] vào [ngày] lúc [giờ]"
- Kiểm tra OpenAI API key

### Vấn đề: Task không hiển thị trong calendar
**Giải pháp**:
- Đợi vài giây để localStorage sync
- Refresh trang

### Vấn đề: Không đồng bộ được lên Google Calendar
**Giải pháp**:
- Kiểm tra kết nối Google Calendar
- Disconnect và reconnect lại
- Kiểm tra Google Client Secret

### Vấn đề: Calendar không hiển thị events từ Google
**Giải pháp**:
- Reconnect Google Calendar
- Kiểm tra quyền truy cập calendar
- Xem console log để debug

## 📚 Documentation

Chi tiết các tính năng:
- [OpenAI Integration](./CALENDAR_AI_INTEGRATION.md)
- [Task Creation from Chat](./CHAT_TASK_CREATION.md)
- [Test Cases](./TEST_CASES.md)

## 🎯 Roadmap

### Version 1.1 (Upcoming)
- [ ] Recurring tasks/events
- [ ] Task categories & tags
- [ ] Smart notifications
- [ ] Export calendar to PDF
- [ ] Mobile responsive

### Version 1.2 (Future)
- [ ] Multiple calendars support
- [ ] Team collaboration
- [ ] AI-powered scheduling suggestions
- [ ] Voice commands
- [ ] Integrations: Slack, Teams, etc.

## 🤝 Support

Nếu gặp vấn đề hoặc có câu hỏi:
1. Xem [Troubleshooting](#-troubleshooting)
2. Check console logs (F12 → Console)
3. Đọc documentation files

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-12  
**Built with**: Next.js 14, OpenAI GPT-4o-mini, Google Calendar API
