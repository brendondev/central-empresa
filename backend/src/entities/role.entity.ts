import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ nullable: true, length: 200 })
  description: string;

  @Column({ default: 1 })
  level: number; // 0=Master, 1=Admin, 2=Manager, 3=Seller, 4=Rota, 5=Viewer

  @Column('json', { nullable: true })
  permissions: string[];

  @OneToMany(() => User, user => user.role)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
