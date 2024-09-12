import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import ObservatoryToCreateDto from './observatory-to-create.dto';

export default class ObservatoryToUpdateDto extends ObservatoryToCreateDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

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
