import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  telegramId: string;

  @Expose()
  username: string;

  @Expose()
  avatarPath: string;

  @Expose()
  point: number;

  @Expose()
  registeredDate: Date;

  @Expose()
  friendPoint: number;

  @Expose()
  rewardWallet: number;

  @Expose()
  wallet: string;
}
