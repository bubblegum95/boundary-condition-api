import { ApiProperty } from '@nestjs/swagger';

export default class ReturnFindCategoryListDto {
  @ApiProperty({ example: '카테고리 목록을 조회합니다.' })
  message: string;

  @ApiProperty({
    example: ['Category1', 'Category2', 'Category3'],
    description: '아티클 이름 목록',
  })
  data: string[];
}
