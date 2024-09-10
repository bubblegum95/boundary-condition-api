import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Observatory } from './observatory.entity';

@Entity({ name: 'weather' })
export default class Weather {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  observatory_id: number;

  @Column({ type: 'fixed', nullable: false })
  tamperature: number; // TA: 온도

  @Column({ type: 'fixed', nullable: false })
  humidity: number; // HM: 상대습도

  @Column({ type: 'varchar', nullable: false, length: 20 })
  measuredAt: string; // TM : 관측시각

  @OneToOne(() => Observatory, (observatory) => observatory.weather)
  @JoinColumn()
  observatory: Observatory;
}
