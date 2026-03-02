import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { Public } from '../../common/decorators';

@Public()
@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get leaderboard top entries' })
  async getLeaderboard(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    return this.leaderboardService.getLeaderboard(parsedLimit);
  }

  @Get(':publicKey')
  @ApiOperation({ summary: 'Get user rank and stats' })
  async getUserRank(@Param('publicKey') publicKey: string) {
    return this.leaderboardService.getUserRank(publicKey);
  }
}
