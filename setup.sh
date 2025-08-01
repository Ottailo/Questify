#!/bin/bash

echo "🎮 Welcome to Questify Setup! 🎮"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed."

# Create environment file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating environment file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env with your API keys before starting the application."
    echo "   Required keys: OPENAI_API_KEY, TAVILY_API_KEY, SECRET_KEY"
else
    echo "✅ Environment file already exists."
fi

echo ""
echo "🚀 To start Questify:"
echo "1. Edit backend/.env with your API keys"
echo "2. Run: docker-compose up --build"
echo "3. Access the application at http://localhost:3000"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "Happy questing! ⚔️✨" 