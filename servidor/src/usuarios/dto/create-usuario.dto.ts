import {
  // IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
  @IsString()
  @IsNotEmpty()
  apellido: string;
  @IsEmail()
  @IsNotEmpty()
  correo: string;
  @IsString()
  @IsNotEmpty()
  nombreUsuario: string;
  @IsString()
  @MinLength(8)
  contrasena: string;
  @IsNotEmpty()
  fechaNacimiento: Date;
  @IsString()
  descripcion: string;

  imagenUrl?: string;
  @IsString()
  perfil?: string;
}
