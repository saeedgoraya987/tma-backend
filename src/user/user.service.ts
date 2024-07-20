import { Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RankingService } from 'src/ranking/ranking.service';
import { transformUserDto } from './dto/users-mapping';
import { UserResponseDto } from './dto/users-response.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private rankingService: RankingService,
  ) {}

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

    await this.rankingService.createRanking(dataRank);

    return user;
  }

  async getUserById(telegramId: string): Promise<UserResponseDto> {
    const user = await this.prismaService.user.findFirst({
      where: { telegramId: telegramId },
      include: { ranking: true },
    });
    if (!user) {
      return null;
    }

    return transformUserDto(user as User, user.ranking.totalScoreEarned);
  }

  async checkUserExist(telegramId: string): Promise<boolean> {
    const user = await this.getUserById(telegramId);
    if (!user) {
      return false;
    }
    return true;
  }

  async getUsersSortByRanking(): Promise<User[]> {
    const users = await this.prismaService.user.findMany({
      orderBy: { ranking: { ranking: 'desc' } },
    });
    return users;
  }
}
