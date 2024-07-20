import { Controller, Get, Param } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private rankingService: RankingService) {}
  @Get()
  async getRanking() {
    return await this.rankingService.getRankings();
  }

  @Get('/id/:id')
  async getRankingByTelegramId(@Param('id') id: string) {
    return await this.rankingService.getRankingByTelegramId(id);
  }
}
