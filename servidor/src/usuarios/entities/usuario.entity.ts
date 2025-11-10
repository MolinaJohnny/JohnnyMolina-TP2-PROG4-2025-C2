import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

  // @Prop({ required: true })
  // fechaNacimiento: Date;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: new Date() })
  fechaCreacion: Date;

  @Prop({ required: true })
  imagenUrl: string;

  perfil: string;
}
export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
