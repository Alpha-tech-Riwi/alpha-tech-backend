import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorData } from '../entities/sensor-data.entity';
import { PetsService } from '../pets/pets.service';

@Injectable()
export class SensorDataService {
  constructor(
    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>,
    private petsService: PetsService,
  ) {}

  async create(collarId: string, sensorData: {
    heartRate?: number;
    temperature?: number;
    latitude?: number;
    longitude?: number;
    activityLevel?: number;
    batteryLevel?: number;
    ambientTemperature?: number;
    humidity?: number;
    rawData?: any;
  }) {
    const pet = await this.petsService.findByCollarId(collarId);
    if (!pet) {
      throw new Error('Collar no encontrado');
    }

    const data = this.sensorDataRepository.create({
      ...sensorData,
      petId: pet.id,
    });

    return this.sensorDataRepository.save(data);
  }

  async findByPet(petId: string, limit: number = 100) {
    return this.sensorDataRepository.find({
      where: { petId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getLatestByPet(petId: string) {
    return this.sensorDataRepository.findOne({
      where: { petId },
      order: { timestamp: 'DESC' },
    });
  }

  async getHealthStats(petId: string, hours: number = 24) {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.sensorDataRepository
      .createQueryBuilder('sensor_data')
      .select([
        'AVG(sensor_data.heartRate) as avgHeartRate',
        'AVG(sensor_data.temperature) as avgTemperature',
        'AVG(sensor_data.activityLevel) as avgActivity',
        'COUNT(*) as dataPoints'
      ])
      .where('sensor_data.petId = :petId', { petId })
      .andWhere('sensor_data.timestamp >= :since', { since })
      .getRawOne();
  }
}