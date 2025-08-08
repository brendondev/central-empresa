import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { WhatsAppConnection } from './whatsapp-connection.entity';
import { Message } from './message.entity';
import { Tag } from './tag.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  customName: string; // Nome personalizado definido pela empresa

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  color: string; // Cor personalizada para o contato

  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ type: 'boolean', default: false })
  isFavorite: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastMessage: Date;

  @Column({ type: 'json', nullable: true })
  customFields: Record<string, any>; // Campos personalizados

  // Relacionamento com WhatsApp Connection
  @ManyToOne(() => WhatsAppConnection, connection => connection.contacts)
  @JoinColumn({ name: 'whatsappConnectionId' })
  whatsappConnection: WhatsAppConnection;

  @Column()
  whatsappConnectionId: number;

  // Relacionamento com mensagens
  @OneToMany(() => Message, message => message.contact)
  messages: Message[];

  // Relacionamento com tags (many-to-many)
  @ManyToMany(() => Tag, tag => tag.contacts)
  @JoinTable({
    name: 'contact_tags',
    joinColumn: { name: 'contactId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' }
  })
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
