import { Test, TestingModule } from '@nestjs/testing';
import { MapService } from './map.service';
import { EntityManager, Repository } from 'typeorm';
import { Average } from './entities/average.entity';
import { Observatory } from './entities/observatory.entity';
import { Logger } from 'winston';
import ProximateObservatoryToFindDto from './dto/proximateobservatory-to-find.dto';
import ProximateObservDto from './dto/proximateobserv.dto';
import { LocationInfoDto } from './dto/locationInfo.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('MapService', () => {
  let mapService: MapService;
  let averageRepository: Repository<Average>;
  let observatoryRepository: Repository<Observatory>;
  let entityManager: EntityManager;
  let logger: Logger;

  const mockAverageRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockObservatoryRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockEntityManager = {
    query: jest.fn(),
  };

  const mockLogger = {
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapService,
        {
          provide: 'AverageRepository',
          useValue: mockAverageRepository,
        },
        {
          provide: 'ObservatoryRepository',
          useValue: mockObservatoryRepository,
        },
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    mapService = module.get<MapService>(MapService);
    averageRepository = module.get<Repository<Average>>('AverageRepository');
    observatoryRepository = module.get<Repository<Observatory>>(
      'ObservatoryRepository'
    );
    entityManager = module.get<EntityManager>(EntityManager);
    logger = module.get(WINSTON_MODULE_NEST_PROVIDER);
  });

  it('should fix type to number', async () => {
    const data = 0.12345678;
    const value = Number(data.toFixed(8));
    const result = await mapService.fixTypeToNumber(data);
    expect(result).toEqual(value);
  });

  it('should be km to Latitude Radian', async () => {
    const distance = 30;
    const earthRadius = 6371;
    const value = await mapService.fixTypeToNumber(
      (distance / earthRadius) * (180 / Math.PI)
    );
    const result = await mapService.kmToLatRadian(distance);
    expect(result).toEqual(value);
  });

  it('should be km to Longitude Radian', async () => {
    const lat = 33.123456;
    const distance = 30;
    const earthRadius = 6371;
    const latRad = lat * (Math.PI / 180);
    const kmPerDegree = earthRadius * Math.cos(latRad) * ((2 * Math.PI) / 360);
    const radian = mapService.fixTypeToNumber(distance / kmPerDegree);
    const result = mapService.kmToLngRadian(lat, distance);
    expect(result).toEqual(radian);
  });

  it('should calculated Latitude Range', async () => {
    const lat = 23.12341234;
    const distance = 30;
    const latRad = await mapService.kmToLatRadian(distance);
    const minLat = await mapService.fixTypeToNumber(lat - latRad);
    const maxLat = await mapService.fixTypeToNumber(lat + latRad);
    const result = await mapService.calculateLatRange(lat, distance);
    expect(result).toEqual({ minLat, maxLat });
  });

  it('should calculated Longitude Range', async () => {
    const lat = 23.12341234;
    const lng = 124.12341234;
    const distance = 30;
    const lngRad = await mapService.kmToLngRadian(lat, distance);
    const minLng = await mapService.fixTypeToNumber(lng - lngRad);
    const maxLng = await mapService.fixTypeToNumber(lng + lngRad);
    const result = await mapService.calculateLngRange(lat, lng, distance);
    expect(result).toEqual({ minLng, maxLng });
  });

  it('should get range of location', async () => {
    const minLat = 1234;
    const maxLat = 1234;
    const minLng = 1234;
    const maxLng = 1234;
    const value = await mockObservatoryRepository
      .createQueryBuilder('observatory')
      .leftJoinAndSelect('observatory.weather', 'weather')
      .where('observatory.lat BETWEEN :minLat AND :maxLat', { minLat, maxLat })
      .andWhere('observatory.lng BETWEEN :minLng and :maxLng', {
        minLng,
        maxLng,
      })
      .getMany();
    const result = await mapService.findNearbyObservatoryWeather(
      minLat,
      maxLat,
      minLng,
      maxLng
    );
    expect(result).toEqual(value);
  });

  it('should calculate haversine Distance', async () => {
    const latitudeFrom = 1234;
    const longitudeFrom = 1234;
    const latitudeTo = 1234;
    const longitudeTo = 1234;

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
    const value = angle * earthRadius;
    const result = await mapService.haversineGreatCircleDistance(
      latitudeFrom,
      longitudeFrom,
      latitudeTo,
      longitudeTo
    );
    expect(result).toEqual(value);
  });

  it('should find Proximate Observatory', async () => {
    let dto: ProximateObservatoryToFindDto = {
      lat: 24.123,
      lng: 125.1234,
      observatories: [
        {
          id: 5,
          name: '성남 관측소',
        },
        {
          id: 6,
          name: '하남 관측소',
        },
      ] as Observatory[],
    };
    const { lat, lng, observatories } = dto;
    let list: ProximateObservDto[] = [];

    for (const observatory of observatories) {
      const latTo = observatory.lat;
      const lngTo = observatory.lng;
      const latFrom = lat;
      const lngFrom = lng;
      const gap = await mapService.haversineGreatCircleDistance(
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
    const value = list[0];
    const result = await mapService.findProximateObservatory(dto);
    expect(result).toEqual(value);
  });

  it('should find one Observatory and Weather', async () => {
    const lat = 1234;
    const lng = 1234;
    const distance = 50; // km
    const { minLat, maxLat, minLng, maxLng } =
      await mapService.getRangeOfLocation(lat, lng, distance);
    const observatories = await mapService.findNearbyObservatoryWeather(
      minLat,
      maxLat,
      minLng,
      maxLng
    );
    const value = await mapService.findProximateObservatory({
      lat,
      lng,
      observatories,
    });
    const result = mapService.findOneObservatoryWeather(lat, lng);
    expect(result).toEqual(value);
  });

  it('should find stations pollution', async () => {
    let dto: LocationInfoDto;
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
    const value = await mockEntityManager.query(rawQuery, parameters);
    const result = await mapService.findStationsPollution(dto);
    expect(result).toEqual(value);
  });

  it('should get pollution information', async () => {
    let dto: LocationInfoDto;
    const items = await mapService.findStationsPollution(dto);
    let list = [];
    for (const item of items) {
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
      const { observatory } = await mapService.findOneObservatoryWeather(
        dm_x,
        dm_y
      );
      const newItem = {
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
      list.push(newItem);
    }
    const value = list;
    const result = mapService.getPollutionInformation(dto);
    expect(result).toEqual(value);
  });

  it('should get average', async () => {
    const cityAverages = mockAverageRepository.find();
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

    const value = data;
    const result = mapService.getAverage();
    expect(result).toEqual(value);
  });
});
