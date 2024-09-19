import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export default class FindCategoriesDto {
  @ApiProperty({ example: 1, description: '카테고리 ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Category', description: '카테고리 이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: true, description: '카테고리 사용 여부' })
  @IsBoolean()
  isUsed: boolean;

  @ApiProperty({
    example: true,
    description: '카테고리 비회원 사용자 접근 허용 여부',
  })
  @IsBoolean()
  accessible: boolean;

  @ApiProperty({ example: '0000.00.00', description: '생성일자' })
  @IsString()
  createdAt: string;
}
