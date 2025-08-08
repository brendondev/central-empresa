import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Contact } from './contact.entity';
import { Message } from './message.entity';

export enum WhatsAppStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  QR_PENDING = 'qr_pending',
  ERROR = 'error'
}

@Entity('whatsapp_connections')
export class WhatsAppConnection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  sessionId: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  profileName: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({
    type: 'enum',
    enum: WhatsAppStatus,
    default: WhatsAppStatus.DISCONNECTED
  })
  status: WhatsAppStatus;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @Column({ type: 'json', nullable: true })
  settings: {
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

  // Relacionamento com usuário
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  // Relacionamentos
  @OneToMany(() => Contact, contact => contact.whatsappConnection)
  contacts: Contact[];

  @OneToMany(() => Message, message => message.whatsappConnection)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
