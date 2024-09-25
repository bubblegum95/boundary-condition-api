import { ApiProperty } from '@nestjs/swagger';
import FindCategoriesDto from './find-categories.dto';

export default class ReturnFindCategoryDto {
  @ApiProperty({ example: '' })
  message: string;

  @ApiProperty({ type: [FindCategoriesDto] })
  data: FindCategoriesDto[];
}
