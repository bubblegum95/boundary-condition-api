import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../type/role.type';

@Entity({ name: 'user' })
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, length: 10 })
  name: string;

  @Column({ type: 'varchar', nullable: false, length: 8 })
  username: string;

  @Column({ type: 'varchar', nullable: false, length: 16 })
  password: string;

  @Column({ type: 'varchar', nullable: false, length: 40, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, length: 15, unique: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  address: string;

  @Column({ type: 'boolean', nullable: false })
  agreed: boolean;

  @Column({ type: 'boolean', nullable: false })
  verified: boolean;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;
}
