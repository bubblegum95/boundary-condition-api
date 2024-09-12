import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as iconv from 'iconv-lite';
import Weather from './entities/weather.entity';
import { Observatory } from './entities/observatory.entity';
import { Repository } from 'typeorm';
import ObservatoryToCreateDto from './dto/observatory-to-create.dto';
import WeatherToCreateDto from './dto/weather-to-create.dto';
import WeatherToUpdateDto from './dto/weather-to-update.dto';
import ObservatoryToUpdateDto from './dto/observatory-to-update.dto';
import * as cron from 'node-cron';

@Injectable()
export class WeatherService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
    @InjectRepository(Observatory)
    private readonly observatoryRepository: Repository<Observatory>
  ) {
    // cron.schedule('0 3 * * *', () => {
    //   this.fetchObservatory();
    // });
    // cron.schedule('0/10 * * * *', () => {
    //   this.fetchWeather();
    // });
  }

  async saveObservatory(dto: ObservatoryToCreateDto) {
    const { num, name, lat, lng } = dto;
    const data = await this.observatoryRepository.save({
      num,
      name,
      lat,
      lng,
    });
  }

  async updateObservatory(dto: ObservatoryToUpdateDto) {
    const { id, num, name, lat, lng } = dto;
    const data = await this.observatoryRepository.update(id, {
      num,
      name,
      lat,
      lng,
    });
  }

  async findObservatory(num: number) {
    const data = await this.observatoryRepository.findOne({
      where: { num },
      select: { id: true },
      relations: { weather: true },
    });

    return data;
  }

  async saveWeather(dto: WeatherToCreateDto) {
    const { observatoryId, tamperature, humidity, measuredAt } = dto;
    const data = await this.weatherRepository.save({
      observatoryId,
      tamperature,
      humidity,
      measuredAt,
    });
  }

  async updateWeather(dto: WeatherToUpdateDto) {
    const { observatoryId, tamperature, humidity, measuredAt } = dto;
    const data = await this.weatherRepository.update(observatoryId, {
      tamperature,
      humidity,
      measuredAt,
    });
  }

  async fetchWeather() {
    const AUTH_KEY = this.configService.get('AUTH_KEY');
    const url = `https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php?authKey=${AUTH_KEY}`;

    const response = await fetch(url);

    if (response.ok) {
      const txtdata = await response.text();
      const data = txtdata.split('\n').slice(4, -2);

      for (const row of data) {
        const fields = row.split(/\s+/);
        const num = Number(fields[1]);
        const foundOb = await this.findObservatory(num);

        if (foundOb) {
          if (!foundOb.weather) {
            const item = {
              measuredAt: fields[0],
              observatoryId: foundOb.id,
              tamperature: Number(fields[11]),
              humidity: Number(fields[13]),
            };
            await this.saveWeather(item);
          } else {
            const item = {
              observatoryId: foundOb.id,
              num,
              tamperature: Number(fields[11]),
              humidity: Number(fields[13]),
              measuredAt: fields[0],
            };
            await this.updateWeather(item);
          }
        } else {
          console.log('등록된 관측소가 없습니다.');
          continue;
        }
      }
    } else {
      throw new Error('응답없음');
    }
  }

  async fetchObservatory() {
    try {
      const AUTH_KEY = this.configService.get('AUTH_KEY');
      console.log(AUTH_KEY);
      const url = `https://apihub.kma.go.kr/api/typ01/url/stn_inf.php?inf=SFC&authKey=${AUTH_KEY}`;
      const response = await fetch(url);

      if (response.ok) {
        const ArrBuf = await response.arrayBuffer();
        const data = Buffer.from(ArrBuf);
        const decoded = iconv.decode(data, 'EUC-KR').split('\n').slice(4, -2);

        for (const row of decoded) {
          const fields = row.replace(/\'/g, '').trim().split(/\s+/);
          const num = Number(fields[0]);
          const foundOb = await this.findObservatory(num);

          if (!foundOb) {
            const dto = {
              num,
              name: fields[10],
              lat: Number(fields[2]),
              lng: Number(fields[1]),
            };

            await this.saveObservatory(dto);
          } else {
            const dto = {
              id: foundOb.id,
              num,
              name: fields[10],
              lat: Number(fields[2]),
              lng: Number(fields[1]),
            };
            await this.updateObservatory(dto);
          }
        }
      } else {
        throw new Error('응답없음');
      }
    } catch (error) {
      console.log(error);
    }
  }
}
