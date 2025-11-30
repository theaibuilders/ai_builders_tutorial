# Project Restructure Guide

## 📋 Overview

The AI Builders Tutorial project has been restructured to improve organization and maintainability by consolidating all application code under a `/services` directory.

## 🔄 What Changed

### Before (v1.0.1)
```
ai_builders_tutorial/
├── src/                    # Frontend source
├── public/                 # Static assets
├── tutorials/              # Tutorial notebooks
├── backend/                # Backend API
├── docs/                   # Documentation
├── package.json            # Root dependencies
├── astro.config.mjs        # Astro config
└── ...                     # Other config files
```

### After (v1.0.2)
```
ai_builders_tutorial/
├── services/               # All application services
│   ├── frontend/          # Complete frontend app
│   │   ├── src/
│   │   ├── public/
│   │   ├── tutorials/
│   │   ├── package.json
│   │   └── ...
│   └── backend/           # Complete backend API
│       ├── main.py
│       ├── services/
│       ├── routers/
│       └── ...
├── docs/                  # Documentation (unchanged)
├── start-auth-servers.sh  # Updated startup script
└── README.md              # Updated root readme
```

## 📁 Directory Mapping

| Old Path | New Path | Type |
|----------|----------|------|
| `src/` | `services/frontend/src/` | Frontend source |
| `public/` | `services/frontend/public/` | Static assets |
| `tutorials/` | `services/frontend/tutorials/` | Tutorial notebooks |
| `package.json` | `services/frontend/package.json` | Frontend deps |
| `astro.config.mjs` | `services/frontend/astro.config.mjs` | Astro config |
| `backend/` | `services/backend/` | Backend API |
| `docs/` | `docs/` | No change |

## 🛠️ What Was Updated

### Configuration Files

1. **`.gitignore`**
   - Updated paths: `backend/` → `services/backend/`
   - Added: `services/frontend/node_modules/`, etc.

2. **`start-auth-servers.sh`**
   - Updated: `cd backend` → `cd services/backend`
   - Updated: `cd ..` → `cd ../..`
   - Updated: Added `cd services/frontend` for frontend

3. **`README.md`** (Root)
   - Added project structure diagram
   - Updated all path references
   - Added services directory explanation

### Documentation Files

4. **`docs/README.md`**
   - Updated backend path: `../backend/README.md` → `../services/backend/README.md`

5. **All documentation in `/docs`**
   - Path references updated where applicable

### New Files

6. **`services/README.md`** (NEW)
   - Service-level documentation
   - Quick start for both services
   - Architecture overview
   - Communication flow

7. **`docs/PROJECT_RESTRUCTURE.md`** (THIS FILE)
   - Migration guide
   - Change documentation

## 🚀 Migration Guide

### For Developers

If you have an existing clone, follow these steps:

#### 1. Backup Your Work
```bash
# Save any uncommitted changes
git stash

# Or commit your work
git add .
git commit -m "Save work before restructure"
```

#### 2. Pull Latest Changes
```bash
git pull origin main
```

#### 3. Clean Up Old Directories
```bash
# Remove old node_modules and build artifacts
rm -rf node_modules dist .astro

# Install frontend dependencies in new location
cd services/frontend
npm install
```

#### 4. Update Backend Environment
```bash
cd ../backend

# If you have an existing .env, copy it to new location
# (This should already be there from the move, but verify)
cat .env  # Check it exists

# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 5. Test Everything
```bash
# From project root
./start-auth-servers.sh
```

### For CI/CD Pipelines

Update your deployment scripts:

**Before:**
```yaml
# Build frontend
- npm install
- npm run build

# Start backend
- cd backend
- pip install -r requirements.txt
```

**After:**
```yaml
# Build frontend
- cd services/frontend
- npm install
- npm run build

# Start backend
- cd services/backend
- pip install -r requirements.txt
```

## 🔧 Command Updates

### Development Commands

| Task | Old Command | New Command |
|------|-------------|-------------|
| Start frontend | `npm run dev` | `cd services/frontend && npm run dev` |
| Start backend | `cd backend && python main.py` | `cd services/backend && python main.py` |
| Install frontend deps | `npm install` | `cd services/frontend && npm install` |
| Install backend deps | `cd backend && pip install -r requirements.txt` | `cd services/backend && pip install -r requirements.txt` |
| Build frontend | `npm run build` | `cd services/frontend && npm run build` |
| Test backend | `cd backend && python test_setup.py` | `cd services/backend && python test_setup.py` |

### Quick Start Script

The startup script has been updated and works from the project root:

```bash
# No change - still works!
./start-auth-servers.sh
```

## 📊 Benefits of This Structure

### ✅ Improved Organization
- Clear separation of frontend and backend
- All service code in one place
- Cleaner project root

### ✅ Better Scalability
- Easy to add new services (mobile, desktop, etc.)
- Microservices-ready architecture
- Independent service deployment

### ✅ Development Experience
- Each service has its own dependencies
- No conflicting configurations
- Clear service boundaries

### ✅ Professional Standards
- Follows industry best practices
- Similar to monorepo structure
- Enterprise-ready architecture

## 🚨 Important Notes

### Environment Variables

**Backend `.env` location changed:**
- Old: `backend/.env`
- New: `services/backend/.env`

Make sure to update any scripts or documentation that reference this path.

### Import Paths

If you have custom scripts that import from the project:

**Python (Backend):**
```python
# Paths relative to services/backend/ work the same
from services.circle_service import circle_service  # Still works
```

**TypeScript (Frontend):**
```typescript
// Paths relative to services/frontend/src/ work the same
import { AuthService } from '../utils/auth';  // Still works
```

### URLs & Ports

No changes to URLs or ports:
- Frontend: `http://localhost:4321`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## 🐛 Troubleshooting

### "Module not found" errors

**Frontend:**
```bash
cd services/frontend
rm -rf node_modules package-lock.json
npm install
```

**Backend:**
```bash
cd services/backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### "Directory not found" errors

Make sure you're running commands from the correct location:
- Most commands now need to be run from `services/frontend/` or `services/backend/`
- Or use the startup script from the project root

### Startup script fails

```bash
# Make sure it's executable
chmod +x start-auth-servers.sh

# Check paths in the script
cat start-auth-servers.sh | grep "cd services"
```

## 📝 Checklist

After restructure, verify:

- [ ] Frontend starts: `cd services/frontend && npm run dev`
- [ ] Backend starts: `cd services/backend && python main.py`
- [ ] Startup script works: `./start-auth-servers.sh`
- [ ] Login page loads: http://localhost:4321/login
- [ ] API docs accessible: http://localhost:8000/docs
- [ ] All tests pass: `cd services/backend && python test_setup.py`

## 🔮 Future Enhancements

This structure enables:

- [ ] Mobile app service (`services/mobile/`)
- [ ] Admin dashboard service (`services/admin/`)
- [ ] Shared libraries (`services/shared/`)
- [ ] Docker compose for all services
- [ ] Independent service scaling
- [ ] Service-specific CI/CD pipelines

## 📞 Support

If you encounter issues after the restructure:

1. Check this guide's troubleshooting section
2. Review updated documentation in `/docs`
3. Contact: support@theaibuilders.dev

## 📚 Related Documentation

- [Project Structure](../services/README.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [Setup Guide](CIRCLE_AUTH_SETUP.md)

---

**Version**: 1.0.2  
**Date**: 2024  
**Status**: ✅ Complete
