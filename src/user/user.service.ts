import { BadRequestException, Injectable } from '@nestjs/common';
import AdminSignUpDto from '../auth/dto/admin-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import AdminSignInDto from '../auth/dto/admin-signin.dto';
import Role from './entities/role.entity';
import UserRole from './entities/userRole.entity';
import SignUpDto from '../auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>
  ) {}

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async findUserbyEmail(email: string) {
    try {
      return await this.userRepository.findOne({
        where: { email },
      });
    } catch (error) {
      throw error;
    }
  }

  async makeUserAddr(dto: SignUpDto) {
    try {
      const { name, username, email, password, phone, address } = dto;
      const salt = 5;
      const hashedpassword = await bcrypt.hash(password, salt);
      const user = await this.userRepository.save({
        name,
        username,
        email,
        password: hashedpassword,
        phone,
        address,
        verified: true,
        agreed: false,
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findRole(name: string) {
    const role = await this.roleRepository.findOne({ where: { name } });
    return role;
  }

  async makeRole(name: string) {
    const nameUpCase = name.toUpperCase();
    const role = await this.roleRepository.save({ name: nameUpCase });
    return role;
  }

  async makeRoleRelation(userId: number, roleId: number) {
    const madeUserRole = await this.userRoleRepository.save({
      userId,
      roleId,
    });

    return madeUserRole;
  }

  async findUserRole(userId: number) {
    try {
      const userRoles = await this.userRoleRepository.find({
        where: { userId },
        relations: ['role'],
      });
      const roles = userRoles.map((userRole) => userRole.role.name);
      return roles;
    } catch (error) {
      throw error;
    }
  }
}
