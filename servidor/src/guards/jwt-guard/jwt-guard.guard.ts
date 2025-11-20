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
export class JwtGuardGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const authHeader: string | undefined = request.headers.authorization;

    if (!authHeader) throw new UnauthorizedException();

    const [tipo, token] = authHeader.split(' ');

    if (tipo !== 'Bearer') throw new UnauthorizedException();

    try {
      const tokenValidado = verify(token, contrasenaSecreta);
      // return true

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (request as any).user = tokenValidado;

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new HttpException('Token expirado', 401);
      }

      if (error instanceof JsonWebTokenError) {
        throw new HttpException('Firma falló o tóken modificado', 401);
      }

      throw new UnauthorizedException();
    }
  }
}
