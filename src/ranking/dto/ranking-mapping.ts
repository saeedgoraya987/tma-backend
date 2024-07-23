import { Rank, User } from '@prisma/client';
import { RankingResponseDto } from './ranking-reponse.dto';

export const transformRankingDto = (
  rank: Rank,
  userRank: User,
): RankingResponseDto => {
  const dto = new RankingResponseDto();

  dto.telegramId = userRank.telegramId;
  dto.username = userRank.username;
  dto.avatarPath = userRank.avatarUrl;
  dto.ranking = rank.ranking;
  dto.totalScore = rank.totalScoreEarned.toString();
  dto.createdAt = userRank.createAt;
  return dto;
};
