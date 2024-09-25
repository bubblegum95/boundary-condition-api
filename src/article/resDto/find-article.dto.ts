import { ApiProperty } from '@nestjs/swagger';

export class FindArticleDto {
  @ApiProperty({ example: 1, description: '아티클 아이디' })
  id: number;

  @ApiProperty({ example: 'title', description: '아티클 타이틀' })
  title: string;

  @ApiProperty({ example: 'subtitle', description: '아티클 부제목' })
  subtitle: string;

  @ApiProperty({ example: 'link', description: '아티클 링크' })
  link: string;

  @ApiProperty({
    example: 'thumbnail image url',
    description: '썸네일 이미지 url',
  })
  thumbnail: string;

  @ApiProperty({ example: 1, description: '카테고리 이름' })
  category: string;

  @ApiProperty({ example: true, description: '아티클 공개 여부' })
  isPublic: boolean;
}

export class ReturnFindArticleDto {
  @ApiProperty({ example: '아티클을 조회합니다.' })
  message: string;

  @ApiProperty({ type: FindArticleDto })
  data: FindArticleDto;
}
