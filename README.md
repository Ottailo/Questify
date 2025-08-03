# Questify - Gamified Task Management Platform

Questify is a revolutionary web application that transforms real-life tasks and goals into an engaging fantasy Role-Playing Game (RPG). The platform features a personalized AI "Game Master" called The Oracle, which actively guides users on their journey to productivity and personal growth.

## 🎮 Features

### Core Features
- **AI Oracle**: Personalized AI Game Master that creates quests from your goals
- **Quest System**: Transform real tasks into RPG quests with XP rewards
- **Leveling System**: Progressive leveling with increasing XP requirements
- **Avatar Customization**: Personalize your adventurer's appearance
- **Guild System**: Join or create guilds for collaborative quests
- **Real-time Chat**: WebSocket-powered guild chat
- **Leaderboards**: Compete with other adventurers
- **Hero Pass**: Seasonal battle pass with exclusive rewards
- **Store**: Purchase cosmetic items and upgrades

### Technical Features
- **FastAPI Backend**: High-performance Python API
- **React Frontend**: Modern, responsive UI with animations
- **PostgreSQL Database**: Reliable data storage
- **Redis Caching**: Fast leaderboard and session caching
- **ChromaDB**: Vector database for AI memory
- **WebSocket Support**: Real-time communication
- **Docker Compose**: Easy deployment and development

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- OpenAI API Key
- Tavily Search API Key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Questify
   ```

2. **Create environment file**
   ```bash
   # Create .env file in the backend directory
   cd backend
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```bash
   # Edit backend/.env with your API keys
   OPENAI_API_KEY=your_openai_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   SECRET_KEY=your_secret_key_here
   ```

4. **Start the application**
   ```bash
   # From the root directory
   docker-compose up --build
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
questify/
├── backend/                 # FastAPI Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── database.py     # Database configuration
│   │   ├── auth.py         # Authentication utilities
│   │   ├── crud.py         # CRUD operations
│   │   ├── oracle.py       # AI Oracle system
│   │   └── scheduler.py    # Background jobs
│   ├── main.py             # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── stores/         # Zustand state management
│   │   └── App.tsx         # Main application
│   ├── package.json        # Node.js dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── Dockerfile          # Frontend container
├── docker-compose.yml      # Service orchestration
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /token` - Login and get access token
- `GET /me` - Get current user info

### Quests
- `GET /quests` - Get user quests
- `POST /quests` - Create new quest
- `POST /quests/{id}/complete` - Complete quest

### Oracle
- `POST /oracle/interact` - Interact with AI Oracle

### Avatar
- `GET /avatar` - Get user avatar
- `POST /avatar` - Update avatar

### Guilds
- `GET /guilds/me` - Get user's guild
- `POST /guilds` - Create guild
- `GET /guilds/{id}/quests` - Get guild quests
- `POST /guilds/{id}/quests` - Create guild quest

### Leaderboards
- `GET /leaderboard` - Get leaderboard data

### Hero Pass
- `GET /hero-pass` - Get user's hero pass

### WebSocket
- `WS /ws/guild-chat` - Guild chat

## 🎨 Frontend Components

### Pages
- **Dashboard**: Main interface with quests and Oracle chat
- **Avatar Customization**: Customize your adventurer
- **Guild Hall**: Guild management and chat
- **Leaderboards**: View rankings
- **Store**: Purchase items and Hero Pass

### Features
- **Responsive Design**: Works on desktop and mobile
- **Animations**: Smooth transitions with Framer Motion
- **Dark Theme**: Fantasy-themed dark UI
- **Real-time Updates**: Live quest and chat updates

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and stats
- **quests**: Personal quests
- **avatars**: User avatar customization
- **guilds**: Guild information
- **guild_members**: Guild membership
- **guild_quests**: Collaborative quests
- **hero_passes**: Battle pass progress
- **user_inventory**: Cosmetic items

## 🤖 AI Oracle System

The Oracle uses:
- **OpenAI GPT-4**: Natural language processing
- **ChromaDB**: Memory storage for context
- **Tavily Search**: Web search for current information

### Oracle Actions
- **CREATE_QUEST**: Generate new quests from user goals
- **COMPLETE_QUEST**: Mark quests as complete
- **SEARCH_INTERNET**: Get current information
- **MESSAGE**: Provide guidance and motivation

## 🚀 Deployment

### Production Deployment
1. Set up a production server with Docker
2. Configure environment variables
3. Set up reverse proxy (Nginx)
4. Configure SSL certificates
5. Set up database backups

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
SECRET_KEY=your_secret_key

# Optional
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port
CHROMADB_URL=http://host:port
```

## 🧪 Development

### Running Locally
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📊 Performance

- **Backend**: FastAPI with async support
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for leaderboards and sessions
- **Frontend**: React with code splitting
- **CDN**: Static assets served via Nginx

## 🔒 Security

- **Authentication**: JWT tokens with bcrypt hashing
- **CORS**: Configured for production domains
- **Rate Limiting**: API rate limiting (to be implemented)
- **Input Validation**: Pydantic schemas for all inputs
- **SQL Injection**: SQLAlchemy ORM protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the troubleshooting section below

## 🔧 Troubleshooting

### Common Issues

**Docker containers won't start**
- Check if ports 3000, 8000, 5432, 6379 are available
- Ensure Docker and Docker Compose are installed

**Database connection errors**
- Verify PostgreSQL container is running
- Check DATABASE_URL in environment variables

**AI Oracle not responding**
- Verify OPENAI_API_KEY is set correctly
- Check API quota and billing

**Frontend not loading**
- Check if frontend container is running
- Verify Nginx configuration

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
```

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced quest templates
- [ ] Social features (friends, achievements)
- [ ] Integration with calendar apps
- [ ] Advanced analytics and insights
- [ ] Multi-language support
- [ ] Voice interaction with Oracle

### Technical Improvements
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Kubernetes deployment
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] Automated testing pipeline

---

**Questify** - Transform your life into an epic adventure! ⚔️✨ 