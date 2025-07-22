import { Inject, Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../../common/utils/constants';
import { Request } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret!,
      passReqToCallback: true,
    });
  }

  async validate(@Req() request: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    const isBlacklisted = await this.cacheManager.get(`bl_${token}`);

    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been blacklisted');
    }

    return { userId: payload.sub, userName: payload.userName };
  }
}
