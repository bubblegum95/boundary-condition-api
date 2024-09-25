import { ApiProperty } from '@nestjs/swagger';

export default class FindCategoryListDto {
  @ApiProperty({
    example: ['Category1', 'Category2', 'Category3'],
    description: '아티클 이름 목록',
  })
  data: string[];
}
