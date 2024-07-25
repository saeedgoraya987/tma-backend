import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RankingService } from 'src/ranking/ranking.service';
import { transformUserDto } from './dto/users-mapping';
import { UserResponseDto } from './dto/users-response.dto';
import { updateWalletDto } from './dto/update-wallet.dto';
import { convertHexToNonBounceable } from 'src/utils/address';

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

  async updateWallet(requestDto: updateWalletDto): Promise<UserResponseDto> {
    const { telegramId, wallet } = requestDto;
    const address = convertHexToNonBounceable(wallet);

    const user = await this.getUserById(telegramId);

    if (!user)
      throw new BadRequestException(
        `User have telegram id ${telegramId} not exist`,
      );
    const scoreReward = 1000;
    const newRewardWallet =
      user.rewardWallet === 0 ? scoreReward : user.rewardWallet;

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        wallet: address,
        rewardWallet: newRewardWallet,
      },
    });

    await this.rankingService.updateRankingForAllUsers();

    this.logger.log(`User ${user.id} updated wallet successfully`);

    const userResponse = await this.getUserById(telegramId);
    return userResponse;
  }
}
