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
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import type { Response, Request } from 'express';
import { JwtGuardGuard } from 'src/guards/jwt-guard/jwt-guard.guard';
import { decode } from 'jsonwebtoken';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}
  // constructor(private readonly usuariosService: UsuariosService) {}

  @Post('register')
  register(@Body() body: CreateUsuarioDto) {
    return this.authService.register(body);
  }
  @Post('login/cookie')
  async loginCookie(@Body() body: CreateUsuarioDto, @Res() response: Response) {
    const resultado = await this.authService.loginCookie(body);
    response.cookie('token', resultado.token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false, // Cambiar a true si antes de entregar ajksdlasd
      expires: new Date(Date.now() + 15 * 60 * 1000 - 10800000), // 15 minutos menos la diferencia horaria
    });
    response.json(resultado);
  }
  @UseGuards(JwtGuardGuard)
  @Get('data/cookie')
  traerCookie(@Req() request: Request) {
    const token = request.cookies['token'] as string;

    const datos = decode(token);
    return datos;
  }
}
