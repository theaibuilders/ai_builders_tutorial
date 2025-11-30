# Zeabur Deployment Guide

## Overview
This project is a monorepo containing two separate services that need to be deployed independently on Zeabur:
1. **Backend** - Python FastAPI service (`services/backend/`)
2. **Frontend** - Node.js/Astro service (`services/frontend/`)

## Deployment Architecture

### Backend Service
- **Location**: `services/backend/`
- **Runtime**: Python 3.10
- **Framework**: FastAPI
- **Port**: 8000
- **Build**: Dockerfile + zbpack.json
- **Production URL**: `https://api-backend.zeabur.app`

### Frontend Service
- **Location**: `services/frontend/`
- **Runtime**: Node.js 22
- **Framework**: Astro
- **Port**: 4321
- **Build**: Dockerfile + zbpack.json
- **Production URL**: `https://tutorial.theaibuilders.dev`

## Files for Deployment

### Backend (`services/backend/`)
```
services/backend/
├── Dockerfile           # Docker build configuration
├── .dockerignore       # Files to exclude from Docker build
├── zbpack.json         # Zeabur build configuration
├── requirements.txt    # Python dependencies
├── main.py            # FastAPI application entry point
├── config.py          # Environment configuration
└── ...
```

### Frontend (`services/frontend/`)
```
services/frontend/
├── Dockerfile           # Docker build configuration
├── .dockerignore       # Files to exclude from Docker build
├── zbpack.json         # Zeabur build configuration
├── package.json        # Node.js dependencies
├── astro.config.mjs    # Astro configuration
└── ...
```

## Zeabur Configuration

### Option 1: Using zbpack.json (Recommended)
Each service has a `zbpack.json` file that tells Zeabur how to build and start the service.

**Backend zbpack.json:**
```json
{
  "build_command": "pip install -r requirements.txt",
  "start_command": "uvicorn main:app --host 0.0.0.0 --port 8000"
}
```

**Frontend zbpack.json:**
```json
{
  "build_command": "npm install && npm run build",
  "start_command": "npm run preview -- --host 0.0.0.0 --port 4321",
  "install_command": "npm install"
}
```

### Option 2: Using Dockerfile
Both services have Dockerfiles for containerized deployment.

## Deployment Steps on Zeabur

### 1. Create Backend Service
1. Go to your Zeabur project
2. Click "Add Service" → "Git Repository"
3. Select your repository
4. **Important**: Set the **Root Directory** to `services/backend`
5. Zeabur will auto-detect the Python/Dockerfile setup
6. Configure environment variables (see below)
7. Deploy!

### 2. Create Frontend Service
1. In the same Zeabur project, click "Add Service" again
2. Select the same repository
3. **Important**: Set the **Root Directory** to `services/frontend`
4. Zeabur will auto-detect the Node.js/Astro setup
5. Configure environment variables (see below)
6. Deploy!

## Environment Variables

### Backend Environment Variables
Set these in the Zeabur backend service settings:

```bash
# Required
CIRCLE_HEADLESS_TOKEN=<your_circle_token>
CIRCLE_COMMUNITY_ID=<your_community_id>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
JWT_SECRET=<your_jwt_secret>

# Optional (has defaults)
CIRCLE_API_URL=https://app.circle.so/api/v1
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRONTEND_URL=https://tutorial.theaibuilders.dev

# To use .env.prod file
ENV_FILE=.env.prod
```

### Frontend Environment Variables
Set these in the Zeabur frontend service settings:

```bash
PUBLIC_GOOGLE_CLIENT_ID=<your_google_client_id>
PUBLIC_API_URL=https://api-backend.zeabur.app
NODE_ENV=production
```

## Troubleshooting

### Backend Deployment Issues

**Problem**: `requirements.txt not found`
- **Solution**: Make sure Root Directory is set to `services/backend` in Zeabur

**Problem**: CORS errors
- **Solution**: Verify `FRONTEND_URL` environment variable is set correctly
- Check that backend code includes `https://tutorial.theaibuilders.dev` in allowed origins

**Problem**: Module import errors
- **Solution**: Check that all dependencies are in `requirements.txt`

### Frontend Deployment Issues

**Problem**: `package.json not found`
- **Solution**: Make sure Root Directory is set to `services/frontend` in Zeabur

**Problem**: Build fails on `npm run build`
- **Solution**: Check that environment variables are set before build
- Verify `PUBLIC_API_URL` is correctly set

**Problem**: Preview mode not starting
- **Solution**: Ensure `npm run preview` script exists in package.json
- Check that port 4321 is not hardcoded (use `--host 0.0.0.0`)

## Verification

### Backend Health Check
```bash
curl https://api-backend.zeabur.app/health
# Expected: {"status":"healthy"}
```

### Backend API Docs
Visit: `https://api-backend.zeabur.app/docs`

### Frontend
Visit: `https://tutorial.theaibuilders.dev`

### Test CORS
```bash
curl -X OPTIONS https://api-backend.zeabur.app/auth/login \
  -H "Origin: https://tutorial.theaibuilders.dev" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return `200 OK` with CORS headers.

## Continuous Deployment

Both services are configured for continuous deployment:
- Push to `main` branch → Automatic deployment
- Each service deploys independently
- Check deployment logs in Zeabur dashboard

## Important Notes

1. **Monorepo Structure**: This is a monorepo with multiple services. Each service must be deployed separately with its own root directory.

2. **Environment Files**: `.env.prod` files are gitignored. Use environment variables in Zeabur dashboard or copy from `.env.prod.example`.

3. **Build Context**: Each Dockerfile uses relative paths assuming the build context is the service directory.

4. **Port Configuration**: Backend uses 8000, Frontend uses 4321. Zeabur handles external routing.

5. **CORS Configuration**: Backend must explicitly allow the frontend URL in CORS settings.

## Support

If deployments fail, check:
1. Zeabur build logs for specific errors
2. Root Directory is correctly set for each service
3. All environment variables are configured
4. Dockerfile and zbpack.json are in the service directory
