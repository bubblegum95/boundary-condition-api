import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export default class UpdateExposableDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  exposable: boolean;
}
