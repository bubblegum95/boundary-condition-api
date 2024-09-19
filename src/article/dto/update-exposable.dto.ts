import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export default class UpdateExposableDto {
  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsNotEmpty()
  exposable: boolean;
}
