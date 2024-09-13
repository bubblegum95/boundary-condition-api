import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class AdminSignUpDto {
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '관리자 계정 성함',
    example: '이춘득',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '관리자 계정 닉네임',
    example: 'Chunduk',
  })
  username: string;
}
