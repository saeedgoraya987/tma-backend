import { Prisma, Rank, User } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const userExist = await this.checkUserExist(data.telegramId);
    if (userExist) {
      return null;
    }
    const user = await this.prismaService.user.create({
      data,
    });
    const dataRank: Prisma.RankCreateInput = {
      user: { connect: { id: user.id } },
      totalScoreEarned: user.point,
      createAt: new Date(),
    };

    await this.createRanking(dataRank);

    return user;
  }

  async getUserById(telegramId: string): Promise<User> {
    const user = await this.prismaService.user.findFirst({
      where: { telegramId: telegramId },
    });
    return user;
  }

  async checkUserExist(telegramId: string): Promise<boolean> {
    const user = await this.getUserById(telegramId);
    if (!user) {
      return false;
    }
    return true;
  }

  async createRanking(data: Prisma.RankCreateInput): Promise<Rank> {
    const rank = await this.prismaService.rank.create({
      data,
    });

    return rank;
  }
}
