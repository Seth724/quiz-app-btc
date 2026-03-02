import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { ListQuizzesDto } from './dto/list-quizzes.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Public, Roles, CurrentUser } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import type { RequestUser } from '../auth/auth.service';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all quizzes with filters' })
  @ApiResponse({ status: 200, description: 'Return all quizzes' })
  async findAll(@Query() query: ListQuizzesDto) {
    return this.quizzesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiResponse({ status: 200, description: 'Return the quiz' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new quiz (from blockchain) – TEACHER only' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.quizzesService.create(createQuizDto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update quiz status (claimed, active, etc.) – authenticated' })
  async update(@Param('id') id: string, @Body() body: { isClaimed?: boolean; claimedBy?: string; isActive?: boolean }) {
    return this.quizzesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/attempts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get attempts for a quiz – authenticated' })
  async getAttempts(@Param('id') id: string) {
    return this.quizzesService.getQuizAttempts(id);
  }
}
