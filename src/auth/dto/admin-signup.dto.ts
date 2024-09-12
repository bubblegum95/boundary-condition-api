import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class AdminSignUpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '최대 위도(y좌표)',
    example: 37.53,
  })
  password: string;
}
