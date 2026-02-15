# Quiz App API

NestJS REST API with Prisma for the Quiz App blockchain platform.

## Purpose

This API provides:
- Fast queries and filters for quizzes
- Leaderboard calculations
- Student/teacher stats
- Blockchain data indexing
- Caching layer

## Architecture

```
src/
  main.ts                   # Entry point
  app.module.ts             # Root module
  
  common/                   # Shared code
    config/                 # Configuration
    filters/                # Exception filters
    guards/                 # Auth guards
    pipes/                  # Validation pipes
    decorators/             # Custom decorators
    
  prisma/                   # Database
    prisma.module.ts
    prisma.service.ts
    
  modules/
    quizzes/                # Quiz CRUD & queries
      quizzes.module.ts
      quizzes.controller.ts
      quizzes.service.ts
      dto/
        create-quiz.dto.ts
        list-quizzes.dto.ts
      entities/
        quiz.entity.ts
        
    attempts/               # Quiz attempts
    leaderboard/            # Leaderboard stats
    users/                  # User profiles
    indexer/                # Blockchain indexer (optional)
```

## Database Schema (Prisma)

The database stores:
- Quiz metadata (title, entry fee, reward, status)
- Attempt records (who, when, correct?)
- User profiles (public key, name, stats)
- Leaderboard aggregates

**Blockchain is the source of truth. Database is a cache/index.**

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your database URL and blockchain config.

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Start API

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

API will be available at `http://localhost:3001`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:3001/api`
- OpenAPI JSON: `http://localhost:3001/api-json`

## Key Endpoints

### Quizzes
- `GET /quizzes` - List quizzes with filters
- `GET /quizzes/:id` - Get quiz details
- `POST /quizzes` - Create quiz (from blockchain event)
- `PATCH /quizzes/:id` - Update quiz

### Attempts
- `GET /attempts` - List attempts
- `GET /attempts/:id` - Get attempt details
- `POST /attempts` - Record attempt

### Leaderboard
- `GET /leaderboard` - Get top students
- `GET /leaderboard/:publicKey` - Get user rank

### Users
- `GET /users/:publicKey` - Get user profile
- `GET /users/:publicKey/stats` - Get user stats

## Indexer

The optional indexer service syncs blockchain data to the database:

1. Polls blockchain at intervals
2. Detects new quizzes, attempts, etc.
3. Updates database

Enable in `.env`:
```
INDEXER_ENABLED=true
INDEXER_INTERVAL_MS=30000
```

## Development

### Generate Module

```bash
nest g module modules/my-module
nest g controller modules/my-module
nest g service modules/my-module
```

### Add Prisma Model

1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Run `npm run prisma:generate`

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

Build and deploy:
```bash
npm run build
npm run start:prod
```

Environment variables needed in production:
- `DATABASE_URL`
- `PORT`
- `NODE_ENV=production`
- Blockchain config
- CORS settings
