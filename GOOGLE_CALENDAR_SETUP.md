# Google Calendar Sync Setup Guide

This guide will help you fix the "Unable to obtain Google credentials" error.

## Prerequisites

1. Google Cloud Console account
2. OAuth 2.0 Client ID credentials

## Step 1: Set Up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure the OAuth consent screen if prompted:
   - User Type: External (for testing)
   - Add required info (app name, user support email, developer contact)
   - Scopes: Add `https://www.googleapis.com/auth/calendar.events`
   - Test users: Add your Google account email

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "FocusPlan Web"
   - Authorized JavaScript origins:
     - `http://localhost:8081`
     - `https://focusplan.around-ai.com` (or your production URL)
   - Authorized redirect URIs:
     - `http://localhost:8081`
     - `https://focusplan.around-ai.com` (or your production URL)
     - For Expo: `https://auth.expo.io/@your-username/focusplan`

5. Save the **Client ID** and **Client Secret**

## Step 3: Update Environment Variables

Update your `.env` file with the Client ID:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_WEB_CLIENT_ID=your-client-id-here.apps.googleusercontent.com

# Optional: for production
WEBSITE_URL_PROD=https://focusplan.around-ai.com
WEBSITE_URL_LOCAL=http://localhost:8081
```

## Step 4: Deploy Your API Endpoint

Your app needs the `/api/sync-task` endpoint to be accessible. Options:

### Option A: Deploy to Vercel (Recommended)

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy
4. Update `.env` with your Vercel URL:
   ```bash
   WEBSITE_URL_PROD=https://your-app.vercel.app
   ```

### Option B: Run Locally

1. Install dependencies: `npm install`
2. Start the dev server: `npm start`
3. The API will be available at `http://localhost:8081/api/sync-task`

## Step 5: Test the Integration

1. Clear app storage (if testing locally)
2. Restart your app
3. Try to sync a task
4. Check the console for detailed logs

## Troubleshooting

### Error: "Unable to obtain Google credentials"

**Possible causes:**
1. **Token expired** - Sign out and sign in again
2. **Wrong Client ID** - Verify your `.env` file
3. **Missing scopes** - Ensure `calendar.events` scope is granted
4. **Redirect URI mismatch** - Check Google Console settings match your app

**Solution:**
- Clear app storage
- Sign out completely
- Restart the app
- Sign in again

### Error: "Failed to sync calendar event (status 401)"

**Cause:** Invalid or expired access token

**Solution:**
1. Check if your Google OAuth consent screen is properly configured
2. Ensure the user has granted calendar access
3. Try disconnecting and reconnecting your Google account

### Error: "Failed to sync calendar event (status 403)"

**Cause:** Permission denied

**Solution:**
1. Verify Google Calendar API is enabled in Google Cloud Console
2. Check that the OAuth consent screen includes the calendar scope
3. Ensure the test user is added (if in testing mode)

### Error: "Network request failed"

**Cause:** Cannot reach the API endpoint

**Solution:**
1. Verify the API endpoint URL in `app.config.ts`
2. Check that your backend is running
3. For web: Check CORS settings in `api/sync-task.ts`

## Verification Checklist

- [ ] Google Calendar API is enabled
- [ ] OAuth Client ID is created (Web application type)
- [ ] Redirect URIs are configured correctly
- [ ] `.env` file contains correct Client ID
- [ ] API endpoint is accessible
- [ ] User has granted calendar access
- [ ] Token is not expired

## Additional Notes

### For Mobile (iOS/Android)

You'll need additional Client IDs:

1. **iOS Client ID:**
   - Application type: iOS
   - Bundle ID: `com.focusplan.app`

2. **Android Client ID:**
   - Application type: Android
   - Package name: `com.focusplan.app`
   - SHA-1 fingerprint: (Get from your keystore)

Add these to `.env`:
```bash
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

### OAuth Consent Screen Status

- **Testing mode:** Limited to test users only
- **Production mode:** Requires Google verification (can take weeks)
- For personal use, testing mode is sufficient

## Debugging Tips

1. **Enable verbose logging:**
   - Check browser console (for web)
   - Check terminal output (for mobile)
   - Look for authentication flow logs

2. **Test the token manually:**
   ```javascript
   // In browser console or app
   const token = await googleAuth.ensureAuthenticated();
   console.log('Token:', token);
   ```

3. **Verify API endpoint:**
   ```bash
   curl -X POST http://localhost:8081/api/sync-task \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"task":{"id":"test","title":"Test","scheduledTime":"2025-10-06T10:00:00Z"}}'
   ```

## Support

If you continue to experience issues:
1. Check the app console logs for detailed error messages
2. Verify all credentials are correctly configured
3. Ensure the Google Calendar API quota hasn't been exceeded
4. Try with a fresh Google account to rule out account-specific issues
