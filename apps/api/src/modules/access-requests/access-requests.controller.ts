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
  @ApiOperation({ summary: 'Create a new access request' })
  async create(@Body() dto: CreateAccessRequestDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/auto-approve')
  @ApiOperation({ summary: 'Get auto-approve data for frontend blockchain processing' })
  async autoApprove(@Param('id') id: string) {
    return this.autoAccessService.getAutoApproveData(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update an access request (approve, complete, reject)' })
  async update(@Param('id') id: string, @Body() dto: UpdateAccessRequestDto) {
    return this.service.update(id, dto);
  }
}
