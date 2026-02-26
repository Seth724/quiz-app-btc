import { Module } from '@nestjs/common';
import { AccessRequestsController } from './access-requests.controller';
import { AccessRequestsService } from './access-requests.service';
import { AutoAccessService } from './auto-access.service';

@Module({
  controllers: [AccessRequestsController],
  providers: [AccessRequestsService, AutoAccessService],
  exports: [AccessRequestsService, AutoAccessService],
})
export class AccessRequestsModule {}
