import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export default class UpdateCategoryIsUsedDto {
  @ApiProperty({
    description: '카테고리 사용 여부',
    example: true,
  })
  @IsBoolean({ message: 'isUsed는 boolean 타입입니다.' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsNotEmpty()
  isUsed: boolean;
}
