import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export default class UpdateCategoryIsUsedDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isUsed: boolean;
}
