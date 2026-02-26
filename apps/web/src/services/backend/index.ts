/**
 * Backend service barrel export
 *
 * Usage:
 *   import { authService, quizService, attemptService } from '@/services/backend'
 */

export { api, setToken, clearToken } from './api';
export { authService } from './auth.service';
export type { LoginRequest, LoginResponse, AuthUser } from './auth.service';

export { quizService } from './quiz.service';
export type { QuizResponse, QuizListResponse, CreateQuizRequest } from './quiz.service';

export { attemptService } from './attempt.service';
export type { AttemptResponse, CreateAttemptRequest } from './attempt.service';

export { leaderboardService } from './leaderboard.service';
export type { LeaderboardEntry } from './leaderboard.service';

export { userService } from './user.service';
export type { UserProfile, UserStats, CreateUserRequest } from './user.service';

export { accessRequestService } from './access-request.service';
export type { AccessRequestData } from './access-request.service';
