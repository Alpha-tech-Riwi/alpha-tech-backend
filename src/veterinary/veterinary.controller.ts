import { Controller, Get, Post, Put, Body, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VeterinaryService } from './veterinary.service';
import { MedicalRecordType } from '../entities/medical-record.entity';

@Controller('veterinary')
@UseGuards(JwtAuthGuard)
export class VeterinaryController {
  constructor(private veterinaryService: VeterinaryService) {}

  @Post('records')
  async createMedicalRecord(@Body() recordData: {
    petId: string;
    type: MedicalRecordType;
    title: string;
    description?: string;
    veterinarianName?: string;
    clinicName?: string;
    recordDate: string;
    nextDueDate?: string;
    cost?: number;
    metadata?: any;
  }) {
    const record = await this.veterinaryService.createMedicalRecord({
      ...recordData,
      recordDate: new Date(recordData.recordDate),
      nextDueDate: recordData.nextDueDate ? new Date(recordData.nextDueDate) : undefined
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Medical record created successfully',
      data: record
    };
  }

  @Get('pets/:petId/history')
  async getPetMedicalHistory(@Param('petId') petId: string) {
    const history = await this.veterinaryService.getPetMedicalHistory(petId);
    
    return {
      statusCode: HttpStatus.OK,
      data: history
    };
  }

  @Get('pets/:petId/vaccinations/upcoming')
  async getUpcomingVaccinations(@Param('petId') petId: string) {
    const vaccinations = await this.veterinaryService.getUpcomingVaccinations(petId);
    
    return {
      statusCode: HttpStatus.OK,
      data: vaccinations
    };
  }

  @Get('pets/:petId/health-summary')
  async getHealthSummary(@Param('petId') petId: string) {
    const summary = await this.veterinaryService.getHealthSummary(petId);
    
    return {
      statusCode: HttpStatus.OK,
      data: summary
    };
  }

  @Put('records/:recordId/complete')
  async markVaccinationComplete(@Param('recordId') recordId: string) {
    const record = await this.veterinaryService.markVaccinationComplete(recordId);
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Vaccination marked as completed',
      data: record
    };
  }
}