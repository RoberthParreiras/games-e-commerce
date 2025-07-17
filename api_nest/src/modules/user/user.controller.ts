import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Res,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ZodValidationPipe } from '../../models/zod.pipe';
import { CreateUser, CreateUserDto, UpdateUser } from './user.schema';
import { Response } from 'express';
import { convertBytesToUuid } from '../../common/utils/uuid.util';

@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly logger = new Logger(UserController.name);

  @Post()
  @UsePipes(new ZodValidationPipe(CreateUser))
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    const userCreated = await this.userService.create(createUserDto);

    const user = {
      ...userCreated,
      id: convertBytesToUuid(userCreated.id),
    };

    this.logger.log(
      `[${this.createUser.name}] ${HttpStatus.CREATED} - User created with success`,
    );

    response.status(HttpStatus.CREATED).json({
      message: 'User created with success',
      user,
    });
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @Res() response: Response) {
    const user = await this.userService.get({ id });

    this.logger.log(
      `[${this.getUser.name}] ${HttpStatus.OK} - User with id: ${id} found with success`,
    );

    response.status(HttpStatus.OK).json({
      message: 'User retrieved successfully',
      user,
    });
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUser,
    @Res() response: Response,
  ) {
    await this.userService.put({ id, name: body.name });

    this.logger.log(
      `[${this.updateUser.name}] ${HttpStatus.OK} - User with id: ${id} updated successfully`,
    );

    response.status(HttpStatus.OK).json({
      message: 'User updated with success',
    });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Res() response: Response) {
    await this.userService.delete({ id });

    this.logger.log(
      `[${this.deleteUser.name}] ${HttpStatus.OK} - User with id: ${id} deleted successfully`,
    );

    response.status(HttpStatus.OK).json({
      message: 'User deleted with success',
    });
  }
}
