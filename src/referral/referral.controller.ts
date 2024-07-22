import { Controller, Get, Param } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referral')
export class ReferralController {
  constructor(private referralService: ReferralService) {}

  @Get('id/:id')
  async getReferralsByInviter(@Param('id') id: string) {
    return await this.referralService.getReferralsByInviter(id);
  }
}
