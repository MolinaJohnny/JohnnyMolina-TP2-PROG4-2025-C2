import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './entities/usuario.entity';
import { PublicacionesModule } from 'src/publicaciones/publicaciones.module';
import {
  Comentario,
  ComentarioSchema,
  Publicacione,
  PublicacioneSchema,
} from 'src/publicaciones/entities/publicacione.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Publicacione.name, schema: PublicacioneSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    PublicacionesModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
