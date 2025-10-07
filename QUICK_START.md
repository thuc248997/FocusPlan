# Quick Start - Fixed Version

## What Was Fixed

The "Unable to obtain Google credentials" error has been fixed with the following improvements:

1. ✅ **Enhanced error messages** - Now shows specific reasons for auth failures
2. ✅ **Better logging** - Console logs throughout authentication flow
3. ✅ **Debug tools** - Configuration checker and debug component
4. ✅ **Complete documentation** - Step-by-step setup guides
5. ✅ **Dependency fixes** - All required packages installed

## Quick Setup (3 Steps)

### 1. Verify Your Configuration
```bash
npm run check:google
```

This checks if your `.env` file is properly set up. You should see all green checkmarks.

### 2. Ensure Google Cloud Console is Set Up

Required settings in [Google Cloud Console](https://console.cloud.google.com/):

- ✅ Google Calendar API **enabled**
- ✅ OAuth consent screen configured
- ✅ Scope `https://www.googleapis.com/auth/calendar.events` added
- ✅ Web OAuth Client ID created
- ✅ Redirect URIs configured:
  - `http://localhost:8081`
  - `https://auth.expo.io/@your-username/focusplan`

### 3. Run the App
```bash
npm start
```

Press `w` for web, or scan QR code for mobile.

## Testing the Fix

1. **Sign in with Google** - You should see detailed logs in console
2. **Add a task** - Fill in title and time
3. **Sync to calendar** - Click the sync button
4. **Check Google Calendar** - Event should appear

## If You Still Have Issues

### Enable Debug Mode

Add to your `App.tsx` (inside the main component):

```tsx
import { GoogleAuthDebug } from './src/components/GoogleAuthDebug';

// Add this component anywhere in your render:
<GoogleAuthDebug />
```

This shows real-time authentication status (only in dev mode).

### Check Console Logs

Look for these messages in your console:

✅ **Success:**
```
Starting sync for task: abc123
Got authentication token, syncing with Google Calendar...
Calendar event created/updated: xyz789
Task updated successfully
```

❌ **Failure - Common Issues:**

**"Token expired"**
```
Solution: Sign out and sign in again
```

**"Permission denied"**
```
Solution: Check Google Console - ensure Calendar API is enabled
```

**"Failed to sync calendar event (status 401)"**
```
Solution: Token invalid. Clear app storage and sign in again
```

**"Network request failed"**
```
Solution: Check that API endpoint is accessible
For local dev: Ensure http://localhost:8081/api/sync-task is running
```

## Detailed Guides

- **Setup Guide:** [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md)
- **All Fixes:** [FIXES.md](./FIXES.md)
- **Main README:** [README.md](./README.md)

## Common Commands

```bash
# Check configuration
npm run check:google

# Start dev server
npm start

# Run on web
npm run web

# Lint code
npm run lint
```

## Support

Still stuck? Check the detailed error message in:
1. App console (browser DevTools or terminal)
2. Debug component (if enabled)
3. [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) troubleshooting section

---

**The app is now fixed and ready to use!** 🎉

Main improvements:
- Clear, actionable error messages
- Detailed logging for debugging
- Configuration validation tools
- Comprehensive documentation

You should now see exactly what's wrong if authentication fails, instead of the generic "Unable to obtain Google credentials" error.
