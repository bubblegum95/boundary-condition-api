import { ApiProperty } from '@nestjs/swagger';

export class PollutansAverageDto {
  @ApiProperty({ example: '1', description: '시군구 평균 미세먼지 등급' })
  PM10: string;

  @ApiProperty({ example: '1', description: '시군구 평균 초미세먼지 등급' })
  PM25: string;

  @ApiProperty({ example: '1', description: '시군구별 이산화질소 등급' })
  NO2: string;

  @ApiProperty({ example: '1', description: '시군구별 오존 등급' })
  O3: string;

  @ApiProperty({ example: '1', description: '시군구별 일산화탄소 등급' })
  CO: string;

  @ApiProperty({
    example: '1',
    description: '시군구별 이산화황(아황산가스) 등급',
  })
  SO2: string;
}

export class FindAverageDataDto {
  cityCode: number;
  cityName: string;
  sidoName: string;
  dataTime: string;
  pollutantsAverage: PollutansAverageDto;
}

export default class ReturnFindAverageDataDto {
  @ApiProperty({ example: '시군구별 대기질 측정 평균값을 조회합니다.' })
  message: string;

  @ApiProperty({ type: [FindAverageDataDto] })
  data: FindAverageDataDto[];
}
