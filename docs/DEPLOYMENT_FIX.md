# Deployment Fix for CORS Error

## Problem
The production frontend at `https://tutorial.theaibuilders.dev` is getting CORS errors when trying to authenticate with the backend at `https://api-backend.zeabur.app`.

**Error:**
```
Access to fetch at 'https://api-backend.zeabur.app/auth/login' from origin 'https://tutorial.theaibuilders.dev' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
The backend deployment on Zeabur is not loading the correct environment variables from `.env.prod`, so it's still using the default `FRONTEND_URL=http://localhost:4321` which doesn't include the production frontend domain.

## Solution Applied

### 1. Updated Backend CORS Configuration
**File:** `services/backend/main.py`

Added the production frontend URL as a hardcoded fallback in the CORS allowed origins:
```python
allow_origins=[
    settings.FRONTEND_URL,
    "http://localhost:4321",
    "http://localhost:3000",
    "https://tutorial.theaibuilders.dev"  # Production frontend
],
```

### 2. Made Environment File Configurable
**File:** `services/backend/config.py`

Updated to support loading from different environment files:
```python
class Config:
    # Use .env.prod in production, .env for local development
    env_file = os.getenv("ENV_FILE", ".env")
    env_file_encoding = "utf-8"
```

### 3. Updated .env.prod Files
- **Backend:** `FRONTEND_URL=https://tutorial.theaibuilders.dev`
- **Frontend:** `PUBLIC_API_URL=https://api-backend.zeabur.app`

## Actions Required on Zeabur

You need to configure the backend deployment on Zeabur with one of these options:

### Option 1: Set ENV_FILE Environment Variable (Recommended)
In Zeabur backend service settings, add:
```
ENV_FILE=.env.prod
```

### Option 2: Set Individual Environment Variables Directly
In Zeabur backend service settings, add these variables:
```
FRONTEND_URL=https://tutorial.theaibuilders.dev
CIRCLE_HEADLESS_TOKEN=<your_circle_token>
CIRCLE_COMMUNITY_ID=<your_community_id>
CIRCLE_API_URL=https://app.circle.so/api/v1
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
JWT_SECRET=<your_jwt_secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### Option 3: No Action Needed (Fallback)
The hardcoded production URL in `main.py` should work as a fallback even without environment variable changes, but it's better to configure it properly.

## Testing After Deployment

1. **Redeploy the backend** on Zeabur with the new code
2. **Test CORS** by trying to login from the production frontend
3. **Check logs** on Zeabur to ensure environment variables are loaded correctly
4. **Verify** the API response headers include:
   ```
   Access-Control-Allow-Origin: https://tutorial.theaibuilders.dev
   ```

## Verification Commands

Test the backend health:
```bash
curl https://api-backend.zeabur.app/health
```

Test CORS preflight (should return 200):
```bash
curl -X OPTIONS https://api-backend.zeabur.app/auth/login \
  -H "Origin: https://tutorial.theaibuilders.dev" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Test actual login:
```bash
curl -X POST https://api-backend.zeabur.app/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://tutorial.theaibuilders.dev" \
  -d '{"email": "test@example.com", "password": "test123"}' \
  -v
```

## Files Modified
- ✅ `services/backend/main.py` - Added production frontend URL to CORS
- ✅ `services/backend/config.py` - Made env file configurable
- ✅ `services/backend/.env.prod` - Updated with production frontend URL
- ✅ `services/frontend/.env.prod` - Updated with production backend URL
- ✅ `services/backend/README.md` - Added deployment instructions

## Next Steps
1. Deploy the updated backend code to Zeabur
2. Configure environment variables on Zeabur (see options above)
3. Restart the backend service
4. Test login from production frontend
