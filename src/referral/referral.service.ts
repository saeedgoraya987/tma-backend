import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Referal } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RankingService } from 'src/ranking/ranking.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    private rankingService: RankingService,
  ) {}

  async getReferralsByInviter(inviter: number): Promise<Referal[]> {
    const referrals = await this.prismaService.referal.findMany({
      where: { inviterId: inviter },
    });

    return referrals;
  }

  async getReferralByInvitee(inviteeId: number): Promise<Referal> {
    const referral = await this.prismaService.referal.findFirst({
      where: { inviteeId: inviteeId },
    });
    return referral;
  }

  async createReferral(data: Prisma.ReferalCreateInput) {
    const referral = await this.prismaService.referal.create({ data: data });
    // await this.rankingService.updateRankingForUser(referral.inviterId);
    await this.rankingService.updateRankingForAllUsers();
    return referral;
  }
}
