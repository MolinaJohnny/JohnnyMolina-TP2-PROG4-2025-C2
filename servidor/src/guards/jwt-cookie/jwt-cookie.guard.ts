/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import {
  verify,
  decode,
  TokenExpiredError,
  JsonWebTokenError,
} from 'jsonwebtoken';

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const token = request.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('No hay token en la cookie');
    }

    const secret = this.configService.get<string>('CONTRASENA_SEGURA');

    try {
      verify(token, secret!);

      const payload: any = decode(token);

      request.user = {
        id: payload._id,
        nombreUsuario: payload.user,
        imagenUrl: payload.Url,
        descripcion: payload.descripcion,
        ...payload,
      };

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new HttpException('Token expirado', 401);
      }
      if (error instanceof JsonWebTokenError) {
        throw new HttpException('Token inválido o manipulado', 401);
      }

      throw new UnauthorizedException('Token inválido');
    }
  }
}
