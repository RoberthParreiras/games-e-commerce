import { clerkMiddleware } from '@clerk/express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ClerkMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    clerkMiddleware()(request, response, next);
  }
}
