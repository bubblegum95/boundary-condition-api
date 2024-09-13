import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from './user.entity';
import Role from './role.entity';

@Entity({ name: 'user_role' })
export default class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  roleId: number;

  @ManyToOne(() => User, (user) => user.userRoles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.userRoles)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
