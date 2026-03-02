import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Public, CurrentUser } from '../../common/decorators';
import { RequestUser } from '../auth/auth.service';

@ApiTags('attempts')
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List attempts (optionally filtered by studentPubKey)' })
  async findAll(@Query('studentPubKey') studentPubKey?: string) {
    return this.attemptsService.findAll(studentPubKey);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get attempt by ID' })
  async findOne(@Param('id') id: string) {
    return this.attemptsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Record a new attempt – authenticated' })
  async create(
    @CurrentUser() user: RequestUser,
    @Body() createAttemptDto: CreateAttemptDto,
  ) {
    return this.attemptsService.create(createAttemptDto, user.userId);
  }
}
