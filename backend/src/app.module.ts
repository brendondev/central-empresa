import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { WhatsAppConnection } from './entities/whatsapp-connection.entity';
import { Contact } from './entities/contact.entity';
import { Message } from './entities/message.entity';
import { Tag } from './entities/tag.entity';
import { Automation } from './entities/automation.entity';
import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    AuthModule,
    WhatsAppModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
