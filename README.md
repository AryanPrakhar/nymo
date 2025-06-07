# Nymo

An anonymous hyper-local community platform that enables users to share location-based content with anonymity.

## Features

- 🌍 **Anonymous & Location-Based**: No signup required - share updates based on your location
- 🔥 **Intelligent Ranking**: Smart algorithm that surfaces relevant, timely content
- 📱 **Mobile-First Design**: Responsive interface optimized for mobile devices
- ⚡ **Real-Time Interactions**: Vote and view posts with instant updates
- 🛡️ **Secure & Private**: Content sanitization, rate limiting, and privacy protection
- 🎯 **Hyper-Local Focus**: See what's happening in your immediate area

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database with optimized indexing
- **Anonymous session management**
- **Rate limiting** and security middleware
- **RESTful API** with comprehensive error handling

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for responsive styling
- **Vite** for fast development and building
- **Axios** for API communication
- **Location-based services** with geolocation API

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AryanPrakhar/nymo.git
cd nymo
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Set up the database:
```bash
npm run db:migrate
npm run db:seed
```

5. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend server on `http://localhost:3000`

## Project Structure

```
nymo/
├── server/                 # Backend application
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── scripts/           # Database scripts
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── dist/              # Production build
└── data/                  # SQLite database files
```

## API Endpoints

### Posts
- `GET /api/posts` - Get location-based posts
- `POST /api/posts` - Create a new post
- `POST /api/posts/:id/vote` - Vote on a post
- `POST /api/posts/:id/view` - Track post view

### Utility
- `GET /api/health` - Health check
- `GET /api/stats` - Platform statistics

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3001
DATABASE_PATH=./data/nymo.db
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your-secret-key-here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
POST_RATE_LIMIT_MAX=5
```

## Deployment

### Backend (Railway)
The backend is configured for Railway deployment with:
- `Procfile` for process management
- `railway.json` for build configuration
- Health check endpoint at `/api/health`

### Frontend (Netlify)
The frontend is configured for Netlify deployment with:
- `netlify.toml` for build and redirect rules
- Automatic API proxy to backend
- SPA routing support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with modern web technologies
- Inspired by the need for anonymous, location-based community interaction
- Designed with privacy and user experience in mind
