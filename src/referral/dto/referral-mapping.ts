import { User } from '@prisma/client';
import { ReferralDto } from './referral.dto';

export const transformReferral = (
  scoreEarned: number,
  invitee: User,
): ReferralDto => {
  return {
    username: invitee.username,
    avatarPath: invitee.avatarUrl,
    scoreEarned,
  };
};
