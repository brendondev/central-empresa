import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WhatsAppConnection } from './whatsapp-connection.entity';
import { Contact } from './contact.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  LOCATION = 'location',
  CONTACT_CARD = 'contact_card'
}

export enum MessageDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PENDING = 'pending'
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  whatsappMessageId: string; // ID da mensagem no WhatsApp

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT
  })
  type: MessageType;

  @Column({
    type: 'enum',
    enum: MessageDirection
  })
  direction: MessageDirection;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.PENDING
  })
  status: MessageStatus;

  @Column({ type: 'text', nullable: true })
  content: string; // Texto da mensagem

  @Column({ nullable: true })
  mediaUrl: string; // URL do arquivo de mídia

  @Column({ nullable: true })
  mediaFilename: string;

  @Column({ nullable: true })
  mediaMimeType: string;

  @Column({ type: 'bigint', nullable: true })
  mediaSize: number;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // Metadados adicionais

  @Column({ type: 'boolean', default: false })
  isForwarded: boolean;

  @Column({ type: 'boolean', default: false })
  isStarred: boolean;

  @Column({ type: 'timestamp' })
  timestamp: Date; // Timestamp da mensagem no WhatsApp

  // Relacionamento com WhatsApp Connection
  @ManyToOne(() => WhatsAppConnection, connection => connection.messages)
  @JoinColumn({ name: 'whatsappConnectionId' })
  whatsappConnection: WhatsAppConnection;

  @Column()
  whatsappConnectionId: number;

  // Relacionamento com contato
  @ManyToOne(() => Contact, contact => contact.messages)
  @JoinColumn({ name: 'contactId' })
  contact: Contact;

  @Column()
  contactId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
