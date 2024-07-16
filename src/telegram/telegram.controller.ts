import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private telegramService: TelegramService) {}

  @Post('/bot/:id')
  async sendCommandBot(@Param('id', ParseIntPipe) userId: number) {
    return this.telegramService.sendCommand(userId);
  }
}
