import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): string {
    // TODO: Implementar lógica da rota raiz
    return 'API central-empresa';
  }
}
