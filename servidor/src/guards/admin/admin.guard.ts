/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // JwtCookieGuard ya cargó request.user
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No se pudo verificar el usuario');
    }

    if (user.perfil !== 'admin') {
      throw new ForbiddenException(
        'Acceso denegado: se requiere perfil administrador',
      );
    }

    return true;
  }
}
