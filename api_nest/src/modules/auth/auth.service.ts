import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { UserService } from '../user/user.service';
import { getHashedPassword } from '../../common/utils/hash-password.util';
import { convertBytesToUuid } from '../../common/utils/uuid.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

  async signOut(accessToken: string) {
    const decoded = this.jwtService.decode(accessToken);
    if (decoded && decoded.exp) {
      const expiresin = decoded.exp * 1000 - Date.now(); // calculate remaining time in milliseconds
      if (expiresin > 0) {
        await this.cacheManager.set(`bl_${accessToken}`, 'true', expiresin);
      }
    }
  }
}
