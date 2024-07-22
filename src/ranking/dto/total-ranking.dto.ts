import { Expose } from 'class-transformer';
import { RankingResponseDto } from './ranking-reponse.dto';

export class TotalRankingDto {
  @Expose()
  totalHolder: number;

  @Expose()
  ranks: RankingResponseDto[];
}
