import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchArticleQueryDto {
  @ApiProperty({
    example: 'Category',
    description: '카테고리명',
    required: false,
  })
  @IsString({ message: 'category는 string 타입 또는 null 입니다.' })
  @IsOptional()
  category?: string | null;

  @ApiProperty({
    example: 'keyword',
    description: '검색 키워드',
    required: false,
  })
  @IsString({ message: 'keyword는 string 타입 또는 null 입니다.' })
  @IsOptional()
  keyword?: string | null;

  @ApiProperty({ example: 1, description: '페이지', required: true })
  @IsNumber({}, { message: 'page는 number 타입입니다.' })
  @IsNotEmpty({ message: '페이지를 입력해주세요.' })
  @Transform(({ value }) => Number(value))
  page: number;

  @ApiProperty({
    example: 9,
    description: '페이지별 아이템 수',
    required: true,
  })
  @IsNumber({}, { message: 'limit은 number 타입입니다.' })
  @IsNotEmpty({ message: '페이지별 아티클 수량을 입력해주세요.' })
  @Transform(({ value }) => Number(value))
  limit: number;
}
