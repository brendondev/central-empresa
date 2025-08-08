import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WhatsAppConnection } from './whatsapp-connection.entity';

export enum AutomationType {
  WELCOME = 'welcome',
  KEYWORD = 'keyword',
  SCHEDULE = 'schedule',
  ABSENCE = 'absence'
}

export enum AutomationTrigger {
  NEW_CONTACT = 'new_contact',
  KEYWORD_MATCH = 'keyword_match',
  TIME_SCHEDULE = 'time_schedule',
  BUSINESS_HOURS_END = 'business_hours_end'
}

export enum AutomationActionType {
  SEND_TEXT = 'send_text',
  SEND_IMAGE = 'send_image',
  SEND_AUDIO = 'send_audio',
  SEND_DOCUMENT = 'send_document',
  ADD_TAG = 'add_tag',
  CHANGE_CATEGORY = 'change_category'
}

@Entity('automations')
export class Automation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AutomationType
  })
  type: AutomationType;

  @Column({
    type: 'enum',
    enum: AutomationTrigger
  })
  trigger: AutomationTrigger;

  @Column({ type: 'json' })
  triggerConditions: {
    keywords?: string[];
    schedule?: {
      time: string;
      days: number[]; // 0-6 (domingo a sábado)
      timezone: string;
    };
    delay?: number; // delay em minutos
  };

  @Column({ type: 'json' })
  actions: {
    type: AutomationActionType;
    content?: string;
    mediaUrl?: string;
    tagName?: string;
    category?: string;
  }[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  executionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastExecuted: Date;

  // Relacionamento com WhatsApp Connection
  @ManyToOne(() => WhatsAppConnection)
  @JoinColumn({ name: 'whatsappConnectionId' })
  whatsappConnection: WhatsAppConnection;

  @Column()
  whatsappConnectionId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
