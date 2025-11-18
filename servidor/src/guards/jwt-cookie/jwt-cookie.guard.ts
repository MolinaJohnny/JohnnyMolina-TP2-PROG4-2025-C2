import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JsonWebTokenError, TokenExpiredError, verify } from 'jsonwebtoken';

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const token = request.cookies['token'];

    if (!token) {
      throw new UnauthorizedException('No hay token en la cookie');
    }

    // 🔥 Se obtiene la contraseña del .env
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const secret = this.configService.get<any>('CONTRASENA_SEGURA');

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      verify(token, secret);
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new HttpException('Token expirado', 401);
      }

      if (error instanceof JsonWebTokenError) {
        throw new HttpException('Firma falló o token modificado', 401);
      }

      throw new UnauthorizedException('Token inválido');
    }
  }
}
