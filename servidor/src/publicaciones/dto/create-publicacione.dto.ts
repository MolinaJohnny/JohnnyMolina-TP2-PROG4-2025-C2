import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
export class CreatePublicacioneDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsOptional()
  @IsString()
  urlImagen?: string;

  @IsString()
  @IsNotEmpty()
  usuario: string;
  @IsString()
  @IsNotEmpty()
  usuarioId: string;
}
