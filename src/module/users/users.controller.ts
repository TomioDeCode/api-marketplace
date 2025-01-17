import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SuccessResponse } from 'src/common/response/base.response';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return new SuccessResponse(
      user,
      'User created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return new SuccessResponse(users, 'Users retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.userService.findOne(+id);
    return new SuccessResponse(user, 'User retrieved successfully');
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(+id, updateUserDto);
    return new SuccessResponse(updatedUser, 'User updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.userService.delete(+id);
    return new SuccessResponse(null, 'User deleted successfully');
  }
}
