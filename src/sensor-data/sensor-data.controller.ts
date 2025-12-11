import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SensorDataService } from './sensor-data.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sensor-data')
export class SensorDataController {
  constructor(private sensorDataService: SensorDataService) {}

  // Endpoint público para ESP32
  @Post('collar/:collarId')
  async receiveSensorData(
    @Param('collarId') collarId: string,
    @Body() sensorData: {
      heartRate?: number;
      temperature?: number;
      latitude?: number;
      longitude?: number;
      activityLevel?: number;
      batteryLevel?: number;
      ambientTemperature?: number;
      humidity?: number;
      rawData?: any;
    }
  ) {
    return this.sensorDataService.create(collarId, sensorData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pet/:petId')
  async getPetSensorData(
    @Param('petId') petId: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 100;
    return this.sensorDataService.findByPet(petId, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pet/:petId/latest')
  async getLatestData(@Param('petId') petId: string) {
    return this.sensorDataService.getLatestByPet(petId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pet/:petId/stats')
  async getHealthStats(
    @Param('petId') petId: string,
    @Query('hours') hours?: string
  ) {
    const hoursNum = hours ? parseInt(hours) : 24;
    return this.sensorDataService.getHealthStats(petId, hoursNum);
  }
}