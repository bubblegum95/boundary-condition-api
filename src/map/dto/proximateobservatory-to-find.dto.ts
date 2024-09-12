import { Observatory } from '../entities/observatory.entity';

export default class ProximateObservatoryToFindDto {
  lat: number;
  lng: number;
  observatories: Observatory[];
}
