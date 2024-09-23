import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LocationInfoDto } from './dto/locationInfo.dto';
import { Average } from './entities/average.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import Weather from './entities/weather.entity';
import { Observatory } from './entities/observatory.entity';
import ProximateObservatoryToFindDto from './dto/proximateobservatory-to-find.dto';
import ProximateObservDto from './dto/proximateobserv.dto';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(Average)
    private readonly averageRepository: Repository<Average>,
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
    @InjectRepository(Observatory)
    private readonly observatoryRepository: Repository<Observatory>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger
  ) {}

  async fixTypeToNumber(data: number) {
    try {
      const fixedData = Number(data.toFixed(8));
      return fixedData;
    } catch (error) {
      throw error;
    }
  }

  async kmToLatRadian(distance: number): Promise<number> {
    try {
      const earthRadius = 6371;
      const radian = this.fixTypeToNumber(
        (distance / earthRadius) * (180 / Math.PI)
      );
      return radian;
    } catch (error) {
      throw error;
    }
  }

  async kmToLngRadian(lat: number, distance: number): Promise<number> {
    try {
      const earthRadius = 6371;
      const latRad = lat * (Math.PI / 180); // 위도를 라디안으로 변환
      const kmPerDegree =
        earthRadius * Math.cos(latRad) * ((2 * Math.PI) / 360);
      const radian = this.fixTypeToNumber(distance / kmPerDegree);
      return radian;
    } catch (error) {
      throw error;
    }
  }

  async calculateLatRange(lat: number, distance: number) {
    try {
      const latRad = await this.kmToLatRadian(distance);
      const minLat = await this.fixTypeToNumber(lat - latRad);
      const maxLat = await this.fixTypeToNumber(Number(lat) + Number(latRad));
      return { minLat, maxLat };
    } catch (error) {
      throw error;
    }
  }

  async calculateLngRange(lat: number, lng: number, distance: number) {
    try {
      const lngRad = await this.kmToLngRadian(lat, distance);
      const minLng = await this.fixTypeToNumber(lng - lngRad);
      const maxLng = await this.fixTypeToNumber(Number(lng) + Number(lngRad));
      return { minLng, maxLng };
    } catch (error) {
      throw error;
    }
  }

  async getRangeOfLocation(lat: number, lng: number, distance: number) {
    try {
      let { minLat, maxLat } = await this.calculateLatRange(lat, distance);
      let { minLng, maxLng } = await this.calculateLngRange(lat, lng, distance);

      console.log(`위도 범위: ${minLat} ~ ${maxLat}`);
      console.log(`경도 범위: ${minLng} ~ ${maxLng}`);

      return { minLat, maxLat, minLng, maxLng };
    } catch (error) {
      throw error;
    }
  }

  async findNearbyObservatoryWeather(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Promise<Observatory[]> {
    try {
      const data = await this.observatoryRepository
        .createQueryBuilder('observatory')
        .leftJoinAndSelect('observatory.weather', 'weather')
        .where('observatory.lat BETWEEN :minLat AND :maxLat', {
          minLat,
          maxLat,
        })
        .andWhere('observatory.lng BETWEEN :minLng AND :maxLng', {
          minLng,
          maxLng,
        })
        .getMany();

      console.log(data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  // 위치정보로 거리 계산하기
  async haversineGreatCircleDistance(
    latitudeFrom: number,
    longitudeFrom: number,
    latitudeTo: number,
    longitudeTo: number
  ) {
    try {
      const latFrom = latitudeFrom * (Math.PI / 180);
      const lonFrom = longitudeFrom * (Math.PI / 180);
      const latTo = latitudeTo * (Math.PI / 180);
      const lonTo = longitudeTo * (Math.PI / 180);
      const latDelta = latTo - latFrom;
      const lonDelta = lonTo - lonFrom;

      const angle =
        2 *
        Math.asin(
          Math.sqrt(
            Math.pow(Math.sin(latDelta / 2), 2) +
              Math.cos(latFrom) *
                Math.cos(latTo) *
                Math.pow(Math.sin(lonDelta / 2), 2)
          )
        );
      const earthRadius = 6371;

      return angle * earthRadius;
    } catch (error) {
      throw error;
    }
  }

  async findProximateObservatory(dto: ProximateObservatoryToFindDto) {
    try {
      const { lat, lng, observatories } = dto;
      let list: ProximateObservDto[] | null = [];

      for (const observatory of observatories) {
        const latTo = observatory.lat;
        const lngTo = observatory.lng;
        const latFrom = lat;
        const lngFrom = lng;
        const gap = await this.haversineGreatCircleDistance(
          latFrom,
          lngFrom,
          latTo,
          lngTo
        );
        const data = {
          observatory,
          gap,
        };
        list.push(data);
      }
      list.sort((a, b) => a.gap - b.gap);
      return list[0];
    } catch (error) {
      throw error;
    }
  }

  async findOneObservatoryWeather(lat: number, lng: number) {
    try {
      const distance = 50; // km
      const { minLat, maxLat, minLng, maxLng } = await this.getRangeOfLocation(
        lat,
        lng,
        distance
      );
      const observatories = await this.findNearbyObservatoryWeather(
        minLat,
        maxLat,
        minLng,
        maxLng
      );
      const data = await this.findProximateObservatory({
        lat,
        lng,
        observatories,
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async findStationsPollution(dto: LocationInfoDto) {
    const { minLat, maxLat, minLng, maxLng } = dto;
    const rawQuery = `
      SELECT 
        p.*, 
        s.id as station_id,
        s.station_name,
        s.addr,
        s.dm_x,
        s.dm_y
      FROM 
        pollutions p 
      INNER JOIN 
        stations s 
      ON 
        p.station_id = s.id 
      WHERE 
        s.dm_x BETWEEN $1 AND $2 
        AND s.dm_y BETWEEN $3 AND $4
    `;
    const parameters = [minLat, maxLat, minLng, maxLng];

    return await this.entityManager.query(rawQuery, parameters);
  }

  async getPollutionInformation(dto: LocationInfoDto) {
    this.logger.debug('start to get air pollution data');
    const data = await this.findStationsPollution(dto);

    try {
      const list = [];

      for (const item of data) {
        const {
          station_name,
          sido_name,
          data_time,
          pm10_value,
          pm10_grade,
          pm25_value,
          pm25_grade,
          no2_value,
          no2_grade,
          o3_value,
          o3_grade,
          so2_value,
          so2_grade,
          co_value,
          co_grade,
          dm_x,
          dm_y,
        } = item;

        const lat = dm_x;
        const lng = dm_y;
        const { observatory } = await this.findOneObservatoryWeather(lat, lng); // 위도 경도에 따른 온습도 정보 가져와서 매핑해주기

        const newData = {
          location: [Number(dm_x), Number(dm_y)],
          station: station_name,
          addressTitle: sido_name,
          addressSub: item.addr.split(' ')[1],
          date: data_time,
          airData: {
            PM10: {
              data: Math.round(pm10_value).toString(),
              grade: pm10_grade,
            },
            PM25: {
              data: Math.round(pm25_value).toString(),
              grade: pm25_grade,
            },
            NO2: {
              data: no2_value,
              grade: no2_grade,
            },
            O3: {
              data: o3_value,
              grade: o3_grade,
            },
            SO2: {
              data: so2_value,
              grade: so2_grade,
            },
            CO: {
              data: co_value,
              grade: co_grade,
            },
            TP: observatory.weather.tamperature,
            HM: observatory.weather.humidity,
          },
        };
        // console.log(typeof dm_x);
        list.push(newData);
      }

      // console.log(list);
      this.logger.debug('get air pollution data successfully');
      return list;
    } catch (error) {
      this.logger.error('failed to get air pollution data.', error);
      throw error;
    }
  }

  async getAverage() {
    this.logger.debug('start to get average of city air pollution data');
    try {
      const cityAverages = await this.averageRepository.find();
      let data = [];

      for (const cityAverage of cityAverages) {
        for (const cityCode of cityAverage.cityCodes) {
          data.push({
            cityCode: cityCode,
            cityName: cityAverage.cityName,
            sidoName: cityAverage.sidoName,
            dataTime: cityAverage.dataTime,
            pollutantsAverage: {
              PM10: cityAverage.pm10Grade,
              PM25: cityAverage.pm25Grade,
              NO2: cityAverage.no2Grade,
              O3: cityAverage.o3Grade,
              CO: cityAverage.coGrade,
              SO2: cityAverage.so2Grade,
            },
          });
        }
      }
      this.logger.debug('get average of city air pollution data successfully');

      return data;
    } catch (e) {
      this.logger.error('failed to get average of city air pollution data');
      throw e;
    }
  }
}
