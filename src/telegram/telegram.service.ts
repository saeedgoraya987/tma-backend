import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Bot } from 'grammy';
import { ReferralService } from 'src/referral/referral.service';
import { UserService } from 'src/user/user.service';
import { convertHexToNonBounceable } from 'src/utils/address';
import { getMonthDifference, getRandomDate } from 'src/utils/time';

@Injectable()
export class TelegramService {
  private bot: Bot;
  private tokenBot = this.configService.get<string>('BOT_TOKEN');
  private tmaUrl = this.configService.get<string>('TMA_URL');
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
      const username = ctx.from?.username;

      if (!username) {
        await ctx.reply(
          'Please set a username to start the app and rewrite command start.',
        );
        return;
      }

      const userProfilePhotos = await ctx.api.getUserProfilePhotos(id);

      let filePath: string;
      if (userProfilePhotos && userProfilePhotos.photos.length > 0) {
        const avatar = userProfilePhotos.photos[0][0].file_id;

        const fileResponse = await ctx.api.getFile(avatar);
        filePath = fileResponse.file_path;
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
                  url: this.tmaUrl,
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
      ctx.reply('Qac qac qac qac qac 🦆.');
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
    const message = await this.bot.api.sendMessage(userId, command);
    return message;
  }

  /**
   * Points will be calculated by the time randomly drawn from the following months multiplied by 10%.
   *
   * @param {Date} time
   * @return {*}  {Promise<number>}
   * @memberof TelegramService
   */
  async calculationPoint(time: Date): Promise<number> {
    const currentDate = new Date();
    const monthsDifference = getMonthDifference(time, currentDate);
    return monthsDifference * 10;
  }

  /**
   * Handles the activation of a referral process.
   * It checks if the inviter exists, starts the invitee as a user,
   * and creates a referral if the inviter and invitee are valid.
   *
   * @param {string} inviterId - The ID of the user who is inviting.
   * @param {number} inviteeId - The ID of the user who is being invited.
   * @param {string} username - The username of the invitee.
   * @param {string} [avatar] - The optional avatar URL of the invitee.
   * @return {Promise<void>} - A promise that resolves after processing the referral.
   * @memberof TelegramService
   */
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

  /**
   * Handles the creation of a new user in the system.
   * It generates a random registration date, calculates the user's points,
   * and attempts to create a new user in the database.
   *
   * @param {number} id - The Telegram ID of the user.
   * @param {string} username - The Telegram username of the user.
   * @param {string} [avatar] - The optional avatar URL of the user.
   * @return {Promise<void>} - A promise that resolves after attempting to create the user.
   * @memberof TelegramService
   */
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

  /**
   * Handles the creation of a referral between an inviter and an invitee.
   * It ensures that both the inviter and invitee exist, checks if the invitee
   * has already been referred, and creates a new referral entry if eligible.
   *
   * @param {number} inviterId - The ID of the user who is inviting.
   * @param {number} inviteeId - The ID of the user who is being invited.
   * @return {Promise<boolean>} - Returns `true` if the referral was created successfully, or `false` if it failed.
   * @memberof TelegramService
   */
  async handleCreateReferral(
    inviterId: number,
    inviteeId: number,
  ): Promise<boolean> {
    const inviter = await this.userService.getUserById(inviterId.toString());
    const invitee = await this.userService.getUserById(inviteeId.toString());

    if (!inviter || !invitee) {
      this.logger.error(`Inviter or Invitee not found`);
      return false;
    }

    const inviteeExist = await this.referralService.getReferralByInvitee(
      invitee.id,
    );

    if (inviteeExist) {
      this.logger.warn(`Referral already exists: ${invitee.username}`);
      return;
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

  convertToNonBounceable(hex: string): string {
    return convertHexToNonBounceable(hex);
  }
}
