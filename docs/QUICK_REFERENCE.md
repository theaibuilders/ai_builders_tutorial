# Circle Auth - Quick Reference

## 🚀 Quick Start (5 Steps)

### 1. Setup Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### 2. Get Circle Token
- Go to: https://app.circle.so → Settings → Developers → Tokens
- Create "Headless Auth" token
- Add to `backend/.env`

### 3. Configure .env
```env
CIRCLE_HEADLESS_TOKEN=your_token_here
CIRCLE_COMMUNITY_ID=your_community_id
JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
FRONTEND_URL=http://localhost:4321
```

### 4. Start Servers
```bash
# Option 1: Use startup script
./start-auth-servers.sh

# Option 2: Manual
# Terminal 1 - Backend
cd backend && python main.py

# Terminal 2 - Frontend  
npm run dev
```

### 5. Test
- Visit: http://localhost:4321/login
- Login with Circle member email
- Or use Google Sign-In

---

## 📚 Files Created

### Backend
```
backend/
├── main.py                     # FastAPI app
├── config.py                   # Settings
├── models.py                   # Data models
├── requirements.txt            # Dependencies
├── services/
│   ├── circle_service.py      # Circle API
│   └── auth_service.py        # JWT/OAuth
└── routers/
    └── auth.py                # Endpoints
```

### Frontend
```
src/
├── islands/LoginForm.tsx      # Login UI
├── pages/login.astro          # Login page
├── utils/auth.ts              # Auth service
└── types/google-signin.d.ts   # Types
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Email/password login |
| POST | `/auth/google` | Google OAuth login |
| GET | `/auth/me` | Get current user |
| POST | `/auth/refresh` | Refresh token |
| GET | `/health` | Health check |

---

## 💻 Code Examples

### Login Component Usage
```typescript
import { AuthService } from '../utils/auth';

// Login
const result = await AuthService.login(email, password);
if (result.success) {
  console.log('Logged in!');
}

// Check auth
await AuthService.checkAuth();

// Logout
AuthService.logout();
```

### Protected Route (Astro)
```astro
---
import { AuthService } from '../utils/auth';

const token = Astro.cookies.get('auth_token');
if (!token) return Astro.redirect('/login');
---
```

### API Call with Token
```typescript
const token = AuthService.getToken();
const response = await fetch('http://localhost:8000/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🔧 Common Commands

### Backend
```bash
# Start server
cd backend && python main.py

# Install dependencies
pip install -r requirements.txt

# Check health
curl http://localhost:8000/health

# Test login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "test"}'
```

### Frontend
```bash
# Start dev server
npm run dev

# Build
npm run build

# Preview
npm run preview
```

---

## 🐛 Troubleshooting

### Backend Issues
```bash
# Can't start: Check Python version
python3 --version  # Should be 3.8+

# Import errors: Reinstall dependencies
pip install --force-reinstall -r requirements.txt

# Port in use: Change port
uvicorn main:app --reload --port 8001
```

### Frontend Issues
```bash
# CORS errors: Check backend .env
FRONTEND_URL=http://localhost:4321

# Login not working: Check backend is running
curl http://localhost:8000/health

# Google Sign-In not showing: Check browser console
```

### Circle API Issues
- Verify token in Circle dashboard
- Check "Headless Auth" permission is enabled
- Confirm community ID is correct

---

## 📝 Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| CIRCLE_HEADLESS_TOKEN | `sk_...` | ✅ Yes |
| CIRCLE_COMMUNITY_ID | `12345` | ✅ Yes |
| JWT_SECRET | `random_secret` | ✅ Yes |
| GOOGLE_CLIENT_ID | Provided | ✅ Yes |
| GOOGLE_CLIENT_SECRET | Provided | ✅ Yes |
| FRONTEND_URL | `http://localhost:4321` | ✅ Yes |

---

## 🎯 Testing Checklist

- [ ] Backend starts: `python main.py`
- [ ] Frontend starts: `npm run dev`
- [ ] Health check: `curl http://localhost:8000/health`
- [ ] Login page loads: http://localhost:4321/login
- [ ] Email login works
- [ ] Google login works
- [ ] User info displays
- [ ] Logout works
- [ ] API docs: http://localhost:8000/docs

---

## 🔒 Security

**Before Production:**
1. Generate new JWT_SECRET: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
2. Update FRONTEND_URL to production domain
3. Use HTTPS
4. Review CORS settings
5. Enable rate limiting

---

## 📞 Quick Links

- Frontend: http://localhost:4321
- Backend: http://localhost:8000  
- API Docs: http://localhost:8000/docs
- Login: http://localhost:4321/login
- Circle Admin: https://app.circle.so

---

## 📚 Documentation

- Full Setup: `CIRCLE_AUTH_SETUP.md`
- Implementation: `IMPLEMENTATION_SUMMARY.md`
- Backend API: `backend/README.md`

---

## 🎓 Flow Diagram

```
User Login
    ↓
LoginForm.tsx
    ↓
POST /auth/login or /auth/google
    ↓
Circle API (verify membership)
    ↓
Generate JWT Token
    ↓
Return to Frontend
    ↓
Save to localStorage
    ↓
Redirect to Dashboard
```

---

*For detailed documentation, see `CIRCLE_AUTH_SETUP.md`*
