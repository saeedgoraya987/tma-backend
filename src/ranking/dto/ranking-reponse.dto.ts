import { Expose } from 'class-transformer';

export class RankingResponseDto {
  @Expose()
  telegramId: string;

  @Expose()
  username: string;

  @Expose()
  totalScore: string;

  @Expose()
  ranking: number;

  @Expose()
  avatarPath: string;
}
