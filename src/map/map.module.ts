import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pollutions } from './entities/pollutions.entity';
import { Stations } from './entities/stations.entity';
import { City } from './entities/city.entity';
import { Average } from './entities/average.entity';
import Weather from './entities/weather.entity';
import { Observatory } from './entities/observatory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pollutions,
      Stations,
      City,
      Average,
      Weather,
      Observatory,
    ]),
  ],
  providers: [MapService],
  controllers: [MapController],
})
export class MapModule {}
