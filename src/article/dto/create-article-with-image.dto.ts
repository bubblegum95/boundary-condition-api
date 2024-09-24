import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateArticleWithImageDto {
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
  @IsNotEmpty({ message: '카테고리를 선택해주세요.' })
  @ApiProperty({
    example: '아티클 카테고리 이름',
    description: '아티클 카테고리 이름',
  })
  category: string;

  @IsString()
  @IsNotEmpty({ message: '아티클 공개 허용 여부를 선택해주세요.' })
  @ApiProperty({
    example: true,
    description: '아티클 공개 허용 여부 허용 여부',
  })
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic: boolean;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '썸네일 이미지 업로드',
  })
  @IsNotEmpty({ message: '썸네일 이미지를 업로드해주세요.' })
  image: any;
}
