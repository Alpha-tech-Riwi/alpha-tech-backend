import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { VeterinaryController } from './veterinary.controller';
import { VeterinaryService } from './veterinary.service';
import { MedicalRecord } from '../entities/medical-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord]),
    ScheduleModule.forRoot()
  ],
  controllers: [VeterinaryController],
  providers: [VeterinaryService],
  exports: [VeterinaryService]
})
export class VeterinaryModule {}