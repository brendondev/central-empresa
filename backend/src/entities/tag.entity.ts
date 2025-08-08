import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Contact } from './contact.entity';
import { WhatsAppConnection } from './whatsapp-connection.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: '#007bff' })
  color: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relacionamento com WhatsApp Connection
  @ManyToOne(() => WhatsAppConnection)
  @JoinColumn({ name: 'whatsappConnectionId' })
  whatsappConnection: WhatsAppConnection;

  @Column()
  whatsappConnectionId: number;

  // Relacionamento com contatos (many-to-many)
  @ManyToMany(() => Contact, contact => contact.tags)
  contacts: Contact[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
