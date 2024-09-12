import { Observatory } from '../entities/observatory.entity';

export default interface ProximateObservDto {
  observatory: Observatory;
  gap: number;
}
