import {
  Body,
  Controller,
  Headers,
  HttpStatus,
  Logger,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthSchema, SignUserDto } from './auth.schema';
import { ZodValidationPipe } from '../../models/zod.pipe';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  private readonly logger = new Logger(AuthController.name);

  @Post('/login')
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

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logOut(
    @Headers('authorization') authHeader: string,
    @Res() response: Response,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header format');
    }
    const accessToken = authHeader.split(' ')[1];
    if (accessToken) await this.authService.signOut(accessToken);

    response.status(HttpStatus.OK).json({
      message: 'Logout successfully',
    });
  }
}
