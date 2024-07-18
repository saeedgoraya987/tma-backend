import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Bot, Context, InlineKeyboard, Keyboard } from 'grammy';
import { UserService } from 'src/user/user.service';
import { getMonthDifference, getRandomDate } from 'src/utils/time';

@Injectable()
export class TelegramService {
  private bot: Bot;
  private tokenBot = this.configService.get<string>('BOT_TOKEN');
  private groupId: string;
  private creationDateBotUsername = '@creationdatebot';

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.bot = new Bot(this.tokenBot);

    this.bot.command('start', async (ctx) => {
      const args = ctx.match;
      console.log('args: ' + args);

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

      const id = ctx.from.id;
      const username = ctx.from.username;
      await this.handleUserStart(id, username);
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

  async handleUserStart(
    id: number,
    username: string,
    time?: string,
  ): Promise<boolean> {
    const startDate = new Date(2010, 0, 1);
    const endDate = new Date(2023, 11, 31);

    const randomDate = getRandomDate(startDate, endDate);
    const point = await this.calculationPoint(randomDate);

    const data: Prisma.UserCreateInput = {
      telegramId: id.toString(),
      username: username,
      point: point,
      registered: randomDate,
      created: new Date(),
    };
    await this.userService.createUser(data);

    return true;
  }
}
