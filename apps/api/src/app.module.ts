import { Module } from '@nestjs/common';
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
  providers: [AppService],
})
export class AppModule {}
