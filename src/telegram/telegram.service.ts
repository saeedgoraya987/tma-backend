import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Bot } from 'grammy';
import { UserService } from 'src/user/user.service';

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

    this.bot.command('start', (ctx) => {
      ctx.reply('Welcome! This is a start command.');
      const id = ctx.from.id;
      const username = ctx.from.username;
      this.handleUserStart(id, username);
    });

    this.bot.command('help', (ctx) => {
      ctx.reply('This is the help command.');
    });

    this.bot.command('echo', (ctx) => {
      const message = ctx.message.text.split(' ').slice(1).join(' ');
      ctx.reply(message);
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

  async calculationPoint(time: number): Promise<number> {
    return 2000;
  }

  async handleUserStart(
    id: number,
    username: string,
    time?: string,
  ): Promise<boolean> {
    const point = await this.calculationPoint(2000);
    const data: Prisma.UserCreateInput = {
      id: id,
      username: username,
      point: point,
      registered: time,
      created: Date.now().toString(),
    };
    this.userService.createUser(data);

    return true;
  }
}
