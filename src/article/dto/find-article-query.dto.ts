import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export default class FindArticleQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '아티클 아이템 개수',
    example: 10,
  })
  items: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '목록 페이지',
    example: 1,
  })
  page: number;
}
