import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Pollutions } from './entities/pollutions.entity';
import { ConfigService } from '@nestjs/config';
import { Stations } from './entities/stations.entity';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as cron from 'node-cron';
import { LocationInfoDto } from './dto/locationInfo.dto';
import moment from 'moment';
import { Average } from './entities/average.entity';
import GradeThresholds from './type/grade-thresholds.interface';
import { gradeThresholds } from './type/grade-thresholds.type';
import { sidoName } from './type/sido-name.type';
import { City } from './entities/city.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(Pollutions)
    private readonly pollutionsRepository: Repository<Pollutions>,
    @InjectRepository(Stations)
    private readonly stationsRepository: Repository<Stations>,
    @InjectRepository(Average)
    private readonly averageRepository: Repository<Average>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger
  ) {
    cron.schedule('*/30 * * * *', () => {
      this.saveAverage();
    });
    cron.schedule('*/10 * * * *', () => {
      this.checkPollutionInformation();
    });
    cron.schedule('0 2 * * *', () => {
      this.saveStations();
    });
    cron.schedule('0 1 1 * *', () => {
      this.saveDataToFile();
    });
  }

  hasNullValues(obj: Record<string, any>): boolean {
    for (const key in obj) {
      if (
        obj[key] === null ||
        obj[key] === undefined ||
        obj[key] === '' ||
        obj[key] === '-' ||
        obj[key] === '통신장애'
      ) {
        return true;
      }
    }
    return false;
  }

  async fetchPollutionData() {
    this.logger.debug('start to fetch air pollution data');

    const serviceKey = this.configService.get('SERVICE_KEY');
    const returnType = 'json';
    const numOfRows = 661;
    const pageNo = 1;
    const sidoName = '전국';
    const ver = '1.0';
    const url = `http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?sidoName=${sidoName}&pageNo=${pageNo}&numOfRows=${numOfRows}&returnType=${returnType}&serviceKey=${serviceKey}&ver=${ver}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to fetch pollution data. api was not working.');
    }
  }

  async findStationWithPollution(stationName: string) {
    return await this.stationsRepository.findOne({
      where: { stationName },
      relations: {
        pollution: true,
      },
    });
  }

  async findStation(stationName: string) {
    return await this.stationsRepository.findOne({
      where: { stationName: stationName },
      select: ['id', 'stationName'],
    });
  }

  async savePollutionData(data) {
    this.logger.debug('start save pollution data.');
    try {
      const {
        dataTime,
        sidoName,
        stationName,
        pm10Value,
        pm10Grade,
        pm25Value,
        pm25Grade,
        no2Value,
        no2Grade,
        o3Value,
        o3Grade,
        so2Value,
        so2Grade,
        coValue,
        coGrade,
      } = data;

      const foundStation = await this.findStationWithPollution(stationName);

      this.logger.debug(
        `찾은 측정소: ${foundStation.id} : ${foundStation.stationName}`
      );

      if (!foundStation) {
        this.logger.debug(`등록된 ${stationName} 측정소가 없습니다.`);
        return;
      } else if (foundStation) {
        if (!foundStation.pollution) {
          this.logger.debug(
            `새로운 ${foundStation.stationName} 측정소의 측정값을 추가합니다.`
          );

          await this.pollutionsRepository.save({
            stationId: foundStation.id,
            dataTime,
            sidoName,
            stationName,
            pm10Value,
            pm10Grade,
            pm25Value,
            pm25Grade,
            no2Value,
            no2Grade,
            o3Value,
            o3Grade,
            so2Value,
            so2Grade,
            coValue,
            coGrade,
          });
        } else {
          this.logger.debug(
            `${foundStation.stationName} 측정소의 측정값을 업데이트 합니다.`
          );

          await this.pollutionsRepository.update(foundStation.pollution.id, {
            dataTime,
            pm10Value,
            pm10Grade,
            pm25Value,
            pm25Grade,
            no2Value,
            no2Grade,
            o3Value,
            o3Grade,
            so2Value,
            so2Grade,
            coValue,
            coGrade,
          });
        }
      }

      return;
    } catch (e) {
      this.logger.error('failed to save pollution data');
      this.logger.verbose(e);
      throw e;
    }
  }

  async checkPollutionInformation() {
    this.logger.debug('start to fetch air pollution data');
    try {
      const data = await this.fetchPollutionData();
      for (const item of data.response.body.items) {
        this.logger.verbose(item);
        const {
          dataTime,
          sidoName,
          stationName,
          pm10Value,
          pm25Value,
          no2Value,
          o3Value,
          so2Value,
          coValue,
        } = item;
        const checkList = {
          dataTime,
          sidoName,
          stationName,
          pm10Value,
          pm25Value,
          no2Value,
          o3Value,
          so2Value,
          coValue,
        };

        if (this.hasNullValues(checkList)) continue;

        const pm10Grade = await this.saveGrade('pm10', pm10Value);
        const pm25Grade = await this.saveGrade('pm25', pm25Value);
        const no2Grade = await this.saveGrade('no2', no2Value);
        const o3Grade = await this.saveGrade('o3', o3Value);
        const coGrade = await this.saveGrade('co', coValue);
        const so2Grade = await this.saveGrade('so2', so2Value);

        const newData = {
          dataTime,
          sidoName,
          stationName,
          pm10Value,
          pm10Grade,
          pm25Value,
          pm25Grade,
          no2Value,
          no2Grade,
          o3Value,
          o3Grade,
          so2Value,
          so2Grade,
          coValue,
          coGrade,
        };
        await this.savePollutionData(newData);
        this.logger.debug('fetch and save pollution informations successfully');
      }
    } catch (e) {
      this.logger.error(`Faild to fetch pollution data`);
      this.logger.verbose(e);
    }
  }

  async saveDataToFile() {
    this.logger.debug('start to fetch air pollution data');
    try {
      const data = await this.fetchPollutionData();
      const fileName = moment().format('YYYY-MM-DD HH:mm:ss');
      const filePath = path.join(
        process.cwd(),
        'air_condition',
        `${fileName}.json`
      );
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf8');
      this.logger.debug('save air condition data to file');
    } catch (error) {
      this.logger.error('failed to save air pollution datas to file', error);
    }
  }

  async fetchStationData() {
    this.logger.debug('start to fetch station informations');
    const pageNo = 1;
    const numOfRows = 1000;
    const returnType = 'json';
    const serviceKey = this.configService.get('SERVICE_KEY');
    const url = `http://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getMsrstnList?&pageNo=${pageNo}&numOfRows=${numOfRows}&serviceKey=${serviceKey}&returnType=${returnType}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new BadRequestException('응답 없음');
    }
  }

  async saveStations() {
    this.logger.debug('start to save station informations');
    try {
      const data = await this.fetchStationData();
      this.logger.debug(data);

      for (const item of data.response.body.items) {
        this.logger.verbose('station: ', item);

        const foundStation = await this.findStation(item.stationName);

        if (!foundStation) {
          await this.stationsRepository.save({ ...item });
          this.logger.debug(`새로운 ${item.stationName}을 업로드합니다.`);
        } else {
          this.logger.debug(`${item.stationName}이 이미 존재합니다.`);
          return;
        }
      }
    } catch (e) {
      this.logger.error('측정소 정보를 업데이트 할 수 없습니다.');
      throw e;
    }
  }

  async fetchAverage(sidoName: string) {
    this.logger.debug(`sido name: ${sidoName}`);
    const serviceKey = this.configService.get('SERVICE_KEY');
    const returnType = 'json';
    const url = `https://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst?serviceKey=${serviceKey}&returnType=${returnType}&numOfRows=100&pageNo=1&sidoName=${sidoName}&searchCondition=HOUR`;
    const response = await fetch(url);

    if (response.ok) {
      console.log(response, url);

      const data = response.json();
      this.logger.verbose(data);
      return data;
    } else {
      this.logger.debug('응답 없음');
      return;
    }
  }

  async findCityInGuName(sidoName, guName) {
    const data = await this.cityRepository.find({
      where: [{ sidoName, guName }],
      select: { code: true },
    });

    if (data[0]) {
      return data;
    } else {
      return;
    }
  }

  async findCityInGunName(sidoName: string, gunName: string) {
    const data = await this.cityRepository.find({
      where: [{ sidoName, gunName }],
    });

    if (data[0]) {
      return data;
    } else {
      return;
    }
  }

  async saveAverageInfo(
    item: object,
    cityCodes: number[],
    pm10Grade: string,
    pm25Grade: string,
    no2Grade: string,
    o3Grade: string,
    coGrade: string,
    so2Grade: string
  ) {
    const data = await this.averageRepository.save({
      ...item,
      cityCodes,
      pm10Grade,
      pm25Grade,
      no2Grade,
      o3Grade,
      coGrade,
      so2Grade,
    });

    if (data) {
      return data;
    } else {
      return;
    }
  }

  async saveAverage() {
    this.logger.debug('start to save average of city air pollution');
    try {
      for (let i = 0; i < sidoName.length; i++) {
        setTimeout(async () => {
          const data = await this.fetchAverage(sidoName[i]);
          for (const item of data.response.body.items) {
            const {
              dataTime,
              sidoName,
              cityName,
              pm10Value,
              pm25Value,
              no2Value,
              o3Value,
              so2Value,
              coValue,
            } = item;
            const checkList = {
              dataTime,
              sidoName,
              cityName,
              pm10Value,
              pm25Value,
              no2Value,
              o3Value,
              so2Value,
              coValue,
            };

            const hasNull = this.hasNullValues(checkList);

            if (hasNull) continue;

            const pm10Grade = await this.saveGrade('pm10', item.pm10Value);
            const pm25Grade = await this.saveGrade('pm25', item.pm25Value);
            const no2Grade = await this.saveGrade('no2', item.no2Value);
            const o3Grade = await this.saveGrade('o3', item.o3Value);
            const coGrade = await this.saveGrade('co', item.coValue);
            const so2Grade = await this.saveGrade('so2', item.so2Value);

            let cities = await this.findCityInGuName(sidoName, cityName);
            console.log(cities);

            if (!cities) {
              cities = await this.findCityInGunName(sidoName, cityName);
              console.log(cities);
            }
            if (!cities) {
              this.logger.verbose(
                `해당 city ${sidoName} ${cityName}를 table 에서 찾을 수 없습니다.`
              );
              continue;
            }
            const codes = cities.map((city) => Number(city.code));
            this.logger.verbose(`codes: ${codes}`);

            const data = await this.saveAverageInfo(
              item,
              codes,
              pm10Grade,
              pm25Grade,
              no2Grade,
              o3Grade,
              coGrade,
              so2Grade
            );

            if (!data) {
              this.logger.error('평균값 데이터를 저장할 수 없습니다.');
              continue;
            }

            console.log(data);
          }
        }, i * 5000); // 5초 간격으로 실행
      }
    } catch (error) {
      this.logger.error(`failed to save average of city air pollution.`);
      this.logger.error(error);
    }
  }

  async saveGrade(type: keyof GradeThresholds, value: number) {
    const thresholds = gradeThresholds[type];

    for (const grade in thresholds) {
      const { min, max } = thresholds[grade];
      if (value >= min && value <= max) {
        return grade;
      }
    }

    return '등급 없음';
  }

  async getPollutionInformation(dto: LocationInfoDto) {
    this.logger.debug('start to get air pollution data');
    const { minLat, maxLat, minLng, maxLng } = dto;

    try {
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
      const data = await this.entityManager.query(rawQuery, parameters);

      this.logger.debug('get air pollution data successfully');
      return data;
    } catch (e) {
      this.logger.error('failed to get air pollution data.', { e });
      throw e;
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
            pm10Grade: cityAverage.pm10Grade,
            pm25Grade: cityAverage.pm25Grade,
            no2Grade: cityAverage.no2Grade,
            o3Grade: cityAverage.o3Grade,
            coGrade: cityAverage.coGrade,
            so2Grade: cityAverage.so2Grade,
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
