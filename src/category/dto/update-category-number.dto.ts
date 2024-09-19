import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export default class UpdateCategoryNumberDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  number: number;
}
