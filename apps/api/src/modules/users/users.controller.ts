import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Public, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':publicKey')
  @ApiOperation({ summary: 'Get user profile by publicKey' })
  async findOne(@Param('publicKey') publicKey: string) {
    return this.usersService.findOne(publicKey);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create user profile – authenticated' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':publicKey')
  @ApiOperation({ summary: 'Update user profile – authenticated' })
  async update(
    @Param('publicKey') publicKey: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(publicKey, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @ApiBearerAuth()
  @Post(':publicKey/mnemonic')
  @ApiOperation({ summary: 'Store teacher mnemonic for auto-approve – TEACHER only' })
  async storeMnemonic(
    @Param('publicKey') publicKey: string,
    @Body() body: { mnemonic: string },
  ) {
    return this.usersService.storeMnemonic(publicKey, body.mnemonic);
  }

  @Public()
  @Get(':publicKey/has-mnemonic')
  @ApiOperation({ summary: 'Check if teacher has stored mnemonic' })
  async hasMnemonic(@Param('publicKey') publicKey: string) {
    const has = await this.usersService.hasMnemonic(publicKey);
    return { hasMnemonic: has };
  }

  @Public()
  @Get(':publicKey/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getStats(@Param('publicKey') publicKey: string) {
    return this.usersService.getStats(publicKey);
  }
}
