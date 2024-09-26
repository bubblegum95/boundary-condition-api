import { ApiProperty } from '@nestjs/swagger';

export class FindArticlesAdminDto {
  @ApiProperty({ example: 1, description: '아티클 ID' })
  id: number;

  @ApiProperty({ example: 'title', description: '아티클 제목' })
  title: string;

  @ApiProperty({ example: 'subtitle', description: '아티클 부제목' })
  subtitle: string;

  @ApiProperty({ example: 'Category', description: '아티클 카테고리 이름' })
  category: string;

  @ApiProperty({
    example: true,
    description: '아티클 공개 허용 허용 여부',
  })
  isPublic: boolean;

  @ApiProperty({ example: '0000.00.00', description: '아티클 생성일자' })
  createdAt: string;
}

export class ReturnFindArticlesAdminDto {
  @ApiProperty({
    example: '아티클을 조회합니다.',
    description: 'response ok message',
  })
  message: string;

  @ApiProperty({ type: [FindArticlesAdminDto] })
  data: FindArticlesAdminDto[];
}
