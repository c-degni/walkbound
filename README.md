# WalkBound

## Directory Layout

```
walkbound/
├── README.md                    # Project documentation & setup guide
│
├── client/                      # React Native Frontend (Expo)
│   ├── App.js                  # Navigation & HealthKit initialization
│   ├── package.json            # Frontend dependencies
│   └── src/
│       ├── screens/            # UI Screens
│       │   ├── HomeScreen.js          # Step tracking & daily focus
│       │   ├── CharacterScreen.js     # Stats, level, equipment display
│       │   ├── BossFightScreen.js     # Boss tap-to-attack interface
│       │   ├── FriendsScreen.js       # Friend leaderboard
│       │   └── LoginScreen.js         # Authentication
│       └── services/
│           └── api.js          # Backend API communication layer
│
├── server/                      # Node.js + Express Backend
│   ├── index.js                # Server entry point & routes setup
│   ├── package.json            # Backend dependencies
│   ├── models/                 # MongoDB Schemas
│   │   ├── User.js            # User, stats, steps, equipment
│   │   └── Boss.js            # Weekly boss data
│   ├── routes/                 # API Endpoints
│   │   ├── auth.js            # Login/register
│   │   ├── steps.js           # Step sync & stat calculation
│   │   ├── character.js       # Get character data
│   │   ├── friends.js         # Friend system
│   │   └── boss.js            # Boss fighting logic
│   └── middleware/
│       └── auth.js            # JWT authentication
│
└── docs/                        # Presentation materials (to be created)
```

## Feature Ownership by Role

### 1. Backend Engineer
**Files:** `server/routes/steps.js`, `server/models/User.js`
- [ ] Implement step-to-stat conversion algorithm
- [ ] Calculate step rate (steps/hour)
- [ ] Track hourly step data
- [ ] Apply daily focus multipliers
- [ ] XP calculation: `10000 * 1.15^(level-1)`

### 2. Mobile Engineer
**Files:** `client/src/screens/HomeScreen.js`, `client/src/screens/BossFightScreen.js`
- [ ] HealthKit/Google Fit integration
- [ ] Real-time step updates
- [ ] Boss fight animations
- [ ] Tap-to-attack mechanics with haptics

### 3. Gameplay & Logic Developer
**Files:** `server/routes/boss.js`, `server/models/User.js`, `server/models/Boss.js`
- [ ] Power ranking formula: `PR = 0.3*B + 0.23*S + 0.23*I + 0.23*E`
- [ ] Equipment effects (sword/hat/chestplate)
- [ ] Boss spawn system (weekly)
- [ ] Hit/miss calculation (80% accuracy)
- [ ] Boss counter-attack (30% chance)
- [ ] Walking pattern detection for stat allocation

### 4. UI/UX & Presentation Developer
**Files:** All `client/src/screens/*.js`, `docs/`
- [ ] Polish UI animations
- [ ] Create presentation slides
- [ ] Design equipment icons/visuals
- [ ] Boss character design
- [ ] Demo video recording

## Integration Points

### Client ↔ Server Communication
All handled through `client/src/services/api.js`:
- POST `/api/auth/login` - Authentication
- POST `/api/steps/update` - Sync steps from HealthKit
- GET `/api/character` - Fetch character stats
- GET `/api/friends` - Friend leaderboard
- POST `/api/boss/attack` - Attack boss

### Data Flow
1. **HealthKit** → HomeScreen → `api.syncStepsToServer()` → Server
2. **Server** calculates stat gains → Stores in MongoDB
3. **Client** fetches updated character → Displays in CharacterScreen
4. **Boss Fight** → Tap attack → Server validates → Updates boss HP

## Quick Start Commands

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm start  # or 'npm run ios' for iOS simulator
```

## Key Algorithms

### Power Ranking
```javascript
// Balance: how close stats are to each other
const avg = (S + I + E) / 3;
const balance = 1 - (|S-avg| + |I-avg| + |E-avg|) / (3*avg);
PR = 0.3 * balance * 100 + 0.23*S + 0.23*I + 0.23*E
```

### Stat Growth
- Base level up: +10 all stats
- Running (high step rate): +strength
- Early morning steps: +intelligence  
- Consistent walking: +endurance
- Daily focus: 2x multiplier on chosen stat

## Demo Flow for Presentation
1. Show login screen
2. Display today's steps updating live
3. Set daily focus on "Strength"
4. Show character screen with stats
5. Navigate to boss fight
6. Demonstrate tap-to-attack with damage numbers
7. Show friend leaderboard with power rankings
8. Highlight equipment system

## TODOs Before Demo
- [ ] Seed database with a test boss
- [ ] Add at least 3 test users as friends
- [ ] Implement equipment drops from boss
- [ ] Add visual feedback for level ups
- [ ] Create presentation deck in `/docs`
- [ ] Test full user journey end-to-end