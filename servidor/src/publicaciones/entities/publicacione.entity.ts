import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
@Schema()
export class Publicacione {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  usuarioId: string;
  @Prop()
  urlImagen: string;

  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: Types.ObjectId;

  @Prop({ default: () => new Date() })
  fechaCreacion: Date;

  @Prop({ default: false })
  eliminada: boolean;

  @Prop()
  fechaEliminacion: Date;

  @Prop({ type: [String], default: [] })
  likes: string[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comentario' }], default: [] })
  comentarios: Types.ObjectId[];
}

export const PublicacioneSchema = SchemaFactory.createForClass(Publicacione);

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ required: true })
  contenido: string;
  @Prop({ default: false })
  modificado: boolean;
  @Prop({ default: () => new Date() })
  fechaCreacion: Date;
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario: { type: mongoose.Schema.Types.ObjectId; ref: 'Usuario' };

  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion: Types.ObjectId;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
