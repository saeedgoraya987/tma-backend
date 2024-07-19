import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { UserModule } from 'src/user/user.module';
import { RankingModule } from 'src/ranking/ranking.module';

@Module({
  imports: [UserModule, RankingModule],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
