import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export default class UpdateSearchableDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  searchable: boolean;
}
