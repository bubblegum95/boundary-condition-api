import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateCategoryDto {
  @ApiProperty({
    description: '카테고리 이름',
    example: 'Category',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
