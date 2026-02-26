import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Patch(':publicKey')
  @ApiOperation({ summary: 'Update user profile' })
  async update(
    @Param('publicKey') publicKey: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(publicKey, updateUserDto);
  }

  @Post(':publicKey/mnemonic')
  @ApiOperation({ summary: 'Store teacher mnemonic for auto-approve (base64 encoded)' })
  async storeMnemonic(
    @Param('publicKey') publicKey: string,
    @Body() body: { mnemonic: string },
  ) {
    return this.usersService.storeMnemonic(publicKey, body.mnemonic);
  }

  @Get(':publicKey/has-mnemonic')
  @ApiOperation({ summary: 'Check if teacher has stored mnemonic' })
  async hasMnemonic(@Param('publicKey') publicKey: string) {
    const has = await this.usersService.hasMnemonic(publicKey);
    return { hasMnemonic: has };
  }

  @Get(':publicKey/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getStats(@Param('publicKey') publicKey: string) {
    return this.usersService.getStats(publicKey);
  }
}
