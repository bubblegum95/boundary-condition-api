import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class WeatherToCreateDto {
  @IsNumber()
  @IsNotEmpty()
  observatoryId: number;

  @IsNumber()
  @IsNotEmpty()
  tamperature: number;

  @IsNumber()
  @IsNotEmpty()
  humidity: number;

  @IsString()
  @IsNotEmpty()
  measuredAt: string;
}
