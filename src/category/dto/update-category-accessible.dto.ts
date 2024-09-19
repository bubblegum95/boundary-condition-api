import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export default class UpdateCategoryAccessibleDto {
  @ApiProperty({
    description: '비회원사용자 접근 허용 여부',
    example: true,
  })
  @IsBoolean({ message: 'accessible은 boolean 타입입니다.' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsNotEmpty()
  accessible: boolean;
}
