import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  /*mongodb+srv://JOHNNYMOLINA:M8tbBf3cHtxNb8P@cluster0.ygfijlr.mongodb.net/?appName=Cluster0*/
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
