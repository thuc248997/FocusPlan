# 🔧 FIX: OAuth Failed Error

## ❌ Lỗi Hiện Tại

```
?error=oauth_failed
```

**Nguyên nhân:** `GOOGLE_CLIENT_SECRET` trong file `.env.local` vẫn là placeholder chưa được thay thế bằng giá trị thật.

## ✅ Cách Fix

### Bước 1: Lấy Client Secret

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project của bạn (hoặc tạo project mới)
3. Vào **APIs & Services** → **Credentials**
4. Tìm **OAuth 2.0 Client ID** với ID: `59647006711-rerc7dfnpes98nvcvfoe7fkpuudv99i3`
5. Click vào Client ID đó
6. Bạn sẽ thấy:
   - **Client ID**: `59647006711-rerc7dfnpes98nvcvfoe7fkpuudv99i3.apps.googleusercontent.com`
   - **Client secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx` ← Copy giá trị này

### Bước 2: Update .env.local

Mở file `.env.local` và thay thế:

```bash
# TRƯỚC (sai)
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# SAU (đúng)
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

**Lưu ý:** Thay `GOCSPX-xxxxxxxxxxxxxxxxxxxxx` bằng Client Secret thực tế của bạn.

### Bước 3: Kiểm Tra Redirect URI

Trong Google Cloud Console, đảm bảo **Authorized redirect URIs** có:

```
http://localhost:3000/api/auth/callback/google
```

**Cách thêm:**
1. Vào **Credentials** → Click vào OAuth 2.0 Client ID
2. Scroll xuống **Authorized redirect URIs**
3. Click **+ ADD URI**
4. Nhập: `http://localhost:3000/api/auth/callback/google`
5. Click **SAVE**

### Bước 4: Kiểm Tra Authorized JavaScript Origins

Thêm origin cho development:

```
http://localhost:3000
```

**Cách thêm:**
1. Trong OAuth Client ID settings
2. Scroll xuống **Authorized JavaScript origins**
3. Click **+ ADD URI**
4. Nhập: `http://localhost:3000`
5. Click **SAVE**

### Bước 5: Restart Server

```bash
# Dừng server (Ctrl + C trong terminal)
# Sau đó start lại:
npm run dev
```

### Bước 6: Test Lại

1. Mở http://localhost:3000
2. Click **"Connect Google Calendar"**
3. Đăng nhập Google
4. Cấp quyền

**Kết quả mong đợi:**
- ✅ Không có lỗi `oauth_failed`
- ✅ Avatar và email hiển thị
- ✅ Layout chia đôi
- ✅ Console log: `✅ Google Calendar connected successfully!`

## 🔍 Debug Logs

Sau khi fix, bạn sẽ thấy logs trong terminal như sau:

```
📝 OAuth Callback: { hasCode: true, hasError: false, error: null }
🔑 OAuth Config: {
  hasClientId: true,
  hasClientSecret: true,
  clientSecretValue: 'SET',
  redirectUri: 'http://localhost:3000/api/auth/callback/google'
}
🔄 Exchanging code for tokens...
✅ Tokens received successfully
👤 Fetching user info...
✅ User info received: { email: 'your@email.com', name: 'Your Name' }
✅ Redirecting to home with tokens
```

Và trong browser console:

```
💾 Storing tokens and user info...
✅ User info stored: your@email.com
✅ Tokens stored successfully
✅ Google Calendar connected successfully!
```

## ❌ Nếu Vẫn Lỗi

### Lỗi: "config_error"

**Kiểm tra:**
- File `.env.local` có tồn tại không?
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` có đúng không?
- `GOOGLE_CLIENT_SECRET` có phải là placeholder không?

**Fix:**
```bash
# Trong .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=59647006711-rerc7dfnpes98nvcvfoe7fkpuudv99i3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx  # Thay bằng giá trị thật
```

### Lỗi: "redirect_uri_mismatch"

**Kiểm tra console log:**
```
🔗 Redirect URI: http://localhost:3000/api/auth/callback/google
```

**Fix:** Thêm chính xác URI này vào Google Cloud Console.

### Lỗi: "access_denied"

**Nguyên nhân:** User từ chối cấp quyền.

**Fix:** Click "Connect" lại và chấp nhận quyền.

## 📋 Checklist

Trước khi test lại, đảm bảo:

- [ ] Client Secret đã được update trong `.env.local`
- [ ] Redirect URI đã được thêm vào Google Console
- [ ] JavaScript Origins đã được thêm vào Google Console
- [ ] Server đã được restart
- [ ] Browser cache đã được clear (Ctrl + Shift + R)

## 🎯 File .env.local Hoàn Chỉnh

```bash
# Google Calendar Integration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=59647006711-rerc7dfnpes98nvcvfoe7fkpuudv99i3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx

# App Configuration
NEXT_PUBLIC_APP_NAME="Chat AI"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

## 🚀 Sau Khi Fix Thành Công

Bạn sẽ thấy:

1. **Error banner** biến mất (hoặc không xuất hiện)
2. **Avatar** hiển thị ở sidebar
3. **Email** hiển thị ở sidebar
4. **Layout chia đôi**: Calendar (trái) + Chat (phải)
5. **Console logs** thành công (✅)
6. **No errors** trong browser console

## 💡 Tips

- **Không commit Client Secret vào Git!** (đã có trong `.gitignore`)
- Client Secret chỉ dùng cho development
- Production cần setup OAuth riêng
- Token expire sau 1 giờ (cần implement refresh)

---

**Next Step:** Sau khi fix, xem [SPLIT_LAYOUT_GUIDE.md](SPLIT_LAYOUT_GUIDE.md) để biết cách sử dụng tính năng mới.
