import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacione } from './entities/publicacione.entity';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacione.name) private instModel: Model<Publicacione>,
  ) {}

  async create(createPublicacioneDto: CreatePublicacioneDto) {
    const inst = new this.instModel(createPublicacioneDto);
    console.log(inst);
    const guardado = await inst.save();

    return guardado;
  }

  /**
   * Obtener publicaciones con opciones de filtrado, ordenamiento y paginación.
   * options: {
   *   sort?: 'date'|'likes' (por defecto 'date'),
   *   userId?: string,
   *   offset?: number,
   *   limit?: number,
   * }
   */
  // findAll(options?: {
  //   sort?: 'date' | 'likes';
  //   userId?: string;
  //   offset?: number;
  //   limit?: number;
  // }) {
  //   const { sort = 'date', userId, offset = 0, limit = 20 } = options || {};

  //   const filter: Record<string, unknown> = { eliminada: false };
  //   if (userId) {
  //     filter.usuario = userId;
  //   }

  //   let sortObj: Record<string, number> = { fechaCreacion: -1 };
  //   if (sort === 'likes') {
  //     sortObj = { likes: -1, fechaCreacion: -1 };
  //   }

  //   return this.instModel
  //     .find(filter)
  //     .sort(sortObj as any)
  //     .skip(Number(offset))
  //     .limit(Number(limit))
  //     .populate('usuario')
  //     .exec();
  // }
  async findAll() {
    try {
      const publicaciones = await this.instModel.find().exec();
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

    // Verificar que el usuario sea el creador de la publicación
    if (publicacion.usuario.toString() !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta publicación',
      );
    }

    if (publicacion.eliminada) {
      throw new BadRequestException('La publicación ya ha sido eliminada');
    }

    // Realizar baja lógica
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

    // Buscar la publicación
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
}
