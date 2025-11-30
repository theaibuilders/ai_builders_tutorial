# Services Directory

This directory contains both the frontend and backend services for the AI Builders Tutorial platform.

## 📁 Structure

```
services/
├── frontend/          # Astro + Preact frontend application
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   ├── tutorials/    # Tutorial notebooks
│   └── package.json  # Frontend dependencies
│
└── backend/          # Python FastAPI backend
    ├── main.py       # Application entry point
    ├── services/     # Business logic
    ├── routers/      # API routes
    └── requirements.txt  # Python dependencies
```

## 🚀 Quick Start

### Frontend (Port 4321)

```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:4321

### Backend (Port 8000)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
python main.py
```

Visit: http://localhost:8000/docs

## 📚 Documentation

- **Frontend**: See [frontend/README.md](frontend/README.md) (if exists)
- **Backend**: See [backend/README.md](backend/README.md)
- **Auth Setup**: See [../docs/CIRCLE_AUTH_SETUP.md](../docs/CIRCLE_AUTH_SETUP.md)

## 🔗 Communication

- Frontend → Backend: `http://localhost:8000` (API calls)
- Backend → Circle API: Authentication & user management
- Backend → Google OAuth: Social login

## 🛠️ Development

### Run Both Services

From the project root:

```bash
./start-auth-servers.sh
```

This starts both frontend and backend servers simultaneously.

### Environment Variables

**Backend** (`backend/.env`):
- `CIRCLE_HEADLESS_TOKEN` - Circle API token
- `CIRCLE_COMMUNITY_ID` - Your community ID
- `JWT_SECRET` - Secret for JWT signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `FRONTEND_URL` - Frontend URL (default: http://localhost:4321)

**Frontend**:
- Environment variables are configured in `astro.config.mjs`

## 📦 Tech Stack

### Frontend
- **Framework**: Astro 4.x
- **UI Library**: Preact 10.x
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Authentication**: JWT + Google OAuth
- **Language**: Python 3.8+

## 🔐 Authentication Flow

```
User (Frontend)
    ↓
Login Request
    ↓
Backend API (/auth/login or /auth/google)
    ↓
Circle API (verify membership)
    ↓
JWT Token Generation
    ↓
Return to Frontend
    ↓
Store in localStorage
```

## 📊 Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 4321 | http://localhost:4321 |
| Backend | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |

## 🧪 Testing

### Backend Tests
```bash
cd backend
python test_setup.py
```

### API Health Check
```bash
curl http://localhost:8000/health
```

### Frontend Build
```bash
cd frontend
npm run build
```

## 📖 More Information

For complete documentation, see the [/docs](../docs) directory in the project root.
