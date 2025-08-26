#!/bin/bash

# Debt Collection Testing Platform - Startup Script

echo "🚀 Starting Debt Collection Testing Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file and add your OPENAI_API_KEY"
    echo "   Example: OPENAI_API_KEY=sk-your-key-here"
    echo ""
fi

# Start the server
echo "🌐 Starting server on http://localhost:3000"
echo "📋 Homepage: http://localhost:3000/"
echo "👥 Test Agents: http://localhost:3000/test-agents"
echo "💬 Simulate: http://localhost:3000/simulate"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

npm start