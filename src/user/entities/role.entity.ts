import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserRole from './userRole.entity';

@Entity('role')
export default class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, length: 6, unique: true })
  name: string;

  @OneToMany(() => UserRole, (userRoles) => userRoles.role)
  userRoles: UserRole[];
}
