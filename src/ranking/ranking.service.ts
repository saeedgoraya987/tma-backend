import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Rank } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { transformRankingDto } from './dto/ranking-mapping.dto';
import { RankingResponseDto } from './dto/ranking-reponse.dto';

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
    });
    if (!rankings) {
      return null;
    }
    return rankings.map((item) => transformRankingDto(item, item.user));
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

    return transformRankingDto(ranking as Rank, ranking.user);
  }
}
