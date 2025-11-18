import type { Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post('/subir')
  @UseInterceptors(
    FileInterceptor('urlImagen', {
      storage: diskStorage({
        destination(req, file, callback) {
          callback(null, 'public/images'); // carpeta donde se guarda
        },
        filename(req, file, callback) {
          const nuevoNombre = `${Date.now()}-${file.originalname}`;
          callback(null, nuevoNombre);
        },
      }),
    }),
  )
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10000 })],
      }),
    )
    file: Express.Multer.File,
    @Body() createPublicacioneDto: CreatePublicacioneDto,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha subido ninguna imagen');
    }

    createPublicacioneDto.urlImagen = `/images/${file.filename}`;

    return this.publicacionesService.create(createPublicacioneDto);
  }

  @Get('/todas')
  findAll() {
    return this.publicacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicacionesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const usuarioData = (
      req as unknown as Record<string, Record<string, unknown>>
    )?.user;
    const usuarioId = String(usuarioData?.id || usuarioData?._id);
    return this.publicacionesService.remove(id, usuarioId);
  }

  @Post(':id/reactivate')
  reactivate(@Param('id') id: string, @Req() req: Request) {
    const usuarioData = (
      req as unknown as Record<string, Record<string, unknown>>
    )?.user;
    const usuarioId = String(usuarioData?.id || usuarioData?._id);
    return this.publicacionesService.reactivate(id, usuarioId);
  }

  //Post de comentario
  //Put de comentario
  //Guard de validar logueo
}
