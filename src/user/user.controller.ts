import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { updateWalletDto } from './dto/update-wallet.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUsers() {
    return await this.userService.getUsersSortByRanking();
  }

  @Get('id/:id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Post('/wallet')
  async updateWallet(@Body() request: updateWalletDto) {
    return await this.userService.updateWallet(request);
  }
}
