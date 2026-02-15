import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { ListQuizzesDto } from './dto/list-quizzes.dto';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  @ApiOperation({ summary: 'List all quizzes with filters' })
  @ApiResponse({ status: 200, description: 'Return all quizzes' })
  async findAll(@Query() query: ListQuizzesDto) {
    return this.quizzesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiResponse({ status: 200, description: 'Return the quiz' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new quiz (from blockchain)' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  async create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizzesService.create(createQuizDto);
  }

  @Get(':id/attempts')
  @ApiOperation({ summary: 'Get attempts for a quiz' })
  async getAttempts(@Param('id') id: string) {
    return this.quizzesService.getQuizAttempts(id);
  }
}
