import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Usuario {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true, unique: true })
  nombreUsuario: string;

  @Prop({ required: true })
  contrasena: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: new Date() })
  fechaCreacion: Date;

  @Prop()
  imagenUrl: string;
  @Prop({ required: true, default: 'usuario' })
  perfil: string;

  @Prop({ type: [Types.ObjectId], ref: 'Publicacione', default: [] })
  publicaciones: Types.ObjectId[];
}
export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
