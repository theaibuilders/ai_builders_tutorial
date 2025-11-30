# Makefile Commands Reference

## Overview

The project includes a comprehensive Makefile that simplifies development, testing, and deployment tasks. All commands can be run from the project root.

## Quick Reference

### Most Used Commands

```bash
make dev               # Start both services
make dev-backend       # Start backend only  
make dev-frontend      # Start frontend only
make setup             # Initial project setup
make install           # Install all dependencies
make test-backend      # Run backend tests
make clean             # Clean all artifacts
make help              # Show all commands
```

## All Available Commands

### Development

| Command | Description |
|---------|-------------|
| `make dev` | Start both frontend and backend servers in parallel |
| `make dev-backend` | Start backend development server on port 8000 |
| `make dev-frontend` | Start frontend development server on port 4321 |

**Examples:**
```bash
# Start everything
make dev

# Start only backend
make dev-backend

# Start only frontend (in another terminal)
make dev-frontend
```

### Installation

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies (frontend + backend) |
| `make install-backend` | Install backend Python dependencies |
| `make install-frontend` | Install frontend Node.js dependencies |
| `make setup` | Complete project setup (create .env, install deps) |

**Examples:**
```bash
# First time setup
make setup

# Reinstall all dependencies
make install

# Install backend only
make install-backend
```

### Testing

| Command | Description |
|---------|-------------|
| `make test-backend` | Run backend test suite |
| `make test-frontend` | Run frontend tests (if available) |
| `make env-check` | Verify environment configuration |

**Examples:**
```bash
# Test backend setup
make test-backend

# Check environment variables
make env-check
```

### Build

| Command | Description |
|---------|-------------|
| `make build-frontend` | Build frontend for production |

**Examples:**
```bash
# Build frontend
make build-frontend
```

### Health & Monitoring

| Command | Description |
|---------|-------------|
| `make health` | Check if services are running |
| `make logs-backend` | Show backend logs |

**Examples:**
```bash
# Check service health
make health

# View backend logs
make logs-backend
```

### Cleaning

| Command | Description |
|---------|-------------|
| `make clean` | Clean all build artifacts and dependencies |
| `make clean-backend` | Clean backend artifacts only |
| `make clean-frontend` | Clean frontend artifacts only |

**Examples:**
```bash
# Clean everything
make clean

# Clean backend only
make clean-backend

# Clean and reinstall
make clean install
```

### Code Quality

| Command | Description |
|---------|-------------|
| `make format-backend` | Format backend Python code with Black |
| `make lint-backend` | Lint backend code with Flake8 |

**Examples:**
```bash
# Format code
make format-backend

# Lint code
make lint-backend
```

### Utilities

| Command | Description |
|---------|-------------|
| `make shell-backend` | Open Python shell with backend context |
| `make info` | Show project information |
| `make help` | Show all available commands |

**Examples:**
```bash
# Open Python shell
make shell-backend

# Show project info
make info
```

### Browser Shortcuts

| Command | Description |
|---------|-------------|
| `make open-frontend` | Open frontend in default browser |
| `make open-docs` | Open API documentation in browser |
| `make open-login` | Open login page in browser |

**Examples:**
```bash
# Open frontend
make open-frontend

# Open API docs
make open-docs
```

### Docker (Future Use)

| Command | Description |
|---------|-------------|
| `make docker-build` | Build Docker images |
| `make docker-up` | Start services with Docker Compose |
| `make docker-down` | Stop Docker services |

## Common Workflows

### First Time Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd ai_builders_tutorial

# 2. Run setup
make setup

# 3. Edit environment file
nano services/backend/.env
# Add your Circle API credentials

# 4. Start services
make dev
```

### Daily Development

```bash
# Start both services
make dev

# Or start separately
make dev-backend    # Terminal 1
make dev-frontend   # Terminal 2
```

### Testing Changes

```bash
# Check environment
make env-check

# Run tests
make test-backend

# Check service health
make health
```

### Clean Start

```bash
# Clean everything
make clean

# Reinstall
make install

# Start fresh
make dev
```

### Code Quality Check

```bash
# Format code
make format-backend

# Lint code
make lint-backend

# Run tests
make test-backend
```

### Production Build

```bash
# Build frontend
make build-frontend

# Test the build
cd services/frontend/dist
python -m http.server 8080
```

## Environment Variables

The Makefile respects the following environment variables:

### Backend (`services/backend/.env`)

Required:
- `CIRCLE_HEADLESS_TOKEN` - Circle API token
- `CIRCLE_COMMUNITY_ID` - Your community ID
- `JWT_SECRET` - Secret for JWT signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

Optional:
- `FRONTEND_URL` - Frontend URL (default: http://localhost:4321)

## Troubleshooting

### "make: command not found"

**macOS/Linux:**
```bash
# macOS - Install Xcode Command Line Tools
xcode-select --install

# Linux - Install make
sudo apt-get install build-essential  # Ubuntu/Debian
sudo yum install make                 # CentOS/RHEL
```

### "venv: command not found"

```bash
# Install Python 3
# macOS
brew install python3

# Linux
sudo apt-get install python3 python3-venv
```

### "npm: command not found"

```bash
# Install Node.js
# macOS
brew install node

# Linux
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Services Won't Start

```bash
# Check if ports are available
lsof -i :8000  # Backend
lsof -i :4321  # Frontend

# Kill processes if needed
kill -9 <PID>

# Clean and retry
make clean
make install
make dev
```

### Permission Denied

```bash
# Make script executable
chmod +x start-auth-servers.sh

# Check file permissions
ls -la Makefile
```

## Advanced Usage

### Custom Ports

Edit the configuration files directly:
- Backend: `services/backend/main.py` (port 8000)
- Frontend: `services/frontend/astro.config.mjs` (port 4321)

### Parallel Execution

```bash
# Run multiple commands in parallel
make install-backend & make install-frontend & wait
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Setup
  run: make setup

- name: Test
  run: make test-backend

- name: Build
  run: make build-frontend
```

## Tips & Best Practices

1. **Always run `make setup` first** on a new clone
2. **Use `make dev`** for daily development
3. **Run `make clean`** when switching branches
4. **Check `make health`** if services seem unresponsive
5. **Use `make info`** to quickly see all URLs and paths
6. **Run `make env-check`** before reporting issues

## Getting Help

```bash
# Show all commands
make help

# Show project info
make info

# Check environment
make env-check
```

For more help:
- Setup Guide: [docs/CIRCLE_AUTH_SETUP.md](CIRCLE_AUTH_SETUP.md)
- Quick Reference: [docs/QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Project Structure: [docs/PROJECT_RESTRUCTURE.md](PROJECT_RESTRUCTURE.md)

---

**Last Updated**: 2024  
**Version**: 1.0.2
