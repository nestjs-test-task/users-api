import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './services/users.service';
import { QueryUsersDto } from '@modules/users/dto/query-users.dto';
import { ApiCreateUserSwagger } from '@modules/users/swagger/create-user.swagger';
import { ApiGetUsersSwagger } from '@modules/users/swagger/get-users.swagger';
import { ApiGetUserByIdSwagger } from '@modules/users/swagger/get-users-by-id.swagger';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiCreateUserSwagger()
  @Post('/add-user')
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get('get-users')
  @ApiGetUsersSwagger()
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.find(query);
  }

  @Get('get-user/:id')
  @ApiGetUserByIdSwagger()
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
