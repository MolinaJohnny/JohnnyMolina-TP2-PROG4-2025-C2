import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import type { Response, Request } from 'express';
import { decode } from 'jsonwebtoken';
import { LoginDto } from './dto/credenciales.dto';
import { JwtCookieGuard } from 'src/guards/jwt-cookie/jwt-cookie.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // constructor(private readonly usuariosService: UsuariosService) {}
  @Post('register')
  register(@Body() body: CreateUsuarioDto) {
    const token = this.authService.register(body);
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
  traerConGuardYCookie(@Req() request: Request) {
    const token = request.cookies['token'] as string;
    const datos = decode(token);
    return datos;
  }
}
