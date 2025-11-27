import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from './entities/usuario.entity';
import { PublicacionesModule } from 'src/publicaciones/publicaciones.module';
import {
  Publicacione,
  PublicacioneSchema,
} from 'src/publicaciones/entities/publicacione.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Publicacione.name, schema: PublicacioneSchema },
    ]),
    PublicacionesModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
