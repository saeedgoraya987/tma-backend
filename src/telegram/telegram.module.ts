import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [ConfigModule, HttpModule, UserModule],
  providers: [TelegramService],
  controllers: [TelegramController],
})
export class TelegramModule {}
