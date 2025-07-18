import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { getHashedPassword } from '../../common/utils/hash-password.util';
import { JwtService } from '@nestjs/jwt';
import { convertBytesToUuid } from '../../common/utils/uuid.util';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(params: {
    email: string;
    password: string;
  }): Promise<{ access_token: string }> {
    const { email, password } = params;

    const user = await this.userService.getUserByEmail({ email });

    if (!user) throw new NotFoundException('User not found');

    const unHashedpassword = await getHashedPassword(password, user?.password);
    if (!unHashedpassword) throw new UnauthorizedException();

    const payload = { sub: convertBytesToUuid(user.id), userName: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
