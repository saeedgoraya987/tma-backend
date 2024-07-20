import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Bot } from 'grammy';
import { ReferralService } from 'src/referral/referral.service';
import { UserService } from 'src/user/user.service';
import { getMonthDifference, getRandomDate } from 'src/utils/time';

@Injectable()
export class TelegramService {
  private bot: Bot;
  private tokenBot = this.configService.get<string>('BOT_TOKEN');
  private groupId: string;
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private referralService: ReferralService,
  ) {
    this.bot = new Bot(this.tokenBot);

    this.bot.command('start', async (ctx) => {
      const args = ctx.match;
      const id = ctx.from.id;
      const username = ctx.from.username;

      const userProfilePhotos = await ctx.api.getUserProfilePhotos(id);
      let filePath: string;
      if (userProfilePhotos && userProfilePhotos.photos.length > 0) {
        const avatar = userProfilePhotos.photos[0][0].file_id;

        const fileResponse = await ctx.api.getFile(avatar);
        filePath = fileResponse.file_path;
        console.log('File: ' + filePath);
        const photo = `https://api.telegram.org/file/bot${this.bot.token}/${filePath}`;
        console.log('Photo URL: ', photo);
      } else {
        console.log('No profile photo available.');
      }

      await this.handleActivateReferral(args, id, username, filePath);

      ctx.reply('Welcome! This is a start command.', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Open Mini App',
                web_app: {
                  url: 'https://hopefully-loved-cougar.ngrok-free.app',
                },
              },
            ],
          ],
        },
      });
    });

    this.bot.command('help', (ctx) => {
      ctx.reply('This is the help command.');
    });

    this.bot.command('quac', (ctx) => {
      ctx.reply('Quác quác quác quác quác quác.');
    });

    this.bot.on('message', (ctx) => {
      console.log('Received message:', ctx.message);
    });
  }

  onModuleInit() {
    this.bot.start();
  }

  getCreateDate(userId: number) {
    if (!this.groupId) {
      throw new Error('Group ID not set. Add the bot to a group first.');
    }
    const command = `/id ${userId}`;
    return this.bot.api.sendMessage(this.groupId, command);
  }

  async sendCommandToCreationDateBot(userId: number) {
    const command = `/id ${userId}`;
    const message = await this.bot.api.sendMessage(747653812, command);
    return message;
  }

  async calculationPoint(time: Date): Promise<number> {
    const currentDate = new Date();
    const monthsDifference = getMonthDifference(time, currentDate);
    return monthsDifference * 10;
  }

  async handleActivateReferral(
    inviterId: string,
    inviteeId: number,
    username: string,
    avatar?: string,
  ) {
    const inviterExist = await this.userService.checkUserExist(
      inviterId.toString(),
    );

    if (!inviterId || !inviterExist) {
      await this.handleUserStart(Number(inviteeId), username, avatar);
      return;
    }

    await this.handleUserStart(inviteeId, username, avatar);

    if (Number(inviterId) === inviteeId) {
      return;
    }

    await this.handleCreateReferral(Number(inviterId), inviteeId);
  }

  async handleUserStart(id: number, username: string, avatar?: string) {
    const startDate = new Date(2010, 0, 1);
    const endDate = new Date(2023, 11, 31);

    const randomDate = getRandomDate(startDate, endDate);
    const point = await this.calculationPoint(randomDate);

    const data: Prisma.UserCreateInput = {
      telegramId: id.toString(),
      username: username,
      avatarUrl: avatar,
      point: point,
      registered: randomDate,
      createAt: new Date(),
    };
    const newUser = await this.userService.createUser(data);

    return newUser
      ? this.logger.log(`User created successfully: ${JSON.stringify(newUser)}`)
      : this.logger.log(
          `User already exists with telegram id: ${data.telegramId} `,
        );
  }

  async handleCreateReferral(
    inviterId: number,
    inviteeId: number,
  ): Promise<boolean> {
    const inviter = await this.userService.getUserById(inviterId.toString());
    const invitee = await this.userService.getUserById(inviteeId.toString());

    const referralExist = await this.referralService.getReferralByInvitee(
      invitee.id,
    );
    if (referralExist) {
      return false;
    }
    const data: Prisma.ReferalCreateInput = {
      inviter: { connect: { id: inviter.id } },
      invitee: { connect: { id: invitee.id } },
      scoreEarned: (invitee.point * 100) / 1000,
      createAt: new Date(),
    };
    const referral = await this.referralService.createReferral(data);
    this.logger.log(
      `Inviter ${referral.inviterId} referral user ${referral.inviteeId} successfully `,
    );
    return true;
  }
}
