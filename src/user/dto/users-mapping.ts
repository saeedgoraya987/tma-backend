import { User } from '@prisma/client';
import { UserResponseDto } from './users-response.dto';

export const transformUserDto = (
  user: User,
  totalPoint: number,
): UserResponseDto => {
  const dto = new UserResponseDto();
  dto.id = user.id;
  dto.telegramId = user.telegramId.toString();
  dto.username = user.username;
  dto.avatarPath = user.avatarUrl ?? '';
  dto.point = user.point;
  dto.friendPoint = (totalPoint ?? 0) - user.point - user.rewardWallet;
  dto.registeredDate = user.registered;
  dto.rewardWallet = user.rewardWallet;
  dto.wallet = user.wallet;
  return dto;
};
