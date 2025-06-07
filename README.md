# Nymo 🌍

<<<<<<< HEAD
An anonymous hyper-local community platform that enables users to share location-based content with anonymity.
=======
**Anonymous hyper-local community platform** - like a digital bulletin board for your neighborhood, but actually cool.
>>>>>>> ea6757e649fc7579d03bd718dac25c241fb0de14

## What It Does
Share local updates, recommendations, and random thoughts with people nearby - completely anonymous. No accounts, no tracking, just local community vibes.

## Cool Tech I Used 🚀

**Backend**: Node.js + Express, SQLite, custom ranking algorithm (like Reddit's hot sort), geohashing for location privacy, anonymous sessions

**Frontend**: React 18, Tailwind CSS, Vite, real-time voting, infinite scroll, geolocation API

**Smart Features**: 
- Intelligent content ranking with time decay
- Location-aware without storing exact GPS
- Security-first design with rate limiting
- Mobile-first responsive UI

## Quick Start
```bash
# Backend
npm install && npm run db:migrate && npm run db:seed && npm start

# Frontend
cd client && npm install && npm run dev
```

## Why I Built This
Wanted to solve real community connection without social media noise. The fun challenge was building anonymous + location-aware system, plus implementing a custom ranking algorithm.

**Architecture**: Clean MVC pattern, RESTful API, optimized database indexing, component-based React, custom hooks for state management.

