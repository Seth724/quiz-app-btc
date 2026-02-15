import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';

@ApiTags('attempts')
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Get()
  @ApiOperation({ summary: 'List all attempts' })
  async findAll(@Query('studentPubKey') studentPubKey?: string) {
    return this.attemptsService.findAll(studentPubKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attempt by ID' })
  async findOne(@Param('id') id: string) {
    return this.attemptsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Record a new attempt' })
  async create(@Body() createAttemptDto: CreateAttemptDto) {
    return this.attemptsService.create(createAttemptDto);
  }
}
