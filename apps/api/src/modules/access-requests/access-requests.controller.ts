import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccessRequestsService } from './access-requests.service';
import { AutoAccessService } from './auto-access.service';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { UpdateAccessRequestDto } from './dto/update-access-request.dto';

@ApiTags('access-requests')
@Controller('access-requests')
export class AccessRequestsController {
  constructor(
    private readonly service: AccessRequestsService,
    private readonly autoAccessService: AutoAccessService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List access requests with optional filters' })
  async findAll(
    @Query('quizId') quizId?: string,
    @Query('studentPublicKey') studentPublicKey?: string,
    @Query('teacherPublicKey') teacherPublicKey?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ quizId, studentPublicKey, teacherPublicKey, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get access request by ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new access request (auto-approves if teacher has stored mnemonic)' })
  async create(@Body() dto: CreateAccessRequestDto) {
    const request = await this.service.create(dto);

    // Auto-approve if teacher has a stored mnemonic
    if (request.status === 'pending') {
      const hasKey = await this.autoAccessService.hasMnemonic(dto.teacherPublicKey);
      if (hasKey) {
        const result = await this.autoAccessService.autoApprove(request.id);
        if (result.status === 'approved') {
          return this.service.findOne(request.id);
        }
      }
    }

    return request;
  }

  @Post(':id/auto-approve')
  @ApiOperation({ summary: 'Auto-approve an access request using stored teacher mnemonic' })
  async autoApprove(@Param('id') id: string) {
    return this.autoAccessService.autoApprove(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an access request (approve, complete, reject)' })
  async update(@Param('id') id: string, @Body() dto: UpdateAccessRequestDto) {
    return this.service.update(id, dto);
  }
}
