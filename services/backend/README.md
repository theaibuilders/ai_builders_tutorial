# Circle Headless API Authentication Backend

This is the Python FastAPI backend for authenticating AI Builders community members using Circle's Headless API.

## Features

- ✅ Circle Headless API integration
- ✅ Email/password login (Circle membership verification)
- ✅ Google OAuth login
- ✅ JWT token generation and validation
- ✅ User session management
- ✅ Protected API endpoints

## Prerequisites

- Python 3.8 or higher
- Circle Business plan or higher
- Circle community: community.theaibuilders.dev

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Circle API
CIRCLE_HEADLESS_TOKEN=your_headless_auth_token_here
CIRCLE_COMMUNITY_ID=your_community_id
CIRCLE_API_URL=https://app.circle.so/api/v1

# Google OAuth
GOOGLE_CLIENT_ID=695004012662-a3981egieh12pqcbb57sbiug99b48mos.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-Z57roRadsZ74hWhr0U-Jl3TP_OG

# Your App
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS
FRONTEND_URL=http://localhost:4321
```

### 4. Get Circle API Token

1. Go to Circle admin → Settings → Developers → Tokens
2. Click "Create API Token"
3. Select "Headless Auth"
4. Name it: "Custom Web App Auth"
5. Copy and add to `.env`

## Running the Server

### Development Mode

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Deploying to Zeabur (or other platforms)

For production deployment, you need to:

1. **Set the `ENV_FILE` environment variable** to `.env.prod`:
   ```bash
   export ENV_FILE=.env.prod
   ```

2. **Or set environment variables directly** in your deployment platform:
   - `FRONTEND_URL=https://tutorial.theaibuilders.dev`
   - `CIRCLE_HEADLESS_TOKEN=your_token`
   - `CIRCLE_COMMUNITY_ID=your_id`
   - `GOOGLE_CLIENT_ID=your_client_id`
   - `GOOGLE_CLIENT_SECRET=your_secret`
   - `JWT_SECRET=your_secret_key`

3. **Ensure CORS is properly configured** - The backend automatically includes both:
   - The `FRONTEND_URL` from environment variables
   - `https://tutorial.theaibuilders.dev` as a hardcoded fallback

4. **Start the server**:
   ```bash
   ENV_FILE=.env.prod uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

## API Endpoints

### Authentication

#### POST `/auth/login`
Login with email and password (verifies Circle membership)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### POST `/auth/google`
Login with Google OAuth

**Request:**
```json
{
  "credential": "google_oauth_credential_token"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### GET `/auth/me`
Get current authenticated user (requires Bearer token)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
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

**Request:**
```json
{
  "refresh_token": "circle_refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_circle_token",
  "refresh_token": "new_refresh_token",
  "expires_in": 3600
}
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration and environment variables
├── models.py              # Pydantic models
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (not in git)
├── .env.example          # Environment variables template
├── services/
│   ├── circle_service.py # Circle API integration
│   └── auth_service.py   # JWT and Google OAuth
├── routers/
│   └── auth.py           # Authentication endpoints
└── middleware/
    └── auth_middleware.py # Token verification middleware
```

## Security Notes

1. **Never commit `.env`** - It contains sensitive credentials
2. **Change JWT_SECRET** - Use a strong, unique secret key
3. **HTTPS in production** - Always use HTTPS in production
4. **Token expiration** - Tokens expire after 7 days by default
5. **CORS configuration** - Update FRONTEND_URL for your domain

## Testing

### Test Health Check
```bash
curl http://localhost:8000/health
```

### Test Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Get Current User
```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer <your_token>"
```

## Troubleshooting

### Import Errors
Make sure you're in the backend directory and virtual environment is activated:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### CORS Errors
Check that FRONTEND_URL in `.env` matches your frontend URL.

### Circle API Errors
- Verify your Circle API token is valid
- Ensure you have Headless Auth permissions
- Check that the community ID is correct

## License

MIT
