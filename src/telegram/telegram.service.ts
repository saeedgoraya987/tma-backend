import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private tokenBot = this.configService.get<string>('BOT_TOKEN');
  private telegramBot = (): TelegramBot => {
    const bot = new TelegramBot(this.tokenBot, { polling: true });
    return bot;
  };

  getCommand = async (userId: number): Promise<any> => {
    console.log('token bot: ', this.tokenBot);

    const bot = this.telegramBot();
    const response = await bot.getMyCommands().catch((err) => {
      console.error('Error getting commands', err);
    });
    console.log('response: ', response);
  };

  getInforBot = async () => {
    const bot = this.telegramBot();
    const response = await bot.getMe();
    console.log('response: ', response);
  };

  sendMessage = async () => {
    const bot = this.telegramBot();
    const chatId = Number(5053674641);
    try {
      const response = await bot.sendMessage(50536746411, 'hell');
      console.log('response: ', response);
    } catch (error) {
      console.error('Request error:', error);
    }
  };
}

//   this.httpService.post( // const response = await firstValueFrom(
//     `https://api.telegram.org/bot6827476389:AAEPbhPzvZwQm4VeEkz1C_nImm7txL-KPlQ/userFull`,
//     {
//       chat_id: '@sparkmindsdev',
//       text: `/id ${userId}`,
//     },
//   ),
// );
// console
//   .log('response: ' + JSON.stringify(response));
