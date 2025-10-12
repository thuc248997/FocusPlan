# Console Errors Fix - Documentation

## Tổng quan

Đã fix tất cả các lỗi/warnings phiền phức trong console log để console sạch sẽ hơn khi development.

## Các lỗi đã fix

### 1. ✅ Warning: Extra attributes from the server: class

**Nguyên nhân:**
- Next.js hydration warning xảy ra khi className từ Google Fonts (Inter) không khớp giữa server và client
- Đây là lỗi phổ biến với Next.js font optimization

**Giải pháp:**
```tsx
// src/app/layout.tsx
<html lang="en" suppressHydrationWarning>
  <body className={inter.className} suppressHydrationWarning>
    {children}
  </body>
</html>
```

**Cách hoạt động:**
- Thêm `suppressHydrationWarning` prop vào `<html>` và `<body>` tags
- Next.js sẽ không show warning khi có mismatch nhỏ giữa server và client HTML

### 2. ✅ Unchecked runtime.lastError: Could not establish connection

**Nguyên nhân:**
- Lỗi này đến từ browser extensions (Grammarly, LastPass, v.v.)
- Extensions cố kết nối với page nhưng không tìm thấy receiver
- Không phải lỗi của app, chỉ là noise trong console

**Giải pháp:**
Tạo utility function để filter console errors:

```typescript
// src/lib/suppressErrors.ts
export function suppressBrowserExtensionErrors() {
  if (typeof window === 'undefined') return

  const originalError = console.error
  
  console.error = function (...args: any[]) {
    const errorMsg = args[0]?.toString?.() || ''
    
    const suppressPatterns = [
      'Could not establish connection',
      'Receiving end does not exist',
      'Extension context invalidated',
      'runtime.lastError',
    ]
    
    const shouldSuppress = suppressPatterns.some(pattern => 
      errorMsg.includes(pattern)
    )
    
    if (shouldSuppress) {
      return // Ignore extension errors
    }
    
    originalError.apply(console, args)
  }
}
```

**Sử dụng:**
```tsx
// src/app/page.tsx
import { suppressBrowserExtensionErrors } from '@/lib/suppressErrors'

export default function Home() {
  useEffect(() => {
    suppressBrowserExtensionErrors()
  }, [])
  
  // ... rest of component
}
```

## Files thay đổi

### 1. `/src/app/layout.tsx`
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
```

**Thay đổi:**
- ✅ Thêm `suppressHydrationWarning` vào `<html>` tag
- ✅ Thêm `suppressHydrationWarning` vào `<body>` tag

### 2. `/src/lib/suppressErrors.ts` (NEW FILE)
```typescript
/**
 * Suppress annoying console errors from browser extensions
 */
export function suppressBrowserExtensionErrors() {
  if (typeof window === 'undefined') return

  const originalError = console.error
  const originalWarn = console.warn

  // Override console.error
  console.error = function (...args: any[]) {
    const errorMsg = args[0]?.toString?.() || ''
    
    const suppressPatterns = [
      'Could not establish connection',
      'Receiving end does not exist',
      'Extension context invalidated',
      'runtime.lastError',
    ]
    
    const shouldSuppress = suppressPatterns.some(pattern => 
      errorMsg.includes(pattern)
    )
    
    if (!shouldSuppress) {
      originalError.apply(console, args)
    }
  }

  // Override console.warn
  console.warn = function (...args: any[]) {
    const warnMsg = args[0]?.toString?.() || ''
    
    const suppressPatterns = [
      'Extension context invalidated',
    ]
    
    const shouldSuppress = suppressPatterns.some(pattern => 
      warnMsg.includes(pattern)
    )
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args)
    }
  }
}
```

**Features:**
- ✅ Filter console.error messages
- ✅ Filter console.warn messages
- ✅ Preserve original console functionality
- ✅ Only suppress extension-related errors
- ✅ Real app errors vẫn được hiển thị

### 3. `/src/app/page.tsx`
```tsx
import { suppressBrowserExtensionErrors } from '@/lib/suppressErrors'

export default function Home() {
  // Suppress browser extension errors
  useEffect(() => {
    suppressBrowserExtensionErrors()
  }, [])
  
  // ... rest of component
}
```

**Thay đổi:**
- ✅ Import `suppressBrowserExtensionErrors`
- ✅ Call trong useEffect khi component mount
- ✅ Chỉ chạy một lần (empty deps array)

## Console log trước khi fix

```
❌ Warning: Extra attributes from the server: class
    at html
    at RootLayout (Server)
    ...

❌ Unchecked runtime.lastError: Could not establish connection. 
   Receiving end does not exist.

✅ 📅 Calendar context loaded: 4 events
```

## Console log sau khi fix

```
✅ 📅 Calendar context loaded: 4 events
```

**Kết quả:**
- ✅ Console sạch sẽ, chỉ hiển thị logs quan trọng
- ✅ Extension errors bị suppress
- ✅ Hydration warnings bị suppress
- ✅ Real errors vẫn được hiển thị bình thường

## Error Patterns được suppress

### Browser Extension Errors:
1. `Could not establish connection`
2. `Receiving end does not exist`
3. `Extension context invalidated`
4. `runtime.lastError`

### React Hydration:
1. `suppressHydrationWarning` on `<html>`
2. `suppressHydrationWarning` on `<body>`

## Lưu ý quan trọng

### ⚠️ Không suppress REAL errors

Utility chỉ suppress những errors cụ thể từ browser extensions. Tất cả errors khác từ app vẫn sẽ được hiển thị:

```typescript
// ✅ ĐƯỢC HIỂN THỊ
console.error('API call failed')
console.error('User not authenticated')
console.error('Task creation error')

// ❌ BỊ SUPPRESS
console.error('Could not establish connection. Receiving end does not exist.')
console.error('Extension context invalidated')
```

### ⚠️ Development vs Production

- **Development:** Extension errors có thể xuất hiện do nhiều extensions được cài
- **Production:** Ít extension errors hơn vì user thường có ít extensions

### ⚠️ Testing

Khi test app, hãy chắc chắn:
- ✅ Real errors vẫn hiển thị trong console
- ✅ Extension errors không spam console
- ✅ Hydration warnings không xuất hiện

## How to verify

### Test 1: Check hydration warning gone
```bash
1. npm run dev
2. Mở browser console
3. Reload page
4. Verify: Không có "Warning: Extra attributes from the server"
```

### Test 2: Check extension errors suppressed
```bash
1. npm run dev
2. Mở browser console (có extensions như Grammarly)
3. Verify: Không có "Could not establish connection" errors
```

### Test 3: Check real errors still show
```bash
1. npm run dev
2. Trigger một lỗi thật (VD: API call fail)
3. Verify: Error vẫn hiển thị trong console
```

## Future improvements

### 1. Configurable suppress patterns
```typescript
export function suppressBrowserExtensionErrors(
  customPatterns?: string[]
) {
  const patterns = [
    ...defaultPatterns,
    ...(customPatterns || [])
  ]
  // ...
}
```

### 2. Environment-based suppression
```typescript
export function suppressBrowserExtensionErrors() {
  // Only suppress in development
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  // ...
}
```

### 3. Logging statistics
```typescript
let suppressedCount = 0

console.error = function(...args) {
  if (shouldSuppress) {
    suppressedCount++
    return
  }
  // ...
}

// Show stats in dev tools
console.log(`Suppressed ${suppressedCount} extension errors`)
```

## Conclusion

✅ **Console đã sạch!**
- Hydration warnings: Fixed
- Extension errors: Suppressed
- Real errors: Still visible
- Developer experience: Improved

Bây giờ khi development, console chỉ hiển thị những thông tin quan trọng từ app, không còn bị spam bởi browser extension errors nữa! 🎉
