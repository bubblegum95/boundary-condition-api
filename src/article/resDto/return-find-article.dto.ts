import { ApiProperty } from '@nestjs/swagger';
import FindArticlesDto from './find-articles.dto';

export default class ReturnFindArticleDto {
  @ApiProperty({
    example: '아티클을 조회합니다.',
    description: 'response ok message',
  })
  message: string;

  @ApiProperty({ type: [FindArticlesDto] })
  data: FindArticlesDto[];
}
