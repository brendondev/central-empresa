import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { WhatsAppConnection } from '../entities/whatsapp-connection.entity';
import { Contact } from '../entities/contact.entity';
import { Message } from '../entities/message.entity';
import { Tag } from '../entities/tag.entity';
import { Automation } from '../entities/automation.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      username: this.configService.get('DB_USER', 'postgres'),
      password: this.configService.get('DB_PASS', 'postgres123'),
      database: this.configService.get('DB_NAME', 'central_empresa'),
      entities: [
        User, 
        Role, 
        WhatsAppConnection, 
        Contact, 
        Message, 
        Tag, 
        Automation
      ],
      synchronize: this.configService.get('NODE_ENV') !== 'production',
      logging: this.configService.get('NODE_ENV') === 'development',
    };
  }
}
