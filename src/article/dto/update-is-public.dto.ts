import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export default class UpdateIsPublicDto {
  @ApiProperty({ example: true, description: '아티클 공개 여부' })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsNotEmpty()
  isPublic: boolean;
}
