#!/bin/bash
# POA Dashboard - Setup Script
# Run this on a fresh machine to get everything working

set -e

echo "=========================================="
echo "  POA Dashboard - Setup"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "Node.js not found. Install it with: brew install node"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "Python3 not found. Install it with: brew install python@3.11"
    exit 1
fi

echo -e "${GREEN}Prerequisites OK${NC}"

# Backend setup
echo -e "\n${YELLOW}Setting up Backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt --quiet

# Initialize database if needed
if [ ! -f "poa.db" ]; then
    echo "Initializing database..."
    python -c "from app.database import init_db; init_db()"
    echo "Seeding data (this takes ~30 seconds)..."
    python seed_data.py
fi

echo -e "${GREEN}Backend ready${NC}"

# Frontend setup
echo -e "\n${YELLOW}Setting up Frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    npm install --silent
fi

echo -e "${GREEN}Frontend ready${NC}"

# Start services
echo -e "\n${YELLOW}Starting services...${NC}"
cd ../backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 > /tmp/poa_backend.log 2>&1 &
BACKEND_PID=$!

cd ../frontend
npm run dev > /tmp/poa_frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for services
echo "Waiting for services to start..."
sleep 5

echo -e "\n${GREEN}=========================================="
echo "  POA Dashboard is running!"
echo "==========================================${NC}"
echo ""
echo "  Frontend:  http://localhost:3001"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "  Logs:"
echo "    tail -f /tmp/poa_backend.log"
echo "    tail -f /tmp/poa_frontend.log"
echo ""
echo "  To stop: kill $BACKEND_PID $FRONTEND_PID"
echo ""
