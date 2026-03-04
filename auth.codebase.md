# Authentication Codebase Documentation

This document describes the authentication architecture. For implementation code, refer to the source files.

## Authentication Architecture

The QuizApp uses a dual authentication system:
1. **Wallet Authentication** - Blockchain-based (mnemonic/public key)
2. **JWT Authentication** - Traditional token-based for API access

## Authentication Flow

### 1. Wallet Connection

**Location**: `apps/web/src/features/wallet/`

```
User enters mnemonic → Computer instance created → Public key extracted → Wallet store updated
```

Key files:
- `components/WalletConnect.tsx` - UI for wallet connection
- `wallet.service.ts` - Wallet operations
- `stores/wallet.store.ts` - State management

### 2. User Authentication (JWT)

**Location**: `apps/web/src/services/backend/auth.service.ts`

```
Signup/Login → Backend validates → JWT tokens issued → Tokens stored in localStorage
```

Token flow:
1. Access token (1 hour expiry) - Used for API requests
2. Refresh token (7 days expiry) - Used to get new access tokens
3. Auto-refresh on 401 responses

### 3. Wallet Sync to Backend

**Location**: `apps/web/src/services/backend/user.service.ts`

After blockchain operations succeed, the wallet public key is synced to the backend:
```typescript
await authService.connectWallet({
  publicKey: blockchainPublicKey,
  mnemonic: mnemonic
})
```

This links the blockchain identity to the API user account.

## Backend Authentication (NestJS)

**Location**: `apps/api/src/auth/`

### Components

1. **auth.controller.ts** - Auth endpoints
   - `POST /auth/signup` - User registration
   - `POST /auth/login` - User login
   - `POST /auth/refresh` - Token refresh

2. **auth.service.ts** - Auth business logic
   - Password hashing with bcrypt
   - JWT token generation
   - Refresh token management

3. **guards/auth.guard.ts** - JWT validation
   - Extracts Bearer token from Authorization header
   - Validates JWT signature
   - Attaches userId to request

4. **schemas/** - MongoDB schemas
   - `user.schema.ts` - User documents
   - `refresh-token.schema.ts` - Refresh token documents

### Database Models

**User Schema** (`apps/api/src/auth/schemas/user.schema.ts`):
```typescript
{
  name: string,
  email: string (unique),
  password: string (hashed),
  publicKey: string (blockchain identity)
}
```

**RefreshToken Schema** (`apps/api/src/auth/schemas/refresh-token.schema.ts`):
```typescript
{
  token: string,
  userId: ObjectId,
  expiryDate: Date
}
```

## Token Management

### Frontend Storage

**Location**: `apps/web/src/services/backend/api.ts`

```typescript
const ACCESS_TOKEN_KEY = 'quiz_app_token'
const REFRESH_TOKEN_KEY = 'quiz_app_refresh_token'

// Storage
localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

// Retrieval
localStorage.getItem(ACCESS_TOKEN_KEY)
```

### Auto-Refresh Mechanism

When API returns 401:
1. Intercept response in `api.ts`
2. Call `/auth/refresh` with refresh token
3. If successful, retry original request with new token
4. If failed, clear tokens and redirect to login

### Backend Token Generation

**Location**: `apps/api/src/auth/auth.service.ts`

```typescript
async generateUserToken(userId) {
  const accessToken = jwtService.sign({ userId }, { expiresIn: '1h' })
  const refreshToken = uuidv4()
  await saveRefreshToken(refreshToken, userId)
  return { accessToken, refreshToken }
}
```

## Security Measures

### Password Security
- Minimum 6 characters
- Must contain letters and numbers
- Hashed with bcrypt before storage

### JWT Security
- Signed with secret from environment
- Short expiry (1 hour) for access tokens
- Long expiry (7 days) for refresh tokens
- Validated on every protected route

### CORS Configuration

**Location**: `apps/api/src/main.ts`

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
})
```

## Environment Variables

### Backend (apps/api/.env)
```env
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/quiz-app
PORT=3002
CORS_ORIGIN=http://localhost:3000
```

### Frontend (apps/web/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Protected Routes
All protected routes require:
```
Authorization: Bearer <access_token>
```

Example:
- `GET /api/quizzes` - List quizzes (requires auth)
- `POST /api/quizzes` - Create quiz (requires auth)

## Common Issues & Solutions

### 1. Token Expiry
**Issue**: Access token expires during long sessions
**Solution**: Auto-refresh mechanism handles this transparently

### 2. Wallet-User Mismatch
**Issue**: Different mnemonics create different public keys
**Solution**: Persist mnemonic in localStorage, sync to backend on first use

### 3. CORS Errors
**Issue**: Frontend can't reach backend
**Solution**: Ensure CORS_ORIGIN matches frontend URL exactly

### 4. Foreign Key Violations
**Issue**: Can't create quiz without linked user
**Solution**: Always sync wallet to backend before creating blockchain resources

## Testing Authentication

### Manual Testing

1. **Signup/Login**:
```bash
curl -X POST http://localhost:3002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'
```

2. **Protected Route**:
```bash
curl http://localhost:3002/api/quizzes \
  -H "Authorization: Bearer <your_token>"
```

### Frontend Console Testing

```javascript
// Check if logged in
localStorage.getItem('quiz_app_token')

// Simulate logout
localStorage.removeItem('quiz_app_token')
localStorage.removeItem('quiz_app_refresh_token')
```

## Best Practices

1. **Always check authentication status** before blockchain operations
2. **Sync wallet to backend** before creating quizzes/attempts
3. **Handle token expiry gracefully** with auto-refresh
4. **Never log mnemonics or tokens** in console
5. **Use HTTPS** in production for all API calls
6. **Implement rate limiting** on auth endpoints
7. **Validate all inputs** on both frontend and backend
