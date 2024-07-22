import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { UserModule } from 'src/user/user.module';
import { RankingModule } from 'src/ranking/ranking.module';
import { ReferralController } from './referral.controller';

@Module({
  imports: [UserModule, RankingModule],
  providers: [ReferralService],
  exports: [ReferralService],
  controllers: [ReferralController],
})
export class ReferralModule {}
