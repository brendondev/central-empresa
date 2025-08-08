import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsObject, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WhatsAppStatus } from '../entities/whatsapp-connection.entity';
import { MessageType, MessageDirection } from '../entities/message.entity';
import { AutomationType, AutomationTrigger, AutomationActionType } from '../entities/automation.entity';

export class CreateWhatsAppConnectionDto {
  @ApiProperty({ description: 'Nome da sessão do WhatsApp' })
  @IsString()
  sessionId: string;
}

export class UpdateWhatsAppConnectionDto {
  @ApiProperty({ description: 'Nome do perfil', required: false })
  @IsOptional()
  @IsString()
  profileName?: string;

  @ApiProperty({ description: 'Configurações da conexão', required: false })
  @IsOptional()
  @IsObject()
  settings?: {
    autoReply?: boolean;
    autoReplyMessage?: string;
    businessHours?: {
      enabled: boolean;
      start: string;
      end: string;
      timezone: string;
    };
    webhookUrl?: string;
  };
}

export class CreateContactDto {
  @ApiProperty({ description: 'Número de telefone' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Nome do contato', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Nome personalizado', required: false })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Notas', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Categoria', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Cor personalizada', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'IDs das tags', required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];
}

export class UpdateContactDto {
  @ApiProperty({ description: 'Nome personalizado', required: false })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiProperty({ description: 'Email', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Notas', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Categoria', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Cor personalizada', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Bloqueado', required: false })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @ApiProperty({ description: 'Favorito', required: false })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiProperty({ description: 'IDs das tags', required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];
}

export class CreateTagDto {
  @ApiProperty({ description: 'Nome da tag' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descrição da tag', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Cor da tag', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Ícone da tag', required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateTagDto {
  @ApiProperty({ description: 'Nome da tag', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Descrição da tag', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Cor da tag', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ description: 'Ícone da tag', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Tag ativa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SendMessageDto {
  @ApiProperty({ description: 'ID do contato' })
  @IsNumber()
  contactId: number;

  @ApiProperty({ description: 'Tipo da mensagem', enum: MessageType })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({ description: 'Conteúdo da mensagem', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'URL da mídia', required: false })
  @IsOptional()
  @IsString()
  mediaUrl?: string;
}

export class CreateAutomationDto {
  @ApiProperty({ description: 'Nome da automação' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descrição da automação', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Tipo da automação', enum: AutomationType })
  @IsEnum(AutomationType)
  type: AutomationType;

  @ApiProperty({ description: 'Gatilho da automação', enum: AutomationTrigger })
  @IsEnum(AutomationTrigger)
  trigger: AutomationTrigger;

  @ApiProperty({ description: 'Condições do gatilho' })
  @IsObject()
  triggerConditions: {
    keywords?: string[];
    schedule?: {
      time: string;
      days: number[];
      timezone: string;
    };
    delay?: number;
  };

  @ApiProperty({ description: 'Ações da automação' })
  @IsArray()
  actions: {
    type: AutomationActionType;
    content?: string;
    mediaUrl?: string;
    tagName?: string;
    category?: string;
  }[];
}

export class UpdateAutomationDto {
  @ApiProperty({ description: 'Nome da automação', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Descrição da automação', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Condições do gatilho', required: false })
  @IsOptional()
  @IsObject()
  triggerConditions?: {
    keywords?: string[];
    schedule?: {
      time: string;
      days: number[];
      timezone: string;
    };
    delay?: number;
  };

  @ApiProperty({ description: 'Ações da automação', required: false })
  @IsOptional()
  @IsArray()
  actions?: {
    type: AutomationActionType;
    content?: string;
    mediaUrl?: string;
    tagName?: string;
    category?: string;
  }[];

  @ApiProperty({ description: 'Automação ativa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
