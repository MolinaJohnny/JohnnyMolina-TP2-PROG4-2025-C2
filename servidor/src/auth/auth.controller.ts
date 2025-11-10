import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuariosService: UsuariosService,
  ) {}
  // constructor(private readonly usuariosService: UsuariosService) {}

  @Post('login')
  login(@Body() body: CreateUsuarioDto) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: CreateUsuarioDto) {
    return this.authService.register(body);
  }
}
