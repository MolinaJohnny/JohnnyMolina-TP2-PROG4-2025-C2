import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AdminGuard } from 'src/guards/admin/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }
  @Post('/crear-admin')
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('imagenUrl', {
      storage: diskStorage({
        destination(req, file, callback) {
          callback(null, 'public/images/users');
        },
        filename(req, file, callback) {
          const nuevoNombre = `${Date.now()}-${file.originalname}`;
          callback(null, nuevoNombre);
        },
      }),
    }),
  )
  async adminCreate(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 4_000_000 })],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,

    @Body() body: CreateUsuarioDto,
  ) {
    if (file) {
      body.imagenUrl = `/images/users/${file.filename}`;
    }

    const nuevoUsuario = await this.usuariosService.create(body);

    return {
      mensaje: 'Usuario creado correctamente',
      usuario: nuevoUsuario,
    };
  }

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post(':id/estado')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string) {
    return this.usuariosService.darDeAlta(id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.usuariosService.darDeBaja(id);
  }
}
