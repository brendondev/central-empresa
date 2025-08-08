import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
// import { WhatsAppGateway } from './whatsapp.gateway';
import { WhatsAppConnection } from '../entities/whatsapp-connection.entity';
import { Contact } from '../entities/contact.entity';
import { Message } from '../entities/message.entity';
import { Tag } from '../entities/tag.entity';
import { Automation } from '../entities/automation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsAppConnection,
      Contact,
      Message,
      Tag,
      Automation,
    ]),
  ],
  controllers: [WhatsAppController],
  providers: [WhatsAppService], // WhatsAppGateway
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
