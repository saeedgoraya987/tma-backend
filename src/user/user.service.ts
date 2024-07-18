import { Prisma, User } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    const userExist = await this.checkUserExist(data.telegramId);
    if (userExist) {
      this.logger.log('User already exists with id: ', data.telegramId);
      return false;
    }
    const user = await this.prismaService.user.create({
      data,
    });

    this.logger.log(`User created successfully: ${JSON.stringify(user)}`);

    return true;
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
}
