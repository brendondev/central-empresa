import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    // TODO: Adicionar módulos de funcionalidades aqui
    // Exemplo: ChatModule, DocsModule, RoutesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
