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
        relations: ['userRoles', 'userRoles.role'],
      });
    } catch (error) {
      throw error;
    }
  }

  async makeUserAddr(dto: SignUpDto) {
    try {
      const { name, username, email, password, phone, address } = dto;
      const salt = '10';
      const hashedpassword = bcrypt.hash(password, salt);
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
    console.log(role);
    return role;
  }

  async makeRoleRelation(userId: number, roleId: number) {
    const madeUserRole = await this.userRoleRepository.save({
      userId,
      roleId,
    });

    return madeUserRole;
  }

  async findAdminAddress(dto: AdminSignInDto) {
    try {
      const { email, password } = dto;
      const user = await this.findUserbyEmail(email);

      if (!user) {
        throw new BadRequestException('일치하는 계정이 없습니다.');
      }

      const isPassword = await this.verifyPassword(password, user.password);

      if (!isPassword) {
        throw new BadRequestException('비밀번호가 일치하지 않습니다.');
      }

      return {
        email: user.email,
        id: user.id,
        roles: user.userRoles.map((userRole) => userRole.role.name),
      };
    } catch (error) {
      throw error;
    }
  }

  async signUpAdmin(dto: AdminSignUpDto) {
    try {
      const { name, username, email, password } = dto;
      const data = {
        name,
        username,
        email,
        password,
        phone: null,
        address: null,
        agreed: true,
      };
      const isEmail = await this.findUserbyEmail(email);

      if (isEmail) {
        throw new BadRequestException('이미 존재하는 이메일입니다.');
      }

      const admin = await this.makeUserAddr(data);
      const role = await this.findRole('ADMIN');
      const madeUserRole = await this.makeRoleRelation(admin.id, role.id);

      console.log(admin, madeUserRole);
      return admin.email;
    } catch (error) {
      throw error;
    }
  }
}
