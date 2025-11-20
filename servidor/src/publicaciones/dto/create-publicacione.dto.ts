import { IsNotEmpty, IsString } from 'class-validator';
export class CreatePublicacioneDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  urlImagen?: string;

  @IsString()
  @IsNotEmpty()
  usuario: string;
  @IsString()
  @IsNotEmpty()
  usuarioId: string;
}
