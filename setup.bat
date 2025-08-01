@echo off
echo 🎮 Welcome to Questify Setup! 🎮
echo ==================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed.

REM Create environment file if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating environment file...
    copy "backend\env.example" "backend\.env"
    echo ⚠️  Please edit backend\.env with your API keys before starting the application.
    echo    Required keys: OPENAI_API_KEY, TAVILY_API_KEY, SECRET_KEY
) else (
    echo ✅ Environment file already exists.
)

echo.
echo 🚀 To start Questify:
echo 1. Edit backend\.env with your API keys
echo 2. Run: docker-compose up --build
echo 3. Access the application at http://localhost:3000
echo.
echo 📚 For more information, see README.md
echo.
echo Happy questing! ⚔️✨
pause 