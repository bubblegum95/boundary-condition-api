import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import WeatherToCreateDto from './weather-to-create.dto';

export default class WeatherToUpdateDto extends WeatherToCreateDto {
  @IsNumber()
  @IsNotEmpty()
  observatoryId: number;

  @IsNumber()
  @IsNotEmpty()
  num: number;

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
