import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  // UnauthorizedException,
} from '@nestjs/common';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Comentario, Publicacione } from './entities/publicacione.entity';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacione.name) private instModel: Model<Publicacione>,
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
  ) {}

  async create(createPublicacioneDto: CreatePublicacioneDto) {
    const inst = new this.instModel(createPublicacioneDto);
    const guardado = await inst.save();

    return guardado;
  }

  async findAll(opts?: { sort?: string; offset?: number; limit?: number }) {
    try {
      const match: any = { eliminada: false };

      const skip = typeof opts?.offset === 'number' ? opts.offset : 0;
      const limit = typeof opts?.limit === 'number' ? opts.limit : 4;

      if (opts?.sort === 'likes') {
        const pipeline: any[] = [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          { $match: match },
          {
            $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } },
          },
          { $sort: { likesCount: -1, fechaCreacion: -1 } },
          { $skip: skip },
          { $limit: limit },
        ];

        const resultados = await this.instModel.aggregate(pipeline).exec();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return resultados;
      }

      const publicaciones = await this.instModel
        .find(match)
        .sort({ fechaCreacion: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return publicaciones;
    } catch (error) {
      console.error('Error al traer las publicaciones:', error);
      throw new InternalServerErrorException(
        'No se pudieron obtener las publicaciones',
      );
    }
  }
  findOne(id: number) {
    return `This action returns a #${id} publicacione`;
  }
  async buscarPorUsuario(usuarioId: string) {
    try {
      const match: any = { eliminada: false };
      const limit = 3;
      const publicaciones = await this.instModel
        .find({ ...match, usuarioId: usuarioId })
        .sort({ fechaCreacion: -1 })
        .limit(limit)
        .exec();
      return publicaciones;
    } catch (error) {
      throw new InternalServerErrorException(
        'No se pudieron obtener las publicaciones del usuario',
      );
      console.error('Error al traer las publicaciones del usuario:', error);
    }
  }

  async findOneById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de publicación inválido');
    }
    const publicacion = await this.instModel.findById(id);
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return publicacion;
  }

  async remove(id: string, usuarioId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de publicación inválido');
    }

    if (!Types.ObjectId.isValid(usuarioId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    const publicacion = await this.instModel.findById(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (publicacion.usuario.toString() !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta publicación',
      );
    }

    if (publicacion.eliminada) {
      throw new BadRequestException('La publicación ya ha sido eliminada');
    }

    const resultado = await this.instModel.findByIdAndUpdate(
      id,
      {
        eliminada: true,
        fechaEliminacion: new Date(),
      },
      { new: true },
    );

    return resultado;
  }

  async reactivate(id: string, usuarioId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de publicación inválido');
    }

    if (!Types.ObjectId.isValid(usuarioId)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    const publicacion = await this.instModel.findById(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (publicacion.usuario.toString() !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para reactivar esta publicación',
      );
    }

    if (!publicacion.eliminada) {
      throw new BadRequestException('La publicación no está eliminada');
    }

    const resultado = await this.instModel.findByIdAndUpdate(
      id,
      {
        eliminada: false,
        fechaEliminacion: null,
      },
      { new: true },
    );

    return resultado;
  }
  async toggleLike(publicacionId: string, nombreUsuario: string) {
    if (!Types.ObjectId.isValid(publicacionId)) {
      throw new BadRequestException('ID de publicación inválido');
    }
    const publicacion = await this.instModel.findById(publicacionId);

    if (!publicacion) {
      throw new NotFoundException('Publicacion no encontrada');
    }

    const yaLikeo = publicacion.likes.includes(nombreUsuario);

    if (yaLikeo) {
      publicacion.likes = publicacion.likes.filter(
        (id) => id !== nombreUsuario,
      );
    } else {
      publicacion.likes.push(nombreUsuario);
    }

    await publicacion.save();

    return {
      likes: publicacion.likes.length,
      likeado: !yaLikeo,
    };
  }
  //                            Seccion Comentario
  async agregarComentario(
    publicacionId: string,
    usuarioId: string,
    contenido: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
      throw new BadRequestException('UsuarioId inválido');
    }
    if (!mongoose.Types.ObjectId.isValid(publicacionId)) {
      throw new BadRequestException('PublicacionId inválido');
    }

    const nuevoComentario = new this.comentarioModel({
      usuario: usuarioId,
      contenido,
      publicacion: publicacionId,
    });
    await nuevoComentario.save();

    const publicacionActualizada = await this.instModel
      .findByIdAndUpdate(
        publicacionId,
        { $push: { comentarios: nuevoComentario._id } },
        { new: true },
      )
      .populate({
        path: 'comentarios',
        populate: { path: 'usuario', select: 'nombreUsuario imagenUrl' },
      });

    if (!publicacionActualizada) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publicacionActualizada;
  }
  async obtenerComentarios(publicacionId: string) {
    if (!mongoose.Types.ObjectId.isValid(publicacionId)) {
      throw new BadRequestException('ID de publicación inválido');
    }
    return await this.comentarioModel
      .find({ publicacion: publicacionId })
      .populate('usuario', 'nombreUsuario imagenUrl')
      .sort({ createdAt: -1 });
  }
  async eliminarPublicacion(publicacionId: string, usuarioId: string) {
    const publicacion = await this.instModel.findById(publicacionId);
    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (publicacion.usuarioId != usuarioId) {
      throw new UnauthorizedException('No puedes eliminar esta publicación');
    }

    publicacion.eliminada = true;
    await publicacion.save();

    return { ok: true, mensaje: 'Publicación marcada como eliminada' };
  }
  async eliminarComentario(comentarioId: string, usuarioId: string) {
    const comentario = await this.comentarioModel.findById(comentarioId);
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const creadorComentario = comentario.usuario.toString();
    if (creadorComentario !== usuarioId) {
      throw new UnauthorizedException('No puedes eliminar este comentario');
    }
    await this.comentarioModel.deleteOne({ _id: comentarioId });
    return { ok: true, mensaje: 'Comentario eliminado correctamente' };
  }
}
