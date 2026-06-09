# AI Builders Tutorial Platform

Welcome to AI Builders Tutorial! This is a comprehensive, hands-on tutorial series for vibe coding as well as building AI applications using modern tools.

![AI Builders Tutorial Banner](services/frontend/public/github_banner.png)

## 📁 Project Structure

```
ai_builders_tutorial/
├── services/              # Main application services
│   ├── frontend/         # Astro + Preact web application
│   └── backend/          # Python FastAPI REST API
├── docs/                 # Comprehensive documentation
├── start-auth-servers.sh # Quick start script
└── README.md            # This file
```

### Services Directory

All application code is organized under the `/services` directory:

- **`services/frontend/`** - Full-stack web application with tutorials, UI components, and static assets
- **`services/backend/`** - Authentication API with Circle integration and Google OAuth

See [services/README.md](services/README.md) for detailed service documentation.

## 🚀 Quick Start

Get up and running in 3 commands:

```bash
# 1. Setup project (creates .env, installs dependencies)
make setup

# 2. Edit services/backend/.env with your Circle API credentials

# 3. Start both services
make dev
```

That's it! Visit:
- **Frontend**: http://localhost:4321
- **Backend API**: http://localhost:8000/docs
- **Login**: http://localhost:4321/login

### Available Make Commands

```bash
make help              # Show all available commands
make dev               # Start both frontend and backend
make dev-backend       # Start backend only
make dev-frontend      # Start frontend only
make install           # Install all dependencies
make test-backend      # Run backend tests
make clean             # Clean build artifacts
make info              # Show project information
```

## What You'll Learn from this side

Each tutorial is designed to be practical and immediately applicable:

• **Concise and To-the-point**: We cover the most important concepts of each tool for you to get started quickly
• **Hands-on Examples**: Every concept includes working code you can run and modify
• **Best Practices**: Learn industry-standard approaches and common pitfalls to avoid
• **Progressive Complexity**: Start with basics and advance to sophisticated implementations

Tutorials are written with concise explanations and runnable code / notebooks. Many include copy‑friendly prompts and refactor patterns so you can adapt them directly into real projects.

## Tutorial Categories

Below is a quick mental map of the content areas. Open a category in the sidebar to explore individual tools, frameworks, and notebooks.

### Vibe Coding course
Leverage AI‑native editors (Cursor, Windsurf, etc.) plus one‑click deploy flows to supercharge iteration beyond simple “chat” usage—own your code, not just generated files.

### Automation
Connect AI + workflow engines (n8n, Zapier‑style orchestration, background jobs) to trigger agents or model calls from events and pipelines.

### Model Providers
Call, configure,  and optimize a wide range of proprietary & open model APIs (latency, quality, fallbacks, cost shaping).

### Gateways
Unify multiple providers behind one interface with routing, retries, caching, usage tracking, and graceful degradation.

### Frameworks
End‑to‑end application scaffolds: retrieval augmentation, tool‑calling agents, multi‑step orchestration, structured outputs, evaluation harnesses.

### Chat UI Framework
Rapidly build production‑ready conversational & multimodal interfaces with state management, streaming, and tool feedback loops.

### Observability
Instrument, trace, evaluate, and debug LLM/agent behavior in staging & prod; collect spans, prompts, scores, and regression signals.

### Fine Tuning
Adapt base models to domain style or task specifics; cover dataset prep, parameter‑efficient methods, evaluation & iteration.

### Data & Memory
Embed, store, and retrieve context using vector databases, hybrid search, chunking strategies, and long‑horizon memory patterns.

### Web Search
Integrate live search, crawling, proxy rotation, and SERP/structured extraction to ground responses in current information.

### Browser Use
Empower agents to navigate, extract, and act within live web contexts (headless & interactive) for research, QA, and scripted tasks.

### Audio / Realtime
Low‑latency speech recognition, streaming synthesis, and realtime bidirectional agent experiences.

### Image & Video
Generate & manipulate visual media (diffusion, video pipelines, asset optimization, multimodal grounding).

## Ready to Take Your AI Journey Further?

### Visit AI Builders

Ready to dive deeper into the world of AI development? Visit **[AI Builders](https://theaibuilders.dev/)** for more resources, advanced tutorials, and the latest insights in AI development.

### Join Our Community

Connect with fellow AI builders from around the world! Join our vibrant community at **[AI Builders Community](https://theaibuilders.dev/community)** where you can:

- Share your projects and get feedback
- Ask questions and get help from experienced developers
- Collaborate on exciting AI projects
- Stay updated with the latest AI trends and technologies
- Network with AI enthusiasts and professionals globally

Whether you're just starting out or you're an experienced developer, our community welcomes everyone who's passionate about building with AI. Come join us and be part of the future of AI development!

## 🔐 Circle Authentication Feature

This platform now includes a complete Circle Headless API authentication system for secure user authentication!

### Features
- ✅ Email/password login (verifies Circle community membership)
- ✅ Google OAuth integration
- ✅ JWT-based session management
- ✅ Secure token handling
- ✅ Protected routes and API endpoints

### Quick Start

#### 1. Setup Backend (Python FastAPI)
```bash
cd services/backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Circle API credentials
```

#### 2. Get Circle API Token
1. Go to Circle admin → Settings → Developers → Tokens
2. Create "Headless Auth" token
3. Add to `services/backend/.env`

#### 3. Start Servers
```bash
# Option 1: Use Makefile (recommended)
make dev

# Option 2: Use startup script
./start-auth-servers.sh

# Option 3: Manual start
# Terminal 1 - Backend
make dev-backend
# OR: cd services/backend && python main.py

# Terminal 2 - Frontend
make dev-frontend
# OR: cd services/frontend && npm run dev
```

#### 4. Test Authentication
Visit: http://localhost:4321/login

### Documentation
- **Quick Reference**: [`docs/QUICK_REFERENCE.md`](docs/QUICK_REFERENCE.md) - Fast setup guide
- **Full Setup Guide**: [`docs/CIRCLE_AUTH_SETUP.md`](docs/CIRCLE_AUTH_SETUP.md) - Complete documentation
- **Implementation Details**: [`docs/IMPLEMENTATION_SUMMARY.md`](docs/IMPLEMENTATION_SUMMARY.md) - Technical overview
- **Backend API**: [`services/backend/README.md`](services/backend/README.md) - API endpoints & usage

### API Endpoints
- `POST /auth/login` - Email/password authentication
- `POST /auth/google` - Google OAuth login
- `GET /auth/me` - Get current user
- `POST /auth/refresh` - Refresh access token
- `GET /health` - Health check

### Testing
```bash
# Test backend setup
cd services/backend
python test_setup.py

# Test API health
curl http://localhost:8000/health
```

For detailed setup instructions, see [`docs/CIRCLE_AUTH_SETUP.md`](docs/CIRCLE_AUTH_SETUP.md).

<!-- Redeployed: 2026-06-09 -->
