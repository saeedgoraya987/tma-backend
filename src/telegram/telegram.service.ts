import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// import { TELEGRAM_LINK } from 'src/common/constant/url';
// import { TelegramBot } from "node-telegram-bot-api";

@Injectable()
export class TelegramService {
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private tokenBot = this.configService.get<string>('tokenBot');

  sendCommand = async (userId: number): Promise<any> => {
    const response = await firstValueFrom(
      this.httpService.post(
        `https://api.telegram.org/bot6827476389:AAEPbhPzvZwQm4VeEkz1C_nImm7txL-KPlQ/sendMessage`,
        {
          chat_id: '@sparkmindsdev',
          text: `/id ${userId}`,
        },
      ),
    );
    console.log('response: ' + JSON.stringify(response));
  };
}
