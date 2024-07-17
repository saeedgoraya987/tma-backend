import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ERROR_TELEGRAM_ID_ALREADY_EXIST } from 'src/common/constant/error';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    if (this.checkUserExist(data.id)) {
      throw new BadRequestException(ERROR_TELEGRAM_ID_ALREADY_EXIST);
    }

    const user = await this.prismaService.user.create({
      data,
    });

    this.logger.log(`User created successfully: ${user}`);
    return true;
  }

  async checkUserExist(telegramId: number): Promise<boolean> {
    const user = await this.prismaService.user.findFirst({
      where: { id: telegramId },
    });
    if (!user) return false;
    return true;
  }
}
