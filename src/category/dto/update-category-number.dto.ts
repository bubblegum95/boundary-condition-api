import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export default class UpdateCategoryNumberDto {
  @ApiProperty({
    example: 1,
    description: '현재 위치에서 변경할 순번',
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'num은 number 타입입니다.' })
  @IsNotEmpty()
  num: number;
}
