import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ComentariosController } from './publicaciones/comentarios.controller';

@Module({
  imports: [PublicacionesModule, AuthModule, UsuariosModule],
  controllers: [AppController, ComentariosController],
  providers: [AppService],
})
export class AppModule {}
