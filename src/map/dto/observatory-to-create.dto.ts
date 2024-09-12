import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export default class ObservatoryToCreateDto {
  @IsNumber()
  @IsNotEmpty()
  num: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  lng: number;
}
