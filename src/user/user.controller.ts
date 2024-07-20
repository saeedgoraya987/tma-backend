import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

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
}
