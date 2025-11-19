/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
  UseGuards,
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtCookieGuard } from 'src/guards/jwt-cookie/jwt-cookie.guard';
import type { Request } from 'express';
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
  @Post(':id/like')
  @UseGuards(JwtCookieGuard)
  toggleLike(@Param('id') id: string, @Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.publicacionesService.toggleLike(id, req.user.nombreUsuario);
  }

  //                 SECCION COMENTARIOS
  //Post de comentario
  @UseGuards(JwtCookieGuard)
  @Post('/:id/comentarios')
  crearComentario(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('contenido') contenido: string,
  ) {
    return this.publicacionesService.agregarComentario(
      id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.nombreUsuario,
      contenido,
    );
  }
  @UseGuards(JwtCookieGuard)
  @Get('/:id/comentarios')
  obtenerComentarios(@Param('id') id: string) {
    return this.publicacionesService.obtenerComentarios(id);
  }
  @UseGuards(JwtCookieGuard)
  @Delete('/comentarios/:id')
  borrarComentario(@Param('id') id: string, @Req() req) {
    return this.publicacionesService.eliminarComentario(
      id,
      req.user.nombreUsuario,
    );
  }
  //Put de comentario
}
