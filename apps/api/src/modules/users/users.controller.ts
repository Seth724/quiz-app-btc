import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':publicKey')
  @ApiOperation({ summary: 'Get user profile' })
  async findOne(@Param('publicKey') publicKey: string) {
    return this.usersService.findOne(publicKey);
  }

  @Post()
  @ApiOperation({ summary: 'Create user profile' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':publicKey/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getStats(@Param('publicKey') publicKey: string) {
    return this.usersService.getStats(publicKey);
  }
}
