import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Publicacione {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop()
  urlImagen: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ default: new Date() })
  fechaCreacion: Date;

  @Prop({ default: false })
  eliminada: boolean;

  @Prop()
  fechaEliminacion: Date;

  @Prop({ type: [String], default: [] })
  likes: string[];
}

export const PublicacioneSchema = SchemaFactory.createForClass(Publicacione);
