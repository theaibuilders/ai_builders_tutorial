.PHONY: help dev-backend dev-frontend dev install-backend install-frontend install test-backend clean-backend clean-frontend clean setup translate translate-status translate-check translate-config translate-test

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)AI Builders Tutorial - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Development Commands

dev: ## Start both frontend and backend in parallel
	@echo "$(BLUE)Starting both services...$(NC)"
	@./start-auth-servers.sh

dev-backend: ## Start backend development server
	@echo "$(BLUE)Starting backend server...$(NC)"
	@cd services/backend && \
	if [ ! -d "venv" ]; then \
		echo "$(YELLOW)Creating virtual environment...$(NC)"; \
		python3 -m venv venv; \
	fi && \
	. venv/bin/activate && \
	pip install -q -r requirements.txt && \
	echo "$(GREEN)✓ Backend starting on http://localhost:8000$(NC)" && \
	python main.py

dev-frontend: ## Start frontend development server
	@echo "$(BLUE)Starting frontend server...$(NC)"
	@cd services/frontend && \
	if [ ! -d "node_modules" ]; then \
		echo "$(YELLOW)Installing dependencies...$(NC)"; \
		npm install; \
	fi && \
	echo "$(GREEN)✓ Frontend starting on http://localhost:4321$(NC)" && \
	npm run dev

# Installation Commands

install: install-backend install-frontend ## Install all dependencies

install-backend: ## Install backend dependencies
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	@cd services/backend && \
	if [ ! -d "venv" ]; then \
		python3 -m venv venv; \
	fi && \
	. venv/bin/activate && \
	pip install -r requirements.txt && \
	echo "$(GREEN)✓ Backend dependencies installed$(NC)"

install-frontend: ## Install frontend dependencies
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	@cd services/frontend && \
	npm install && \
	echo "$(GREEN)✓ Frontend dependencies installed$(NC)"

# Setup Commands

setup: ## Initial project setup (create .env, install deps)
	@echo "$(BLUE)Setting up project...$(NC)"
	@if [ ! -f "services/backend/.env" ]; then \
		echo "$(YELLOW)Creating backend .env file...$(NC)"; \
		cp services/backend/.env.example services/backend/.env; \
		echo "$(YELLOW)⚠ Please edit services/backend/.env with your credentials$(NC)"; \
	else \
		echo "$(GREEN)✓ Backend .env already exists$(NC)"; \
	fi
	@$(MAKE) install
	@echo ""
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Edit services/backend/.env with your Circle API credentials"
	@echo "  2. Run 'make dev' to start both services"

# Testing Commands

test-backend: ## Run backend tests
	@echo "$(BLUE)Running backend tests...$(NC)"
	@cd services/backend && \
	. venv/bin/activate && \
	python test_setup.py

test-frontend: ## Run frontend tests (if available)
	@echo "$(BLUE)Running frontend tests...$(NC)"
	@cd services/frontend && \
	npm test

# Build Commands

build-frontend: ## Build frontend for production
	@echo "$(BLUE)Building frontend...$(NC)"
	@cd services/frontend && \
	npm run build && \
	echo "$(GREEN)✓ Frontend built successfully$(NC)"

# Health Check Commands

health: ## Check if services are running
	@echo "$(BLUE)Checking service health...$(NC)"
	@echo -n "Backend (port 8000): "
	@curl -s http://localhost:8000/health > /dev/null 2>&1 && \
		echo "$(GREEN)✓ Running$(NC)" || \
		echo "$(RED)✗ Not running$(NC)"
	@echo -n "Frontend (port 4321): "
	@curl -s http://localhost:4321 > /dev/null 2>&1 && \
		echo "$(GREEN)✓ Running$(NC)" || \
		echo "$(RED)✗ Not running$(NC)"

# Clean Commands

clean: clean-backend clean-frontend ## Clean all build artifacts and dependencies

clean-backend: ## Clean backend artifacts
	@echo "$(BLUE)Cleaning backend...$(NC)"
	@cd services/backend && \
	rm -rf venv __pycache__ *.pyc .pytest_cache && \
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true && \
	echo "$(GREEN)✓ Backend cleaned$(NC)"

clean-frontend: ## Clean frontend artifacts
	@echo "$(BLUE)Cleaning frontend...$(NC)"
	@cd services/frontend && \
	rm -rf node_modules dist .astro && \
	echo "$(GREEN)✓ Frontend cleaned$(NC)"

# Utility Commands

logs-backend: ## Show backend logs (if running in background)
	@echo "$(BLUE)Backend logs:$(NC)"
	@tail -f services/backend/logs/*.log 2>/dev/null || \
		echo "$(YELLOW)No log files found$(NC)"

shell-backend: ## Open Python shell with backend context
	@echo "$(BLUE)Opening backend Python shell...$(NC)"
	@cd services/backend && \
	. venv/bin/activate && \
	python

env-check: ## Check if environment variables are set
	@echo "$(BLUE)Checking environment configuration...$(NC)"
	@if [ -f "services/backend/.env" ]; then \
		echo "$(GREEN)✓ Backend .env exists$(NC)"; \
		cd services/backend && \
		. venv/bin/activate && \
		python -c "from config import settings; print('✓ Configuration loads successfully')" 2>/dev/null && \
		echo "$(GREEN)✓ Configuration is valid$(NC)" || \
		echo "$(RED)✗ Configuration has errors$(NC)"; \
	else \
		echo "$(RED)✗ Backend .env not found$(NC)"; \
		echo "$(YELLOW)Run 'make setup' to create it$(NC)"; \
	fi

format-backend: ## Format backend Python code
	@echo "$(BLUE)Formatting backend code...$(NC)"
	@cd services/backend && \
	. venv/bin/activate && \
	pip install -q black && \
	black . && \
	echo "$(GREEN)✓ Backend code formatted$(NC)"

lint-backend: ## Lint backend Python code
	@echo "$(BLUE)Linting backend code...$(NC)"
	@cd services/backend && \
	. venv/bin/activate && \
	pip install -q flake8 && \
	flake8 . --max-line-length=100 --exclude=venv && \
	echo "$(GREEN)✓ Backend code linted$(NC)"

# Quick Access Commands

open-docs: ## Open API documentation in browser
	@echo "$(BLUE)Opening API docs...$(NC)"
	@open http://localhost:8000/docs 2>/dev/null || \
		xdg-open http://localhost:8000/docs 2>/dev/null || \
		echo "$(YELLOW)Please visit: http://localhost:8000/docs$(NC)"

open-frontend: ## Open frontend in browser
	@echo "$(BLUE)Opening frontend...$(NC)"
	@open http://localhost:4321 2>/dev/null || \
		xdg-open http://localhost:4321 2>/dev/null || \
		echo "$(YELLOW)Please visit: http://localhost:4321$(NC)"

open-login: ## Open login page in browser
	@echo "$(BLUE)Opening login page...$(NC)"
	@open http://localhost:4321/login 2>/dev/null || \
		xdg-open http://localhost:4321/login 2>/dev/null || \
		echo "$(YELLOW)Please visit: http://localhost:4321/login$(NC)"

# Information Commands

info: ## Show project information
	@echo "$(BLUE)╔════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║        AI Builders Tutorial - Project Info            ║$(NC)"
	@echo "$(BLUE)╚════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Services:$(NC)"
	@echo "  Frontend: http://localhost:4321"
	@echo "  Backend:  http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"
	@echo ""
	@echo "$(GREEN)Directories:$(NC)"
	@echo "  Frontend: services/frontend/"
	@echo "  Backend:  services/backend/"
	@echo "  Docs:     docs/"
	@echo ""
	@echo "$(GREEN)Quick Commands:$(NC)"
	@echo "  make dev           - Start both services"
	@echo "  make dev-backend   - Start backend only"
	@echo "  make dev-frontend  - Start frontend only"
	@echo "  make setup         - Initial setup"
	@echo "  make help          - Show all commands"
	@echo ""
	@echo "$(GREEN)Documentation:$(NC)"
	@echo "  Setup Guide: docs/CIRCLE_AUTH_SETUP.md"
	@echo "  Quick Ref:   docs/QUICK_REFERENCE.md"
	@echo ""

# Translation Commands

translate: ## Trigger translation for a file (usage: make translate FILE=path/to/file.mdx LANG=zh-cn)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE is required$(NC)"; \
		echo "$(YELLOW)Usage: make translate FILE=Overview/tutorial_overview.mdx LANG=zh-cn$(NC)"; \
		echo "$(YELLOW)  FILE - Path relative to tutorials/ (required)$(NC)"; \
		echo "$(YELLOW)  LANG - Target language: zh-cn, ja-jp (default: zh-cn)$(NC)"; \
		exit 1; \
	fi
	@LANG=$${LANG:-zh-cn}; \
	echo "$(BLUE)Triggering translation...$(NC)"; \
	echo "  File: $(FILE)"; \
	echo "  Language: $$LANG"; \
	RESPONSE=$$(curl -s -X POST "http://localhost:8000/api/translations/request" \
		-H "Content-Type: application/json" \
		-d '{"source_files": ["$(FILE)"], "target_languages": ["'$$LANG'"], "priority": "manual"}'); \
	echo ""; \
	echo "$(GREEN)✓ Translation request submitted$(NC)"; \
	echo "$$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$$RESPONSE"

translate-status: ## Check translation status (usage: make translate-status ID=request-id)
	@if [ -z "$(ID)" ]; then \
		echo "$(RED)Error: ID is required$(NC)"; \
		echo "$(YELLOW)Usage: make translate-status ID=abc123-def456$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Checking translation status...$(NC)"
	@curl -s "http://localhost:8000/api/translations/status/$(ID)" | \
		python3 -m json.tool 2>/dev/null || \
		curl -s "http://localhost:8000/api/translations/status/$(ID)"

translate-check: ## Check available translations for a file (usage: make translate-check FILE=path/to/file.mdx)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: FILE is required$(NC)"; \
		echo "$(YELLOW)Usage: make translate-check FILE=Overview/tutorial_overview.mdx$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Checking available translations for: $(FILE)$(NC)"
	@curl -s "http://localhost:8000/api/translations/available?source_file_path=$(FILE)" | \
		python3 -m json.tool 2>/dev/null || \
		curl -s "http://localhost:8000/api/translations/available?source_file_path=$(FILE)"

translate-test: ## Run translation diagnostic test (shows all errors)
	@echo "$(BLUE)Running translation diagnostic test...$(NC)"
	@cd services/backend && \
	. venv/bin/activate && \
	python test_translation.py

translate-config: ## Show current translation configuration
	@echo "$(BLUE)Translation configuration:$(NC)"
	@curl -s "http://localhost:8000/api/translations/config" | \
		python3 -m json.tool 2>/dev/null || \
		curl -s "http://localhost:8000/api/translations/config"

# Docker Commands (for future use)

docker-build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	@docker-compose build

docker-up: ## Start services with Docker
	@echo "$(BLUE)Starting services with Docker...$(NC)"
	@docker-compose up

docker-down: ## Stop Docker services
	@echo "$(BLUE)Stopping Docker services...$(NC)"
	@docker-compose down

# Default target
.DEFAULT_GOAL := help
