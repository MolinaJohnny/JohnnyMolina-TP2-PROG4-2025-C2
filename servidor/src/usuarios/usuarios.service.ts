import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { PublicacionesService } from '../publicaciones/publicaciones.service';
import {
  Comentario,
  Publicacione,
} from 'src/publicaciones/entities/publicacione.entity';
@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private instModel: Model<Usuario>,
    @InjectModel(Publicacione.name) private pubModel: Model<Publicacione>,
    @InjectModel(Comentario.name) private comModel: Model<Comentario>,
    private readonly publicacionesService: PublicacionesService,
  ) {}
  async create(createUsuarioDto: CreateUsuarioDto) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(createUsuarioDto.contrasena, salt);
    createUsuarioDto.contrasena = hash;

    const inst = new this.instModel(createUsuarioDto);
    const guardado = await inst.save();

    return guardado;
  }

  async findAll() {
    const todos = await this.instModel.find();
    return todos;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    const usuario = await this.instModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    console.log(updateUsuarioDto);
    const resultado = await this.instModel.findByIdAndUpdate(
      id,
      updateUsuarioDto,
      { new: true },
    );
    return resultado;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuario inválido');
    }
    const usuario = await this.instModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const resultado = await this.instModel.deleteOne({ _id: id });
    return resultado;
  }
  findByCorreo(correo: string) {
    return this.instModel.findOne({ correo });
  }

  findByNombreUsuario(nombreUsuario: string) {
    return this.instModel.findOne({ nombreUsuario });
  }
  async darDeBaja(id: string) {
    const usuario = await this.instModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.activo = false;
    await usuario.save();

    await this.publicacionesService.marcarPublicacionesEliminadasPorUsuario(id);

    return usuario;
  }
  async darDeAlta(id: string) {
    const usuario = await this.instModel.findById(id);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.publicacionesService.restaurarPublicacionesDeUsuario(id);

    usuario.activo = true;
    return usuario.save();
  }
  async findAllPub() {
    const publicaciones = await this.pubModel.find();
    return publicaciones;
  }
  async findAllCom() {
    const comentarios = await this.comModel.find();
    return comentarios;
  }
}
