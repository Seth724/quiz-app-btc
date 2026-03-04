/**
 * Backend service barrel export
 *
 * Usage:
 *   import { authService, quizService, attemptService } from '@/services/backend'
 */

export { api, setTokens, clearTokens, hasAuthToken } from './api';
export { authService } from './auth.service';
export type { SignupRequest, LoginRequest, AuthResponse, AuthUser, ConnectWalletRequest } from './auth.service';

export { quizService } from './quiz.service';
export type { QuizResponse, QuizListResponse, CreateQuizRequest } from './quiz.service';

export { attemptService } from './attempt.service';
export type { AttemptResponse, CreateAttemptRequest, AutoRewardData } from './attempt.service';

export { leaderboardService } from './leaderboard.service';
export type { LeaderboardEntry } from './leaderboard.service';

export { userService } from './user.service';
export type { UserProfile, UserStats, CreateUserRequest } from './user.service';

export { accessRequestService } from './access-request.service';
export type { AccessRequestData, AutoApproveData } from './access-request.service';
