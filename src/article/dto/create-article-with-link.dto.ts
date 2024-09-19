import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateArticleWithLinkDto {
  @IsString()
  @IsNotEmpty({ message: '아티클 제목을 입력해주세요.' })
  @ApiProperty({
    example: '아티클 제목',
    description: '아티클 제목',
  })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '아티클 부제목을 입력해주세요.' })
  @ApiProperty({
    example: '아티클 부제목',
    description: '아티클 부제목',
  })
  subtitle: string;

  @IsString()
  @IsNotEmpty({ message: '아티클 링크를 입력해주세요.' })
  @ApiProperty({
    example: '아티클 링크 url',
    description: '아티클 링크 url',
  })
  link: string;

  @IsString()
  @IsNotEmpty({ message: '아티클 썸네일을 입력해주세요.' })
  @ApiProperty({
    example: '아티클 썸네일 이미지 url',
    description: '아티클 썸네일 이미지 url',
  })
  thumbnail: string;

  @IsString()
  @IsNotEmpty({ message: '카테고리를 선택해주세요.' })
  @ApiProperty({
    example: '아티클 카테고리 이름',
    description: '아티클 카테고리 이름',
  })
  category: string;

  @IsBoolean()
  @IsNotEmpty({ message: '아티클 지도페이지 노출 여부를 선택해주세요.' })
  @Transform(({ value }) => value === 'true' || value === true)
  @ApiProperty({
    example: true,
    description: '아티클 지도페이지 노출 여부',
  })
  exposable: boolean;
}
