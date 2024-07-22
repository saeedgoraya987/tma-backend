import { Expose } from 'class-transformer';

export class ReferralDto {
  @Expose()
  username: string;

  @Expose()
  scoreEarned: number;

  @Expose()
  avatarPath: string;
}
