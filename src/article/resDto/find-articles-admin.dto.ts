import { ApiProperty } from '@nestjs/swagger';
import Article from '../entities/article.entity';

export class FindArticlesAdminDto {
  @ApiProperty({ example: 1, description: '아티클 ID' })
  id: Article['id'];

  @ApiProperty({ example: 'title', description: '아티클 제목' })
  title: Article['title'];

  @ApiProperty({ example: 'subtitle', description: '아티클 부제목' })
  subtitle: Article['subtitle'];

  @ApiProperty({ example: 'Category', description: '아티클 카테고리 이름' })
  category: Article['category']['name'];

  @ApiProperty({
    example: true,
    description: '아티클 공개 허용 허용 여부',
  })
  isPublic: Article['isPublic'];

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
