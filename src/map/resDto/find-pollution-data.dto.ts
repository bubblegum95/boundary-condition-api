import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({ example: 37.7749, description: '위도 값 (Latitude)' })
  latitude: number;

  @ApiProperty({ example: 122.4194, description: '경도 값 (Longitude)' })
  longitude: number;
}

export class PollutionDataDto {
  @ApiProperty({ example: '40', description: 'PM10 수치' })
  data: string;

  @ApiProperty({ example: 1, description: 'PM10 등급' })
  grade: number;
}

export class WeatherDataDto {
  @ApiProperty({ example: 25, description: '온도 (Temperature)' })
  TP: number;

  @ApiProperty({ example: 60, description: '습도 (Humidity)' })
  HM: number;
}

export class AirDataDto {
  @ApiProperty({ type: PollutionDataDto })
  PM10: PollutionDataDto;

  @ApiProperty({ type: PollutionDataDto })
  PM25: PollutionDataDto;

  @ApiProperty({ type: PollutionDataDto })
  NO2: PollutionDataDto;

  @ApiProperty({ type: PollutionDataDto })
  O3: PollutionDataDto;

  @ApiProperty({ type: PollutionDataDto })
  SO2: PollutionDataDto;

  @ApiProperty({ type: PollutionDataDto })
  CO: PollutionDataDto;

  @ApiProperty({ type: WeatherDataDto })
  TP: number;

  @ApiProperty({ type: WeatherDataDto })
  HM: number;
}

export class FindPollutionDataDto {
  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @ApiProperty({ example: 'Station Name', description: '측정소 이름' })
  station: string;

  @ApiProperty({ example: 'Main Address', description: '주소 제목' })
  addressTitle: string;

  @ApiProperty({ example: 'Sub Address', description: '주소 부제목' })
  addressSub: string;

  @ApiProperty({ example: '2024-09-24', description: '측정 날짜' })
  date: string;

  @ApiProperty({ type: AirDataDto })
  airData: AirDataDto;
}

export default class ReturnFindPollutionDataDto {
  @ApiProperty({ example: '대기질 정보를 조회합니다.' })
  message: string;

  @ApiProperty({ type: [FindPollutionDataDto] })
  data: FindPollutionDataDto[];
}
