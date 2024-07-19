import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
