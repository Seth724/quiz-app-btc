# Quiz App API

NestJS REST API with Prisma ORM and MongoDB for the Quiz App blockchain platform.

🌐 **Live Demo:** https://quizapp.sethna.me/  
📂 **Source Code:** https://github.com/Seth724/quiz-app-btc/tree/quiz-app-21

> ⚠️ **Deployment Note:** The live demo is hosted on a **GCP Virtual Private Server (3-month free tier)** expiring **March 16, 2026**. After this date, the URL may not be accessible. The VPS uses **Nginx reverse proxy** with **HTTPS/SSL** for secure connections.

---

## Purpose

This API provides:
- 🔐 JWT-based authentication & authorization
- 📊 Fast queries and filters for quizzes
- 🏆 Leaderboard calculations & rankings
- 📈 Student/teacher stats & analytics
- 🔗 Blockchain data indexing
- 💾 Caching layer for blockchain data
- 📝 Quiz CRUD operations
- 💰 Payment & withdrawal tracking

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS** | Node.js framework with dependency injection & modular architecture |
| **TypeScript** | Type-safe development |
| **MongoDB** | NoSQL database for user data & quiz metadata |
| **Prisma ORM** | Type-safe database queries, migrations & schema management |
| **JWT** | Secure session management & role-based access control |
| **Passport.js** | Authentication middleware |
| **class-validator** | DTO validation |
| **class-transformer** | Object transformation |

---

## Architecture

```
src/
  main.ts                   # Application entry point
  app.module.ts             # Root module

  common/                   # Shared code
    config/                 # Configuration (JWT, DB, BCN)
    filters/                # Global exception filters
    guards/                 # JWT auth guards
    pipes/                  # Validation pipes
    decorators/             # Custom decorators (@Public, @Roles)
    logger/                 # Custom logging service

  prisma/                   # Database layer
    prisma.module.ts
    prisma.service.ts
    schema.prisma           # Database schema

  modules/
    auth/                   # JWT authentication
      auth.controller.ts
      auth.service.ts
      strategies/           # JWT strategies
      dto/                  # Login/register DTOs

    quizzes/                # Quiz CRUD & queries
      quizzes.module.ts
      quizzes.controller.ts
      quizzes.service.ts
      dto/
        create-quiz.dto.ts
        update-quiz.dto.ts
        list-quizzes.dto.ts
      entities/
        quiz.entity.ts

    attempts/               # Quiz attempts tracking
    leaderboard/            # Leaderboard calculations
    users/                  # User profiles & management
    wallet/                 # Wallet operations
    indexer/                # Blockchain indexer (optional)
```

---

## Database Schema (Prisma)

The database stores:
- Quiz metadata (title, entry fee, reward, status, owner)
- Attempt records (who, when, score, correct answers)
- User profiles (public key, name, stats, role)
- Leaderboard aggregates (rank, total earnings, quizzes completed)
- Payment transactions (withdrawals, deposits)

> **Important:** Blockchain is the source of truth. The database acts as a cache/index for faster queries.

### Core Models

```prisma
model User {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  publicKey    String   @unique
  name         String?
  role         UserRole @default(STUDENT)
  quizzes      Quiz[]
  attempts     Attempt[]
  withdrawals  Withdrawal[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Quiz {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  moduleId     String   @unique  // Blockchain module ID
  title        String
  description  String?
  entryFee     BigInt
  rewardAmount BigInt
  teacherId    String
  teacher      User     @relation(fields: [teacherId], references: [publicKey])
  status       QuizStatus @default(DRAFT)
  attempts     Attempt[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Attempt {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  quizId    String
  quiz      Quiz     @relation(fields: [quizId], references: [id])
  studentId String
  student   User     @relation(fields: [studentId], references: [publicKey])
  score     Int?
  isCorrect Boolean?
  txId      String?  // Blockchain transaction ID
  createdAt DateTime @default(now())
}
```

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
# or
cp .env.api.template .env.local
```

Edit `.env.local` with your configuration:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="mongodb://localhost:27017/quiz-app"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRY="24h"

# Blockchain Configuration
CHAIN=LTC
NETWORK=regtest
BCN_URL=http://localhost:1031

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (create database schema)
npm run prisma:migrate

# (Optional) Open Prisma Studio for visual database browsing
npm run prisma:studio
```

### 4. Start API

Development mode (with hot-reload):
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

API will be available at `http://localhost:4000`

---

## API Documentation

Once running, visit:
- **Swagger UI:** `http://localhost:4000/api/docs`
- **OpenAPI JSON:** `http://localhost:4000/api-json`

---

## Key Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (teacher/student) |
| POST | `/auth/login` | Login with public key |
| POST | `/auth/refresh` | Refresh JWT token |
| GET | `/auth/me` | Get current user profile |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quizzes` | List quizzes with filters & pagination |
| GET | `/quizzes/:id` | Get quiz details |
| POST | `/quizzes` | Create quiz (authenticated teachers) |
| PATCH | `/quizzes/:id` | Update quiz |
| DELETE | `/quizzes/:id` | Delete quiz |
| GET | `/quizzes/teacher/:publicKey` | Get teacher's quizzes |

### Attempts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/attempts` | List attempts with filters |
| GET | `/attempts/:id` | Get attempt details |
| POST | `/attempts` | Record quiz attempt |
| GET | `/attempts/student/:publicKey` | Get student's attempts |
| GET | `/attempts/quiz/:quizId` | Get attempts for a quiz |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaderboard` | Get top students (paginated) |
| GET | `/leaderboard/:publicKey` | Get user rank & stats |
| GET | `/leaderboard/teacher/:publicKey` | Get teacher leaderboard |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:publicKey` | Get user profile |
| GET | `/users/:publicKey/stats` | Get user statistics |
| GET | `/users/:publicKey/quizzes` | Get user's quizzes |
| GET | `/users/:publicKey/attempts` | Get user's attempts |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet/balance` | Get wallet balance |
| POST | `/wallet/withdraw` | Request withdrawal |
| GET | `/wallet/transactions` | Get transaction history |

---

## Indexer Service

The optional indexer service syncs blockchain data to the database:

1. Polls blockchain at configurable intervals
2. Detects new quizzes, attempts, payments, etc.
3. Updates database accordingly

Enable in `.env.local`:
```env
INDEXER_ENABLED=true
INDEXER_INTERVAL_MS=30000
```

Run indexer:
```bash
npm run indexer:start
```

---

## Development

### Generate Module

```bash
# Generate a new module with controller and service
nest g module modules/my-module
nest g controller modules/my-module
nest g service modules/my-module
```

### Add Prisma Model

1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create migration
3. Run `npm run prisma:generate` to regenerate client

### Validation

All DTOs use `class-validator` decorators:

```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsNotEmpty()
  entryFee: number

  @IsNumber()
  @IsNotEmpty()
  rewardAmount: number
}
```

### Guards

Use JWT guard to protect routes:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Roles } from '@/common/decorators/roles.decorator'

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizzesController {
  @Post('create')
  @Roles('TEACHER')
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    // Only teachers can create quizzes
  }
}
```

---

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Run specific test file
npm test -- quizzes.service.spec.ts
```

---

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t quiz-app-api .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d api
```

### Manual Deployment

```bash
# Install dependencies
npm install --production

# Build
npm run build

# Set environment variables
export NODE_ENV=production
export DATABASE_URL="mongodb://..."
export JWT_SECRET="..."

# Start
npm run start:prod
```

### Required Environment Variables (Production)

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=mongodb://...
JWT_SECRET=<strong-random-secret>
JWT_EXPIRY=24h
CHAIN=LTC
NETWORK=mainnet
BCN_URL=https://...
CORS_ORIGIN=https://quizapp.sethna.me
```

---

## Error Handling

The API uses global exception filters for consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ],
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

---

## Logging

Custom logging service provides structured logging:

```typescript
import { Logger } from '@nestjs/common'

logger.log('Quiz created', { quizId, teacherId })
logger.error('Failed to create quiz', error)
logger.warn('Deprecated method called')
logger.debug('Detailed debug info')
```

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in development mode with hot-reload |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the application |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:reset` | Reset database |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run indexer:start` | Start blockchain indexer |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the main README.md for more information

---

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
