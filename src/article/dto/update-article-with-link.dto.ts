import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateArticleWithLinkDto {
  @IsString()
  @ApiProperty({
    example: '아티클 제목',
    description: '아티클 제목',
    required: false,
  })
  @IsOptional()
  title?: string;

  @IsString()
  @ApiProperty({
    example: '아티클 부제목',
    description: '아티클 부제목',
    required: false,
  })
  @IsOptional()
  subtitle?: string;

  @IsString()
  @ApiProperty({
    example: '아티클 링크 url',
    description: '아티클 링크 url',
    required: false,
  })
  @IsOptional()
  link?: string;

  @IsString()
  @ApiProperty({
    example: '아티클 썸네일 이미지 url',
    description: '아티클 썸네일 이미지 url',
    required: false,
  })
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @ApiProperty({
    example: '아티클 카테고리 이름',
    description: '아티클 카테고리 이름',
    required: false,
  })
  @IsOptional()
  category?: string;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: '아티클 공개 여부',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean;
}
