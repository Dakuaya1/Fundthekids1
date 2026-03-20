import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current users Impact Score and Badges' })
  getProfile(@Request() req: any) {
    return this.gamificationService.getProfile(req.user.id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top 10 sponsors by Impact Score' })
  getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }

  @Get('sponsor-of-week')
  @ApiOperation({ summary: 'Get the top sponsor of the week' })
  getSponsorOfWeek() {
    return this.gamificationService.getSponsorOfWeek();
  }
}
