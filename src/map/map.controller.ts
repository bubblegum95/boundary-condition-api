import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { MapService } from './map.service';
import { LocationInfoDto } from './dto/locationInfo.dto';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @ApiConsumes('application/json')
  @ApiOperation({
    summary: '대기질 측정 정보 조회',
    description: '측정소별 대기질 측정 정보 조회',
  })
  @Get('pollution')
  async getPollutionInfo(@Res() res: Response, @Query() dto: LocationInfoDto) {
    try {
      console.log('dto: ', dto);
      const data = await this.mapService.getPollutionInformation(dto);
      return res.status(HttpStatus.OK).json({
        message: '대기질 정보를 조회합니다.',
        data: data,
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: e.message });
    }
  }

  @ApiConsumes('application/json')
  @ApiOperation({
    summary: '대기질 측정 정보 조회',
    description: '시군구별 대기질 측정 평균값 정보 조회',
  })
  @Get('average')
  async getAverage(@Res() res: Response) {
    try {
      const data = await this.mapService.getAverage();

      return res.status(HttpStatus.OK).json({
        message: '시군구별 대기질 측정 평균값을 조회합니다.',
        data: data,
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: e.message,
      });
    }
  }
}
