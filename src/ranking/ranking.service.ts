import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, Rank } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { transformRankingDto } from './dto/ranking-mapping';
import { RankingResponseDto } from './dto/ranking-reponse.dto';
import { TotalRankingDto } from './dto/total-ranking.dto';

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(private prismaService: PrismaService) {}

  async createRanking(data: Prisma.RankCreateInput): Promise<Rank> {
    const rank = await this.prismaService.rank.create({
      data,
    });

    await this.updateRankingForAllUsers();
    return rank;
  }

  async updateRankingForUser(userId: number) {
    const userRank = await this.prismaService.rank.findUnique({
      where: { inviterId: userId },
    });

    if (userRank) {
      const referrals = await this.prismaService.referal.findMany({
        where: { inviterId: userId },
      });
      const totalScoreEarned = referrals.reduce(
        (total, referral) => total + referral.scoreEarned,
        0,
      );

      await this.prismaService.rank.update({
        where: { inviterId: userId },
        data: {
          totalScoreEarned,
          numFriends: referrals.length,
        },
      });
    }
  }

  async updateRankingForAllUsers() {
    const users = await this.prismaService.user.findMany({
      include: {
        invitationsSent: true,
        ranking: true,
      },
    });

    for (const user of users) {
      const totalScoreEarned =
        user.rewardWallet +
        user.point +
        user.invitationsSent.reduce(
          (total, referral) => total + referral.scoreEarned,
          0,
        );

      const numFriends = user.invitationsSent.length;

      await this.prismaService.rank.update({
        where: { inviterId: user.id },
        data: {
          totalScoreEarned,
          numFriends,
          ranking: 0,
        },
      });
    }

    const updatedRanks = await this.prismaService.rank.findMany({
      orderBy: { totalScoreEarned: 'desc' },
    });

    for (let i = 0; i < updatedRanks.length; i++) {
      await this.prismaService.rank.update({
        where: { id: updatedRanks[i].id },
        data: { ranking: i + 1 },
      });
    }

    this.logger.log('Ranking updated for all users');
  }

  async getRankings(): Promise<RankingResponseDto[]> {
    const rankings = await this.prismaService.rank.findMany({
      include: { user: true },
      orderBy: { totalScoreEarned: 'desc' },
      take: 100,
    });

    if (!rankings) {
      return null;
    }
    return rankings.map((item) => transformRankingDto(item, item.user));
  }

  async getRanks(): Promise<TotalRankingDto> {
    const dto = new TotalRankingDto();
    const totalHolder = await this.prismaService.rank.count();
    dto.totalHolder = totalHolder;
    dto.ranks = await this.getRankings();
    return dto;
  }

  async getRankingByTelegramId(
    telegramId: string,
  ): Promise<RankingResponseDto> {
    const ranking = await this.prismaService.rank.findFirst({
      where: {
        user: {
          telegramId: telegramId,
        },
      },
      include: {
        user: true,
      },
    });
    if (!ranking) {
      throw new BadRequestException(`Telegram id ${telegramId} not found`);
    }
    return transformRankingDto(ranking as Rank, ranking.user);
  }

  async getCurrentScoreByUserId(userId: number): Promise<number> {
    const score = await this.prismaService.rank.findFirst({
      select: { totalScoreEarned: true },
      where: { inviterId: userId },
    });
    return score.totalScoreEarned;
  }

  async updateScore(userId: number, score: number) {
    const currentScore = await this.getCurrentScoreByUserId(userId);

    await this.prismaService.rank.update({
      where: { inviterId: userId },
      data: {
        totalScoreEarned: currentScore + score,
      },
    });

    this.logger.log(`User ${userId} update point successfully`);
  }
}
