import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): object {
    return {
      status: 'ok',
      message: 'Central Empresa API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  getHealth(): object {
    // TODO: Implementar verificações de saúde do sistema
    // - Conexão com banco de dados
    // - Conexão com serviços externos
    // - Uso de memória e CPU
    // - Status dos workers/queues
    
    return {
      status: 'healthy',
      checks: {
        database: 'ok', // TODO: verificar conexão real com DB
        memory: 'ok',    // TODO: verificar uso de memória
        disk: 'ok',      // TODO: verificar espaço em disco
      },
      timestamp: new Date().toISOString(),
    };
  }
}
