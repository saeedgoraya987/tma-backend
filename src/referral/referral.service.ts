import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Referal } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RankingService } from 'src/ranking/ranking.service';
import { UserService } from 'src/user/user.service';
import { transformReferral } from './dto/referral-mapping';
import { ReferralDto } from './dto/referral.dto';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    private rankingService: RankingService,
  ) {}

  async getReferralsByInviter(inviterTelegram: string): Promise<ReferralDto[]> {
    const referrals = await this.prismaService.referal.findMany({
      where: { inviter: { telegramId: inviterTelegram } },
      include: { invitee: true },
    });

    return referrals.map((referral) =>
      transformReferral(referral.scoreEarned, referral.invitee),
    );
  }

  async getReferralByInvitee(inviteeId: number): Promise<Referal> {
    const referral = await this.prismaService.referal.findFirst({
      where: { inviteeId: inviteeId },
    });
    return referral;
  }

  async createReferral(data: Prisma.ReferalCreateInput) {
    const referral = await this.prismaService.referal.create({ data: data });
    await this.rankingService.updateRankingForAllUsers();
    return referral;
  }
}
