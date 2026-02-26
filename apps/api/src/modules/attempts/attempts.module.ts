import { Module } from '@nestjs/common';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { AutoRewardService } from './auto-reward.service';

@Module({
  controllers: [AttemptsController],
  providers: [AttemptsService, AutoRewardService],
  exports: [AttemptsService, AutoRewardService],
})
export class AttemptsModule {}
