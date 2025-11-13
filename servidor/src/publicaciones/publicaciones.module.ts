import { Module } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { ComentariosController } from './comentarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Publicacione,
  PublicacioneSchema,
} from './entities/publicacione.entity';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacione.name, schema: PublicacioneSchema },
    ]),
  ],
  controllers: [PublicacionesController, ComentariosController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}
