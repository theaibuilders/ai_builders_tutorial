# Google OAuth Configuration for Local Development

## Problem

When running the login page locally at `http://localhost:4321`, you may encounter this error:

```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

This happens because the Google OAuth Client ID is configured for production domains and doesn't include `localhost:4321` as an authorized origin.

## Solution

You have two options:

### Option 1: Create a Development Google OAuth Client (Recommended)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials

2. **Create a new OAuth 2.0 Client ID**
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "AI Builders Tutorial - Development"

3. **Add Authorized JavaScript origins**
   ```
   http://localhost:4321
   http://127.0.0.1:4321
   ```

4. **Add Authorized redirect URIs** (if needed)
   ```
   http://localhost:4321/login
   http://localhost:4321
   ```

5. **Copy the Client ID**
   - After creating, copy the Client ID

6. **Create `.env` file in `services/frontend/`**
   ```bash
   cd services/frontend
   cp .env.example .env
   ```

7. **Update the Client ID in `.env`**
   ```env
   PUBLIC_GOOGLE_CLIENT_ID=YOUR_DEVELOPMENT_CLIENT_ID_HERE
   PUBLIC_API_URL=http://localhost:8000
   ```

8. **Restart the frontend**
   ```bash
   make dev-frontend
   ```

### Option 2: Add localhost to Existing Client ID

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials

2. **Edit the existing OAuth 2.0 Client**
   - Find client ID: `695004012662-a3981egieh12pqcbb57sbiug99b48mos`
   - Click the edit (pencil) icon

3. **Add Authorized JavaScript origins**
   - Add: `http://localhost:4321`
   - Add: `http://127.0.0.1:4321`

4. **Save changes**

⚠️ **Warning**: This approach mixes development and production origins, which is not recommended for security reasons.

## Temporary Workaround: Disable Google Sign-In for Local Testing

If you just want to test email/password login locally, you can temporarily hide the Google Sign-In button:

1. **Edit `services/frontend/src/islands/LoginForm.tsx`**

2. **Comment out the Google Sign-In button section** (around line 225):
   ```tsx
   {/* Temporarily disabled for local development
   <div class="relative mb-6">
     <div class="absolute inset-0 flex items-center">
       <div class="w-full border-t border-gray-300"></div>
     </div>
     <div class="relative flex justify-center text-sm">
       <span class="px-2 bg-white text-gray-500">Or continue with</span>
     </div>
   </div>

   <div id="google-signin-button" class="flex justify-center"></div>
   */}
   ```

## Environment Variables

The frontend now supports these environment variables (create `.env` file):

```env
# Google OAuth Client ID
PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here

# Backend API URL
PUBLIC_API_URL=http://localhost:8000
```

## Testing

After configuration, test the Google Sign-In:

1. Visit: http://localhost:4321/login
2. Click "Sign in with Google"
3. The Google sign-in popup should appear without errors
4. Sign in with your Google account
5. You should be authenticated if you're a Circle community member

## Production Deployment

For production:

1. Use a separate OAuth Client ID for production
2. Add your production domain as an authorized origin
3. Set the `PUBLIC_GOOGLE_CLIENT_ID` environment variable in your hosting platform
4. Never commit `.env` files to version control

## Troubleshooting

### Still seeing the error?

1. **Clear browser cache** and reload
2. **Check the Console** for the actual Client ID being used
3. **Verify origins** in Google Cloud Console match exactly
4. **Wait a few minutes** - Changes to Google OAuth settings can take time to propagate

### Google Sign-In button not showing?

1. Check browser console for JavaScript errors
2. Verify the Google Sign-In script is loading
3. Check that `google-signin-button` element exists in the DOM

### Authentication fails after sign-in?

This is likely a backend issue:
1. Check that the backend is running on port 8000
2. Verify the Circle API credentials in `services/backend/.env`
3. Check backend logs for errors

## Related Files

- Frontend: `services/frontend/src/islands/LoginForm.tsx`
- Frontend env: `services/frontend/.env`
- Backend: `services/backend/.env`
- Documentation: `docs/CIRCLE_AUTH_SETUP.md`

## Support

If you continue to have issues:
1. Check the full error in browser DevTools console
2. Review Google Cloud Console audit logs
3. Contact: support@theaibuilders.dev
