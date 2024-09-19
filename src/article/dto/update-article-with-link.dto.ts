import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateArticleWithLinkDto {
  @IsString()
  @ApiProperty({
    example: '아티클 제목',
    description: '아티클 제목',
  })
  title?: string;

  @IsString()
  @ApiProperty({
    example: '아티클 부제목',
    description: '아티클 부제목',
  })
  subtitle?: string;

  @IsString()
  @ApiProperty({
    example: '아티클 링크 url',
    description: '아티클 링크 url',
  })
  link?: string;

  @IsString()
  @ApiProperty({
    example: '아티클 썸네일 이미지 url',
    description: '아티클 썸네일 이미지 url',
  })
  thumbnail?: string;

  @IsString()
  @ApiProperty({
    example: '아티클 카테고리 이름',
    description: '아티클 카테고리 이름',
  })
  category?: string;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description: '아티클 지도페이지 노출 여부',
  })
  exposable?: boolean;
}
