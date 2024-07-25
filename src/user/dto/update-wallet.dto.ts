import { IsNotEmpty } from 'class-validator';

export class updateWalletDto {
  @IsNotEmpty()
  telegramId: string;

  @IsNotEmpty()
  wallet: string;
}
