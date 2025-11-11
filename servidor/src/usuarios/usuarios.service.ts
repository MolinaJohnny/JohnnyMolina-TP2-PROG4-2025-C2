import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsuariosService {
  constructor(@InjectModel(Usuario.name) private instModel: Model<Usuario>) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const inst = new this.instModel(createUsuarioDto);
    console.log(inst);
    const guardado = await inst.save();

    return guardado;
  }

  async findAll() {
    const todos = await this.instModel.find();
    return todos;
  }

  findOne(id: string) {
    const resultado = this.instModel.findById(id);
    return resultado;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    console.log(updateUsuarioDto);
    const resultado = await this.instModel.updateOne(
      { _id: id },
      updateUsuarioDto,
    );
    return resultado;
  }

  async remove(id: string) {
    const resultado = await this.instModel.deleteOne({ _id: id });
    return resultado;
  }
  findByCorreo(correo: string) {
    return this.instModel.findOne({ correo });
  }

  findByNombreUsuario(nombreUsuario: string) {
    return this.instModel.findOne({ nombreUsuario });
  }
}
