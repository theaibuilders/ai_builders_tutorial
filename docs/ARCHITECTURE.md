# Circle Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AI Builders Tutorial                         │
│                     (Astro + Preact Frontend)                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/JSON
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend (Port 8000)                     │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Routers   │  │  Services   │  │ Middleware  │                │
│  │             │  │             │  │             │                │
│  │ • /auth/    │  │ • Circle    │  │ • Auth      │                │
│  │   login     │  │   Service   │  │   Verify    │                │
│  │ • /auth/    │  │ • Auth      │  │             │                │
│  │   google    │  │   Service   │  │             │                │
│  │ • /auth/me  │  │             │  │             │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌──────────────────┐            ┌──────────────────┐
        │   Circle API     │            │   Google OAuth   │
        │                  │            │                  │
        │ • Headless Auth  │            │ • Sign-In API    │
        │ • Member Verify  │            │ • Token Verify   │
        │ • User Data      │            │                  │
        └──────────────────┘            └──────────────────┘
```

## Authentication Flow

### Email/Password Login

```
User
  │
  │ 1. Enter email & password
  ▼
LoginForm.tsx
  │
  │ 2. POST /auth/login
  ▼
FastAPI Backend
  │
  │ 3. Check Circle membership
  ▼
Circle API
  │
  │ 4. get_member_by_email()
  ▼
Circle Service
  │
  │ 5. Member exists?
  │
  ├─ No ──> 401 Unauthorized
  │
  └─ Yes ──> 6. get_auth_token()
              │
              │ 7. Generate Circle token
              ▼
          Circle API
              │
              │ 8. Return Circle tokens
              ▼
          Auth Service
              │
              │ 9. Create JWT token
              │    (embed Circle token + user data)
              ▼
          LoginForm.tsx
              │
              │ 10. Store JWT in localStorage
              │ 11. Update UI with user info
              ▼
          Dashboard/Home
```

### Google OAuth Login

```
User
  │
  │ 1. Click "Sign in with Google"
  ▼
Google Sign-In SDK
  │
  │ 2. Google authentication popup
  ▼
User authorizes
  │
  │ 3. Receive Google credential
  ▼
LoginForm.tsx
  │
  │ 4. POST /auth/google {credential}
  ▼
FastAPI Backend
  │
  │ 5. Verify Google token
  ▼
Google OAuth API
  │
  │ 6. Return user info (email, name, etc.)
  ▼
Auth Service
  │
  │ 7. Check Circle membership by email
  ▼
Circle API
  │
  │ 8. Member exists?
  │
  ├─ No ──> 401 Unauthorized
  │
  └─ Yes ──> 9. Generate Circle token
              │
              │ 10. Create JWT with Google ID
              ▼
          LoginForm.tsx
              │
              │ 11. Store JWT in localStorage
              ▼
          Dashboard/Home
```

## Component Architecture

### Backend Structure

```
backend/
│
├── main.py                        # FastAPI app initialization
│   ├── CORS middleware
│   ├── Route registration
│   └── Exception handlers
│
├── config.py                      # Settings management
│   └── Environment variables
│       ├── Circle API config
│       ├── Google OAuth config
│       ├── JWT config
│       └── CORS config
│
├── models.py                      # Data models
│   ├── UserLogin
│   ├── GoogleLogin
│   ├── Token
│   ├── User
│   └── TokenData
│
├── services/
│   ├── circle_service.py         # Circle API integration
│   │   ├── get_auth_token()
│   │   ├── verify_member()
│   │   ├── get_member_by_email()
│   │   └── refresh_token()
│   │
│   └── auth_service.py           # Authentication logic
│       ├── create_access_token()
│       ├── verify_token()
│       └── verify_google_token()
│
├── routers/
│   └── auth.py                   # Auth endpoints
│       ├── POST /auth/login
│       ├── POST /auth/google
│       ├── GET /auth/me
│       └── POST /auth/refresh
│
└── middleware/
    └── auth_middleware.py        # Token verification
        └── verify_token_middleware()
```

### Frontend Structure

```
src/
│
├── islands/
│   └── LoginForm.tsx             # Login component
│       ├── Email/password form
│       ├── Google Sign-In button
│       ├── User info display
│       └── State management
│
├── pages/
│   └── login.astro               # Login page
│       ├── Layout
│       ├── SEO tags
│       └── LoginForm integration
│
├── utils/
│   └── auth.ts                   # Auth service
│       ├── AuthService class
│       ├── login()
│       ├── loginWithGoogle()
│       ├── checkAuth()
│       ├── logout()
│       └── Global state (signals)
│
└── types/
    └── google-signin.d.ts        # TypeScript definitions
```

## Data Flow

### Token Structure

**JWT Token Payload:**
```json
{
  "email": "user@example.com",
  "user_id": 12345,
  "circle_token": "circle_access_token_here",
  "google_id": "google_user_id_optional",
  "exp": 1234567890
}
```

**Circle API Response:**
```json
{
  "access_token": "circle_token",
  "refresh_token": "circle_refresh_token",
  "expires_in": 3600
}
```

**User Object:**
```json
{
  "id": 12345,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://..."
}
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Architecture                         │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Transport Security
┌─────────────────────────────────────────────────────────────────┐
│ • HTTPS in production                                            │
│ • CORS protection                                                │
│ • Secure headers                                                 │
└─────────────────────────────────────────────────────────────────┘

Layer 2: Authentication
┌─────────────────────────────────────────────────────────────────┐
│ • Circle membership verification                                │
│ • Google OAuth validation                                        │
│ • JWT token signing                                              │
└─────────────────────────────────────────────────────────────────┘

Layer 3: Authorization
┌─────────────────────────────────────────────────────────────────┐
│ • Bearer token validation                                        │
│ • Token expiration (7 days)                                      │
│ • Middleware protection                                          │
└─────────────────────────────────────────────────────────────────┘

Layer 4: Data Protection
┌─────────────────────────────────────────────────────────────────┐
│ • Environment variables (.env)                                   │
│ • Secret key management                                          │
│ • Token storage (localStorage)                                   │
└─────────────────────────────────────────────────────────────────┘
```

## API Request/Response Cycles

### Login Request Cycle

```
Client                    Backend                   Circle API
  │                          │                          │
  │─────POST /auth/login────▶│                          │
  │  {email, password}       │                          │
  │                          │                          │
  │                          │──get_member_by_email────▶│
  │                          │                          │
  │                          │◀────member data──────────│
  │                          │                          │
  │                          │──get_auth_token─────────▶│
  │                          │                          │
  │                          │◀────Circle tokens────────│
  │                          │                          │
  │                          │──verify_member──────────▶│
  │                          │                          │
  │                          │◀────user data────────────│
  │                          │                          │
  │◀────JWT token───────────│                          │
  │  {access_token}          │                          │
  │                          │                          │
  │───GET /auth/me──────────▶│                          │
  │  Authorization: Bearer   │                          │
  │                          │                          │
  │◀────user info───────────│                          │
  │  {id, email, name}       │                          │
```

### Protected Route Access

```
Client                    Backend                   Database/State
  │                          │                          │
  │──GET /protected─────────▶│                          │
  │  Authorization: Bearer   │                          │
  │                          │                          │
  │                          │─verify_token────────────▶│
  │                          │                          │
  │                          │◀────token valid──────────│
  │                          │                          │
  │◀────protected data──────│                          │
```

## Deployment Architecture

### Development

```
┌──────────────────────────────────────────────────────────────┐
│                       Local Machine                           │
│                                                               │
│  ┌─────────────────┐            ┌─────────────────┐         │
│  │  Frontend       │            │  Backend        │         │
│  │  localhost:4321 │◀──────────▶│  localhost:8000 │         │
│  │  (Astro/Preact) │    CORS    │  (FastAPI)      │         │
│  └─────────────────┘            └─────────────────┘         │
│                                          │                   │
│                                          │ HTTPS             │
│                                          ▼                   │
│                              ┌────────────────────┐         │
│                              │  External APIs     │         │
│                              │  • Circle API      │         │
│                              │  • Google OAuth    │         │
│                              └────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

### Production (Recommended)

```
┌──────────────────────────────────────────────────────────────┐
│                         Internet                              │
└──────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                      Load Balancer / CDN                      │
│                        (Cloudflare)                           │
└──────────────────────────────────────────────────────────────┘
                    │                      │
        ┌───────────┘                      └───────────┐
        ▼                                              ▼
┌──────────────────┐                        ┌──────────────────┐
│  Frontend        │                        │  Backend         │
│  (Vercel/        │                        │  (Railway/       │
│   Netlify)       │                        │   Render)        │
│                  │                        │                  │
│  Static Assets   │                        │  Docker Container│
│  + SSR           │◀─────── API ─────────▶│  FastAPI         │
└──────────────────┘       Requests         └──────────────────┘
                                                     │
                                                     │ HTTPS
                                                     ▼
                                           ┌────────────────────┐
                                           │  External Services │
                                           │  • Circle API      │
                                           │  • Google OAuth    │
                                           └────────────────────┘
```

## State Management

### Frontend State (Preact Signals)

```javascript
// Global authentication state
currentUser: Signal<User | null>
isAuthenticated: Signal<boolean>
isLoading: Signal<boolean>

// State transitions
null ──login──▶ User ──logout──▶ null
      ▲              │
      │              │
      └──checkAuth───┘
```

### Session Persistence

```
localStorage
  │
  ├── auth_token: "eyJhbG..." (JWT)
  │
  └── Auto-restored on page load via checkAuth()
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                      Error Flow                              │
└─────────────────────────────────────────────────────────────┘

API Error
  │
  ├─ 401 Unauthorized ──▶ Clear token, redirect to /login
  │
  ├─ 404 Not Found ────▶ Show "User not found" error
  │
  ├─ 500 Server Error ─▶ Show "Try again later" message
  │
  └─ Network Error ────▶ Show "Check connection" message

Token Expiry
  │
  └─ JWT expired ──▶ Clear localStorage ──▶ Redirect to /login

Circle API Error
  │
  └─ Invalid token ──▶ Log error ──▶ Return null ──▶ Login fails
```

## Performance Considerations

### Caching Strategy

```
JWT Token
  ├── Stored in localStorage (persistent)
  ├── Verified on backend (every request)
  └── Expires after 7 days

User Data
  ├── Fetched once on login
  ├── Stored in Preact signals (reactive)
  └── Re-fetched on page reload

Circle API Calls
  ├── Minimized via JWT embedding
  └── Cached member data in token payload
```

## Scalability

### Horizontal Scaling

```
Multiple Backend Instances
  │
  ├── Stateless design (JWT tokens)
  ├── Shared JWT_SECRET across instances
  └── Load balancer distributes requests

Database-less Auth
  │
  ├── Circle API as source of truth
  └── No database for user storage
```

## Monitoring & Logging

### Key Metrics

```
Backend Logs
  ├── Login attempts
  ├── Failed authentications
  ├── Circle API errors
  └── Token verifications

Frontend Metrics
  ├── Login success rate
  ├── Session duration
  └── Error frequencies
```

---

This architecture provides a secure, scalable, and maintainable authentication system integrating Circle's community platform with your custom web application.
