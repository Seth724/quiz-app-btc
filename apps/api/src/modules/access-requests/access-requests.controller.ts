import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccessRequestsService } from './access-requests.service';
import { AutoAccessService } from './auto-access.service';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { UpdateAccessRequestDto } from './dto/update-access-request.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Public } from '../../common/decorators';

@ApiTags('access-requests')
@Controller('access-requests')
export class AccessRequestsController {
  constructor(
    private readonly service: AccessRequestsService,
    private readonly autoAccessService: AutoAccessService,
  ) {}

  @Public()
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

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get access request by ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/auto-approve')
  @ApiOperation({ summary: 'Auto-approve an access request using stored teacher mnemonic' })
  async autoApprove(@Param('id') id: string) {
    return this.autoAccessService.autoApprove(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update an access request (approve, complete, reject)' })
  async update(@Param('id') id: string, @Body() dto: UpdateAccessRequestDto) {
    return this.service.update(id, dto);
  }
}
