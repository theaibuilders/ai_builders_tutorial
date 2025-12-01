# Google OAuth Configuration

## Issue
The application shows this error when using Google Sign-In:
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

## Root Cause
The Google OAuth Client ID `695004012662-a3981egieh12pqcbb57sbiug99b48mos.apps.googleusercontent.com` doesn't have the local development origin registered.

## Solution

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Find the OAuth 2.0 Client ID: `695004012662-a3981egieh12pqcbb57sbiug99b48mos.apps.googleusercontent.com`

### Step 2: Add Authorized Origins
Under "Authorized JavaScript origins", add the following URIs:

**Development:**
- `http://localhost:4321`
- `http://localhost:3000`

**Production:**
- `https://tutorial.theaibuilders.dev`
- `https://www.tutorial.theaibuilders.dev` (if using www subdomain)

### Step 3: Add Authorized Redirect URIs
Under "Authorized redirect URIs", ensure these are included:

**Development:**
- `http://localhost:4321/auth/callback`
- `http://localhost:3000/auth/callback`

**Production:**
- `https://tutorial.theaibuilders.dev/auth/callback`

### Step 4: Save Changes
Click "Save" at the bottom of the page.

## Verification

After updating the configuration:

1. Wait 5-10 minutes for changes to propagate
2. Clear browser cache and cookies
3. Reload the application
4. Try Google Sign-In again

## Alternative: Development OAuth Client

For better separation, you can create a separate OAuth client for development:

1. Click "Create Credentials" → "OAuth client ID"
2. Application type: "Web application"
3. Name: "AI Builders Tutorial - Development"
4. Add localhost origins only
5. Update `.env` with the new client ID:
   ```
   PUBLIC_GOOGLE_CLIENT_ID=your-new-dev-client-id.apps.googleusercontent.com
   ```

## Current Status

✅ Fixed Google button width issue (changed from '100%' to '350')
✅ Added autocomplete attributes to login forms
⚠️ **Action Required**: Update Google Cloud Console with authorized origins

## Security Notes

- Never commit OAuth client secrets to version control
- Use environment variables for client IDs
- Regularly rotate credentials
- Monitor OAuth usage in Google Cloud Console
