#!/bin/bash

# Circle Auth Development Server Startup Script

echo "🚀 Starting AI Builders Auth Servers..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if services/backend/.env exists
if [ ! -f "services/backend/.env" ]; then
    echo -e "${RED}❌ services/backend/.env not found${NC}"
    echo "Please create services/backend/.env from services/backend/.env.example"
    exit 1
fi

# Start backend server
echo -e "${BLUE}📦 Starting Backend Server...${NC}"
cd services/backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -q -r requirements.txt

# Start backend in background
python main.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend running on http://localhost:8000 (PID: $BACKEND_PID)${NC}"

# Go back to root directory
cd ../..

# Start frontend server
echo -e "${BLUE}📦 Starting Frontend Server...${NC}"
cd services/frontend

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing npm dependencies...${NC}"
    npm install
fi

npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend running on http://localhost:4321 (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}🎉 Both servers are running!${NC}"
echo ""
echo -e "  Frontend: ${BLUE}http://localhost:4321${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:8000${NC}"
echo -e "  API Docs: ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "  Login:    ${BLUE}http://localhost:4321/login${NC}"
echo ""
echo -e "${RED}Press Ctrl+C to stop all servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${BLUE}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Register cleanup function
trap cleanup INT TERM

# Wait for processes
wait
