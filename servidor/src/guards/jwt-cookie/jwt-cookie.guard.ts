import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';
const contrasenaSecreta = 'securePassword123';

@Injectable()
export class JwtCookieGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = request.cookies['token'] as string;

    if (token && token !== '') {
      try {
        verify(token, contrasenaSecreta);
        // return true

        return true;

        // Caso de error, throw de error
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          throw new HttpException('Token expirado', 401);
        }

        if (error instanceof JsonWebTokenError) {
          throw new HttpException('Firma falló o tóken modificado', 401);
        }
      }
    }

    throw new UnauthorizedException();
    // return false; // throw 403
  }
}
