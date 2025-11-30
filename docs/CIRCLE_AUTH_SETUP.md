# Circle Headless API Authentication Setup Guide

Complete setup guide for implementing Circle authentication in the AI Builders Tutorial platform.

## 🎯 Overview

This implementation provides:
- Python FastAPI backend with Circle Headless API integration
- React (Preact) frontend login component
- Email/password authentication (verifies Circle membership)
- Google OAuth authentication
- JWT token management
- Protected routes and user sessions

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- Circle Business plan or higher
- Circle community: `community.theaibuilders.dev`

## 🚀 Quick Start

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Step 2: Get Circle API Token

1. Go to Circle admin: https://app.circle.so
2. Navigate to: Settings → Developers → Tokens
3. Click "Create API Token"
4. Select "Headless Auth" permission
5. Name it: "Custom Web App Auth"
6. Copy the token and add to `.env`:
   ```env
   CIRCLE_HEADLESS_TOKEN=your_token_here
   CIRCLE_COMMUNITY_ID=your_community_id
   ```

### Step 3: Start Backend Server

```bash
# From backend directory
python main.py

# Or using uvicorn
uvicorn main:app --reload
```

Backend will run at: http://localhost:8000

### Step 4: Start Frontend

```bash
# From project root
npm install  # If needed
npm run dev
```

Frontend will run at: http://localhost:4321

### Step 5: Test Login

Visit: http://localhost:4321/login

Try logging in with:
- Email/password (any password works, only Circle membership is verified)
- Google OAuth (must be a Circle community member)

## 📁 Project Structure

```
ai_builders_tutorial/
├── backend/
│   ├── main.py                      # FastAPI app entry point
│   ├── config.py                    # Environment configuration
│   ├── models.py                    # Pydantic data models
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Environment variables (create this)
│   ├── .env.example                 # Environment template
│   ├── services/
│   │   ├── circle_service.py        # Circle API integration
│   │   └── auth_service.py          # JWT & Google OAuth
│   ├── routers/
│   │   └── auth.py                  # Auth endpoints
│   └── middleware/
│       └── auth_middleware.py       # Token verification
│
└── src/
    ├── islands/
    │   └── LoginForm.tsx            # Login component
    ├── pages/
    │   └── login.astro              # Login page
    └── types/
        └── google-signin.d.ts       # TypeScript definitions
```

## 🔑 Environment Variables

Create `backend/.env`:

```env
# Circle API Configuration
CIRCLE_HEADLESS_TOKEN=your_headless_auth_token_here
CIRCLE_COMMUNITY_ID=your_community_id
CIRCLE_API_URL=https://app.circle.so/api/v1

# Google OAuth Configuration
GOOGLE_CLIENT_ID=695004012662-a3981egieh12pqcbb57sbiug99b48mos.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-Z57roRadsZ74hWhr0U-Jl3TP_OG

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# CORS Configuration
FRONTEND_URL=http://localhost:4321
```

### Important Security Notes:

1. **JWT_SECRET**: Generate a strong random secret:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Never commit `.env`**: Already in `.gitignore`

3. **Production settings**:
   - Use HTTPS
   - Update FRONTEND_URL to your production domain
   - Use environment-specific secrets

## 🔌 API Endpoints

### Authentication

#### POST `/auth/login`
Email/password login (verifies Circle membership)

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "any_password"
  }'
```

Response:
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer"
}
```

#### POST `/auth/google`
Google OAuth login

```bash
curl -X POST http://localhost:8000/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "google_credential_token"
  }'
```

#### GET `/auth/me`
Get current user (requires authentication)

```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "id": 12345,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://..."
}
```

#### POST `/auth/refresh`
Refresh Circle access token

```bash
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "circle_refresh_token"
  }'
```

### Health Check

```bash
curl http://localhost:8000/health
```

## 🎨 Frontend Usage

### Login Component

The `LoginForm` component handles:
- Email/password login
- Google OAuth login
- User session management
- Token storage (localStorage)
- Auto-login on page load

### Protected Routes Example

```typescript
// In your Astro component
const token = Astro.cookies.get('auth_token');

if (!token) {
  return Astro.redirect('/login');
}

// Verify token with backend
const response = await fetch('http://localhost:8000/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (!response.ok) {
  return Astro.redirect('/login');
}

const user = await response.json();
```

## 🧪 Testing

### Test Backend Health

```bash
curl http://localhost:8000/health
```

Expected: `{"status": "healthy"}`

### Test Login Flow

1. Visit http://localhost:4321/login
2. Enter Circle member email
3. Enter any password (membership is verified, not password)
4. Click "Login with Email"
5. Should see welcome message with user info

### Test Google Login

1. Visit http://localhost:4321/login
2. Click Google Sign-In button
3. Sign in with Google account
4. Must be a Circle community member
5. Should see welcome message

### Test Protected Endpoint

```bash
# Get token from login response
TOKEN="your_token_here"

# Test /auth/me endpoint
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Troubleshooting

### Backend Issues

**Module Import Errors**
```bash
# Ensure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

**Port Already in Use**
```bash
# Change port in main.py or use:
uvicorn main:app --reload --port 8001
```

**Circle API Errors**
- Check your Circle API token is valid
- Verify Headless Auth permission is enabled
- Confirm community ID is correct
- Test API token in Circle dashboard

### Frontend Issues

**CORS Errors**
- Check backend `FRONTEND_URL` matches frontend URL
- Verify CORS middleware in `main.py`
- Check browser console for specific error

**Google Sign-In Not Loading**
- Check Google Client ID is correct
- Verify script is loaded (check Network tab)
- Check browser console for errors

**Token Not Persisting**
- Check localStorage in browser DevTools
- Verify token is being saved after login
- Check for browser privacy settings blocking localStorage

## 🚢 Deployment

### Backend Deployment

**Docker** (recommended):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Environment Variables**:
- Set all `.env` variables in your hosting platform
- Use secrets management for sensitive data

### Frontend Deployment

Already configured with Astro - deploy as usual:

```bash
npm run build
```

Update `FRONTEND_URL` in backend `.env` to production URL.

## 📝 Next Steps

1. ✅ Add email verification flow
2. ✅ Implement password reset
3. ✅ Add role-based access control
4. ✅ Create user profile management
5. ✅ Add activity logging
6. ✅ Implement rate limiting
7. ✅ Add refresh token rotation

## 🤝 Support

For issues:
1. Check backend logs: `tail -f backend/logs.txt`
2. Check frontend console
3. Review Circle API status
4. Contact support@theaibuilders.dev

## 📚 Resources

- [Circle API Docs](https://api.circle.so/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Google Sign-In Docs](https://developers.google.com/identity/gsi/web)
- [JWT.io](https://jwt.io/)

## 📄 License

MIT License - See LICENSE file for details
