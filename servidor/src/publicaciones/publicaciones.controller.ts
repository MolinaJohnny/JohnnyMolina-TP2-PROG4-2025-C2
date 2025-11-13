import type { Request } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post('/subir')
  create(@Body() createPublicacioneDto: CreatePublicacioneDto) {
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
