import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { UsersModule } from './modules/users/users.module';
import { AccessRequestsModule } from './modules/access-requests/access-requests.module';
import { JwtAuthGuard } from './modules/auth/auth.guard';
import { RolesGuard } from './common/guards';
import { AllExceptionsFilter } from './common/filters';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig],
    }),
    PrismaModule,
    AuthModule,
    QuizzesModule,
    AttemptsModule,
    LeaderboardModule,
    UsersModule,
    AccessRequestsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // Global JWT guard — all routes require auth by default.
    // Use @Public() decorator to opt out.
    { provide: APP_GUARD, useClass: JwtAuthGuard },

    // Global roles guard — checks @Roles() decorator.
    { provide: APP_GUARD, useClass: RolesGuard },

    // Global exception filter — consistent error responses.
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
