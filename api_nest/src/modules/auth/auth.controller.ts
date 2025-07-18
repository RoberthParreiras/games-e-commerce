import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthSchema, SignUserDto } from './auth.schema';
import { ZodValidationPipe } from '../../models/zod.pipe';

@Controller('/auth/login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Post()
  @UsePipes(new ZodValidationPipe(AuthSchema))
  async logIn(@Body() signInUserDto: SignUserDto, @Res() response: Response) {
    const { access_token } = await this.authService.signIn(signInUserDto);

    if (!access_token) throw new UnauthorizedException();

    this.logger.log(
      `[${this.logIn.name}] ${HttpStatus.OK} - Login was a success`,
    );

    response.status(HttpStatus.OK).json({
      message: 'Login successfully',
      access_token: access_token,
    });
  }
}
