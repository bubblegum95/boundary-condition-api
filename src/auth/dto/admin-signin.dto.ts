import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class AdminSignInDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '관리자 계정 이메일',
    example: 'example@email.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '관리자 계정 비밀번호',
    example: 'example1234',
  })
  password: string;
}
