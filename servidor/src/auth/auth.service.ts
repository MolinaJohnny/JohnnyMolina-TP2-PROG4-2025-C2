/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
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
  ) {
    this.contrasenaSecreta =
      this.configService.get<string>('CONTRASENA_SEGURA');
  }

  async register(user: CreateUsuarioDto) {
    // Validar que el usuario no exista ya
    const usuarioExistente = await this.usuariosService.findByNombreUsuario(
      user.nombreUsuario,
    );
    if (usuarioExistente) {
      throw new BadRequestException('El nombre de usuario ya existe');
    }

    const correoExistente = await this.usuariosService.findByCorreo(
      user.correo,
    );
    if (correoExistente) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    const nuevoUsuario = await this.usuariosService.create(user);

    return this.guardarEnCookie(
      nuevoUsuario.nombreUsuario,
      nuevoUsuario.imagenUrl,
      nuevoUsuario.descripcion,
      nuevoUsuario._id.toString(),
    );
  }

  verificar(authHeader: string) {
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

  guardarEnCookie(
    userName: string,
    imagenUrl: string,
    descripcion: string,
    id: string,
  ) {
    const payload: {
      id: string;
      user: string;
      admin: boolean;
      Url: string;
      descripcion: string;
    } = {
      id: id,
      user: userName,
      Url: imagenUrl,
      descripcion: descripcion,
      admin: false,
    };

    const token: string = sign(payload, this.contrasenaSecreta, {
      expiresIn: '15m',
    });
    return token;
  }

  setCookie(response: Response, token: string, minutes = 15) {
    response.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      expires: new Date(Date.now() + minutes * 60 * 1000),
    });
  }

  async loginCookie(loginData: { nombreUsuario: string; contrasena: string }) {
    const usuario = await this.usuariosService.findByNombreUsuario(
      loginData.nombreUsuario,
    );

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const contrasenaValida = await bcrypt.compare(
      loginData.contrasena,
      usuario.contrasena,
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Generar token con la id incluida
    const token = this.guardarEnCookie(
      usuario.nombreUsuario,
      usuario.imagenUrl,
      usuario.descripcion,
      usuario._id.toString(),
    );

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
