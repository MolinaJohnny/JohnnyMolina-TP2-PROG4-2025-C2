import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  private readonly contrasenaSecreta: any;

  constructor(
    private configService: ConfigService,
    private readonly usuariosService: UsuariosService,
    // private readonly jwtService: JwtService,
  ) {
    this.contrasenaSecreta =
      this.configService.get<string>('CONTRASENA_SEGURA');
  }
  async register(user: CreateUsuarioDto) {
    const nuevoUsuario = await this.usuariosService.create(user);

    return this.guardarEnCookie(nuevoUsuario.nombreUsuario);
  }

  verificar(authHeader: string) {
    console.log(authHeader);
    if (!authHeader) throw new BadRequestException('No token');
    const [tipo, token] = authHeader.split(' ');

    if (tipo !== 'Bearer')
      throw new BadRequestException('Tipo de token no válido');
    try {
      const tokenValidado = verify(token, this.contrasenaSecreta);
      return tokenValidado;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return 'Token expirado';
      }
      if (error instanceof JsonWebTokenError) {
        return 'Firma fallo o token modificado';
      }
      throw new InternalServerErrorException('');
    }
  }
  guardarEnCookie(userName: string) {
    const payload: { user: string; admin: boolean } = {
      user: userName,
      admin: false,
    };
    const token: string = sign(payload, this.contrasenaSecreta, {
      expiresIn: '15m',
    });
    return token;
  }
  async loginCookie(loginData: { nombreUsuario: string; contrasena: string }) {
    const usuario = await this.usuariosService.findByNombreUsuario(
      loginData.nombreUsuario,
    );

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const contrasenaValida = await bcrypt.compare(
      loginData.contrasena,
      usuario.contrasena,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Generar token
    const token = this.guardarEnCookie(usuario.nombreUsuario);

    // Devolver token y datos del usuario
    return {
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        nombreUsuario: usuario.nombreUsuario,
        descripcion: usuario.descripcion,
        imagenUrl: usuario.imagenUrl,
        fechaCreacion: usuario.fechaCreacion,
        perfil: usuario.perfil,
      },
    };
  }

  verificarDesdeCookie(token: string) {
    try {
      const tokenValidado = verify(token, this.contrasenaSecreta);
      return tokenValidado;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return 'Token expirado';
      }
      if (error instanceof JsonWebTokenError) {
        return 'Firma fallo o token modificado';
      }
      throw new InternalServerErrorException('');
    }
  }
}
