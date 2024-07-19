import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from 'src/user/user.module';
import { ReferralModule } from 'src/referral/referral.module';

@Module({
  imports: [ConfigModule, HttpModule, UserModule, ReferralModule],
  providers: [TelegramService],
  controllers: [TelegramController],
})
export class TelegramModule {}
