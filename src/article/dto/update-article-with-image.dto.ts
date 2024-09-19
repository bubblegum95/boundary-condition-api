import { IsBoolean, IsNotEmpty, IsString, isNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class UpdateArticleWithImageDto {
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
    description: '아티클 지도 페이지 노출 여부',
  })
  exposable?: boolean;

  @ApiProperty({
    description: '아티클 검색 허용 여부',
  })
  @IsNotEmpty({ message: '이미지를 업로드해주세요.' })
  image: any;
}
