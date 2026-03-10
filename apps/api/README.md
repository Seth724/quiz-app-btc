# Quiz App API

NestJS 10 REST API with Prisma ORM and MongoDB for the Quiz App blockchain platform.

🌐 **Live Demo:** https://quizapp.sethna.me/  
📂 **Source Code:** https://github.com/Seth724/quiz-app-btc/tree/quiz-app-21

> ⚠️ **Deployment Note:** The live demo is hosted on a **GCP Virtual Private Server (3-month free tier)** expiring **March 16, 2026**. After this date, the URL may not be accessible. The VPS uses **Docker Compose** with **Nginx reverse proxy** and **HTTPS/SSL** for secure connections.

---

## Purpose

This API provides:
- 🔐 JWT-based authentication & authorization (global guards)
- 📊 Quiz CRUD operations & filtering
- 🏆 Leaderboard calculations & rankings
- 📈 Student/teacher statistics
- 📝 Quiz attempt tracking
- 🔗 Access request management
- 💾 MongoDB data persistence

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS 10** | Node.js framework with dependency injection & modular architecture |
| **TypeScript** | Type-safe development |
| **MongoDB** | NoSQL database for user data & quiz metadata |
| **Prisma 6** | Type-safe database queries, schema management |
| **JWT + Passport.js** | Authentication middleware & token management |
| **class-validator** | DTO validation |
| **class-transformer** | Object transformation |
| **Swagger/OpenAPI** | API documentation |

---

## Architecture

```
src/
  main.ts                   # Application entry point
  app.module.ts             # Root module
  app.controller.ts         # App controller
  app.service.ts            # App service

  config/                   # Configuration
    index.ts                # Config exports
    app.config.ts           # App configuration

  common/                   # Shared code
    decorators/             # Custom decorators (@Roles, @Public)
    guards/                 # JWT auth guard, Roles guard
    filters/                # Global exception filters
    logger/                 # Custom logging service
    index.ts                # Common exports

  prisma/                   # Database layer
    prisma.module.ts
    prisma.service.ts

  modules/                  # Feature modules
    auth/                   # JWT authentication
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      auth.guard.ts
      dto/                  # Login/register DTOs

    quizzes/                # Quiz CRUD & queries
      quizzes.module.ts
      quizzes.controller.ts
      quizzes.service.ts
      dto/                  # Create/update/list DTOs

    attempts/               # Quiz attempts tracking
      attempts.module.ts
      attempts.controller.ts
      attempts.service.ts

    leaderboard/            # Leaderboard calculations
      leaderboard.module.ts
      leaderboard.controller.ts
      leaderboard.service.ts

    users/                  # User profiles & management
      users.module.ts
      users.controller.ts
      users.service.ts

    access-requests/        # Access request handling
      access-requests.module.ts
      access-requests.controller.ts
      access-requests.service.ts
```

---

## Database Schema (Prisma)

The MongoDB database stores:

### Collections

| Collection | Description |
|------------|-------------|
| `users` | User accounts (teachers, students) |
| `quizzes` | Quiz metadata & blockchain references |
| `attempts` | Quiz attempt records |
| `leaderboard` | Leaderboard rankings |
| `access_requests` | Student access requests to teachers |
| `refresh_tokens` | JWT refresh tokens |

### Key Models

```prisma
model User {
  id                 String   @id @default(auto()) @map("_id") @db.ObjectId
  name               String
  email              String   @unique
  password           String
  publicKey          String?  @unique // Blockchain public key
  role               String   @default("STUDENT") // "TEACHER" | "STUDENT"
  encryptedMnemonic  String?  // Teacher mnemonic for auto-approve
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  refreshTokens  RefreshToken[]
  quizzesCreated Quiz[]
  attempts       Attempt[]

  @@map("users")
}

model Quiz {
  id            String   @id @map("_id") // blockchain txId
  title         String
  description   String?
  questionText  String
  options       String[]
  correctAnswer Int?
  rewardAmount  BigInt
  entryFee      BigInt
  isActive      Boolean  @default(true)
  isClaimed     Boolean  @default(false)
  teacherPubKey String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  teacher  User      @relation(fields: [teacherPubKey], references: [publicKey])
  attempts Attempt[]

  @@map("quizzes")
}

model Attempt {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  quizId         String
  studentPubKey  String
  selectedAnswer Int
  isCorrect      Boolean
  rewardEarned   BigInt
  attemptedAt    DateTime @default(now())
  blockchainTxId String?  @unique

  quiz    Quiz @relation(fields: [quizId], references: [id])
  student User @relation(fields: [studentPubKey], references: [publicKey])

  @@map("attempts")
}

model LeaderboardEntry {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  publicKey     String   @unique
  name          String?
  totalRewards  BigInt   @default(0)
  correctCount  Int      @default(0)
  totalAttempts Int      @default(0)
  rank          Int?
  updatedAt     DateTime @updatedAt

  @@map("leaderboard")
}

model AccessRequest {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  quizId            String
  quizTitle         String?
  studentPublicKey  String
  teacherPublicKey  String
  entryFee          String
  status            String   @default("pending")
  offerTxHex        String?
  accessTokenId     String?
  completedTxId     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  quiz Quiz @relation(fields: [quizId], references: [id])

  @@map("access_requests")
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
# or use template
cp ../../.env.api.template .env
```

Edit `.env`:

```env
# Server
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL="mongodb://localhost:27017/quiz-app"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Blockchain Configuration
BLOCKCHAIN_URL=http://localhost:1031

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database (development)
npm run prisma:push

# Open Prisma Studio for visual database browsing
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

API will be available at `http://localhost:3002`

---

## API Documentation

Once running, visit:
- **Swagger UI:** `http://localhost:3002/api/docs`
- **OpenAPI JSON:** `http://localhost:3002/api-json`

---

## Key Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user (teacher/student) |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh JWT token |
| GET | `/auth/me` | Get current user profile |

### Quizzes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quizzes` | List quizzes with filters |
| GET | `/quizzes/:id` | Get quiz details |
| POST | `/quizzes` | Create quiz (teachers only) |
| PATCH | `/quizzes/:id` | Update quiz |
| DELETE | `/quizzes/:id` | Delete quiz |
| GET | `/quizzes/teacher/:publicKey` | Get teacher's quizzes |

### Attempts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/attempts` | List attempts with filters |
| GET | `/attempts/:id` | Get attempt details |
| POST | `/attempts` | Record quiz attempt |
| GET | `/attempts/student/:pubKey` | Get student's attempts |
| GET | `/attempts/quiz/:quizId` | Get attempts for a quiz |

### Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leaderboard` | Get top students (paginated) |
| GET | `/leaderboard/:publicKey` | Get user rank & stats |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:publicKey` | Get user profile |
| GET | `/users/:publicKey/stats` | Get user statistics |
| GET | `/users/:publicKey/quizzes` | Get user's quizzes |
| GET | `/users/:publicKey/attempts` | Get user's attempts |

### Access Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/access-requests` | List access requests |
| POST | `/access-requests` | Create access request |
| PATCH | `/access-requests/:id` | Update request status |
| GET | `/access-requests/teacher/:pubKey` | Get teacher's requests |
| GET | `/access-requests/student/:pubKey` | Get student's requests |

---

## Authentication

### JWT Strategy

The API uses global JWT guards. All routes require authentication by default.

```typescript
// Global guard in app.module.ts
{ provide: APP_GUARD, useClass: JwtAuthGuard }
```

### Opt-out with @Public() decorator

```typescript
import { Public } from '@/common/decorators'

@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // No auth required
  }
}
```

### Role-based access with @Roles() decorator

```typescript
import { Roles } from '@/common/decorators'

@Post('create')
@Roles('TEACHER')
async createQuiz(@Body() createQuizDto: CreateQuizDto) {
  // Only teachers can create quizzes
}
```

---

## Development

### Generate Module

```bash
# Using NestJS CLI
nest g module modules/my-module
nest g controller modules/my-module
nest g service modules/my-module
```

### Add Prisma Model

1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:push` to update database
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
  rewardAmount: number

  @IsNumber()
  @IsNotEmpty()
  entryFee: number
}
```

### Guards

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) return true
    
    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.includes(user.role)
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

# Watch mode
npm run test:watch
```

---

## Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t quiz-app-api .

# Run with Docker Compose
docker compose -f docker-compose.prod.yml up -d quiz-api
```

### Manual Deployment (VPS)

```bash
# Install dependencies
npm install --production

# Build
npm run build

# Set environment variables
export NODE_ENV=production
export DATABASE_URL="mongodb://..."
export JWT_SECRET="<strong-random-secret>"

# Start with PM2
pm2 start dist/main.js --name "quiz-app-api"
```

### Required Environment Variables (Production)

```env
NODE_ENV=production
PORT=3002
DATABASE_URL=mongodb://...
JWT_SECRET=<strong-random-secret>
BLOCKCHAIN_URL=http://bcn:1031
CORS_ORIGIN=https://quizapp.sethna.me
```

---

## Error Handling

Global exception filter provides consistent error responses:

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

Custom logging service:

```typescript
import { Logger } from '@nestjs/common'

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name)

  async create(quizData: CreateQuizDto) {
    this.logger.log('Creating quiz', { title: quizData.title })
    // ...
  }
}
```

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start in development mode with hot-reload |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the application |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema to database |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Run ESLint |

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
- Check the root README.md for more information

---

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.
