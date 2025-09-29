import { getAuth, requireAuth } from '@clerk/express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    try {
      const { userId, sessionClaims } = getAuth(request);

      if (!userId) {
        return false;
      }

      if (!requiredRoles) {
        return true;
      }

      const userRole = sessionClaims.role;

      if (!userRole) {
        return false;
      }

      return requiredRoles.some((role) => role === userRole);
    } catch (err) {
      return false;
    }
  }
}
