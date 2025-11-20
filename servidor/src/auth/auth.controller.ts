/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  Res,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import type { Response, Request } from 'express';
import { decode } from 'jsonwebtoken';
import { LoginDto } from './dto/credenciales.dto';
import { JwtCookieGuard } from 'src/guards/jwt-cookie/jwt-cookie.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @UseInterceptors(
    FileInterceptor('imagenUrl', {
      storage: diskStorage({
        destination(req, file, callback) {
          callback(null, 'public/images/users'); // carpeta donde se guarda
        },
        filename(req, file, callback) {
          const nuevoNombre = `${Date.now()}-${file.originalname}`;
          callback(null, nuevoNombre);
        },
      }),
    }),
  )
  async register(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 4000000 })],
      }),
    )
    file: Express.Multer.File,
    @Body() body: CreateUsuarioDto,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha subido ninguna imagen');
    }
    body.imagenUrl = `/images/users/${file.filename}`;
    const token = await this.authService.register(body);
    return { token };
  }

  @Post('login/cookie')
  async loginCookie(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const resultado = await this.authService.loginCookie(body);
    response.cookie('token', resultado.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // Cambiar a true si antes de entregar ajksdlasd
      expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos menos la diferencia horaria
    });
    response.json({ resultado });
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    // Limpiar cookie de sesión
    response.clearCookie('token', {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
    });
    return { ok: true };
  }
  @UseGuards(JwtCookieGuard)
  @Get('data/jwt/cookie')
  async traerConGuardYCookie(@Req() request: Request) {
    const token = request.cookies['token'] as string;
    if (!token) {
      throw new BadRequestException('Token no encontrado');
    }
    const datos: any = decode(token);
    console.log(datos);

    return {
      resultado: {
        token,
        usuario: {
          nombreUsuario: datos.user,
          urlImagen: datos.Url,
          descripcion: datos.descripcion,
          _id: datos.id,
        },
      },
    };
  }
}
