import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @Post('/bot/sendMessage')
  async sendMessage() {
    // return this.telegramService.sendMessage();
  }

  @Post('/bot/createdate/:id')
  async getCreationDate(@Param('id', ParseIntPipe) userId: number) {
    return this.telegramService.sendCommandToCreationDateBot(userId);
  }
}
