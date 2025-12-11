import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorDataService } from './sensor-data.service';
import { SensorDataController } from './sensor-data.controller';
import { SensorData } from '../entities/sensor-data.entity';
import { PetsModule } from '../pets/pets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorData]),
    PetsModule
  ],
  providers: [SensorDataService],
  controllers: [SensorDataController],
})
export class SensorDataModule {}