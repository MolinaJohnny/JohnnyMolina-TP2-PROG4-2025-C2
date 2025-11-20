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
  Query,
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
  async create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1000000 })],
      }),
    )
    file: Express.Multer.File,
    @Body() createPublicacioneDto: CreatePublicacioneDto,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha subido ninguna imagen');
    }

    if (!createPublicacioneDto.descripcion) {
      throw new BadRequestException(
        'La descripción de la publicación es requerida',
      );
    }

    createPublicacioneDto.urlImagen = `/images/${file.filename}`;

    return await this.publicacionesService.create(createPublicacioneDto);
  }

  @Get('/todas')
  findAll(
    @Query('sort') sort?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    // Normalizar y validar parámetros
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const safeOffset =
      Number.isNaN(parsedOffset) || parsedOffset < 0 ? 0 : parsedOffset;
    const safeLimit =
      Number.isNaN(parsedLimit) || parsedLimit <= 0
        ? 20
        : Math.min(parsedLimit, 100);

    const opts: { sort?: string; offset?: number; limit?: number } = {
      sort: sort ?? 'date',
      offset: safeOffset,
      limit: safeLimit,
    };

    return this.publicacionesService.findAll(opts);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.publicacionesService.findOneById(id);
  }
  @UseGuards(JwtCookieGuard)
  @Delete(':id')
  eliminarPublicacion(@Param('id') id: string, @Req() req: any) {
    return this.publicacionesService.eliminarPublicacion(id, req.user.id);
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
    console.log('REQ.USER DESDE COOKIE GUARD:', req.user);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.publicacionesService.toggleLike(id, req.user.nombreUsuario);
  }

  //                 SECCION COMENTARIOS
  //Post de comentario
  @UseGuards(JwtCookieGuard)
  @Post('/:id/comentarios')
  async crearComentario(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('contenido') contenido: string,
  ) {
    console.log(req.user.id);
    return await this.publicacionesService.agregarComentario(
      id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.id,
      contenido,
    );
  }
  @UseGuards(JwtCookieGuard)
  @Get('/:id/comentarios')
  async obtenerComentarios(@Param('id') id: string) {
    return await this.publicacionesService.obtenerComentarios(id);
  }
  @UseGuards(JwtCookieGuard)
  @Delete('/comentarios/:id')
  async borrarComentario(@Param('id') id: string, @Req() req: Request) {
    return await this.publicacionesService.eliminarComentario(id, req.user.id);
  }
  //Put de comentario
}
