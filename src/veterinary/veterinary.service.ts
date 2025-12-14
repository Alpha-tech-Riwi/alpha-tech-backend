import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { MedicalRecord, MedicalRecordType, VaccinationStatus } from '../entities/medical-record.entity';
import { CacheService } from '../cache/cache.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class VeterinaryService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
    private cacheService: CacheService,
  ) {}

  async createMedicalRecord(recordData: {
    petId: string;
    type: MedicalRecordType;
    title: string;
    description?: string;
    veterinarianName?: string;
    clinicName?: string;
    recordDate: Date;
    nextDueDate?: Date;
    metadata?: any;
  }): Promise<MedicalRecord> {
    const record = this.medicalRecordRepository.create(recordData);
    const savedRecord = await this.medicalRecordRepository.save(record);
    
    // Invalidate cache
    await this.cacheService.del(`medical:${recordData.petId}`);
    
    return savedRecord;
  }

  async getPetMedicalHistory(petId: string): Promise<MedicalRecord[]> {
    const cacheKey = `medical:${petId}`;
    let records = await this.cacheService.get<MedicalRecord[]>(cacheKey);
    
    if (!records) {
      records = await this.medicalRecordRepository.find({
        where: { petId },
        order: { recordDate: 'DESC' }
      });
      
      await this.cacheService.set(cacheKey, records, 1800); // 30 minutes
    }
    
    return records;
  }

  async getUpcomingVaccinations(petId: string): Promise<MedicalRecord[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return this.medicalRecordRepository.find({
      where: {
        petId,
        type: MedicalRecordType.VACCINATION,
        status: VaccinationStatus.PENDING,
        nextDueDate: LessThan(thirtyDaysFromNow)
      },
      order: { nextDueDate: 'ASC' }
    });
  }

  async markVaccinationComplete(recordId: string): Promise<MedicalRecord> {
    const record = await this.medicalRecordRepository.findOne({
      where: { id: recordId }
    });
    
    if (!record) {
      throw new NotFoundException('Medical record not found');
    }
    
    record.status = VaccinationStatus.COMPLETED;
    const updatedRecord = await this.medicalRecordRepository.save(record);
    
    // Invalidate cache
    await this.cacheService.del(`medical:${record.petId}`);
    
    return updatedRecord;
  }

  async getHealthSummary(petId: string) {
    const records = await this.getPetMedicalHistory(petId);
    const upcoming = await this.getUpcomingVaccinations(petId);
    
    const lastCheckup = records.find(r => r.type === MedicalRecordType.CHECKUP);
    const vaccinations = records.filter(r => r.type === MedicalRecordType.VACCINATION);
    const completedVaccinations = vaccinations.filter(v => v.status === VaccinationStatus.COMPLETED);
    
    return {
      totalRecords: records.length,
      lastCheckup: lastCheckup?.recordDate || null,
      vaccinationsCompleted: completedVaccinations.length,
      upcomingVaccinations: upcoming.length,
      healthScore: this.calculateHealthScore(records, upcoming)
    };
  }

  private calculateHealthScore(records: MedicalRecord[], upcoming: MedicalRecord[]): number {
    let score = 100;
    
    // Deduct points for overdue vaccinations
    const overdue = upcoming.filter(u => u.nextDueDate < new Date());
    score -= overdue.length * 15;
    
    // Deduct points for no recent checkup
    const lastCheckup = records.find(r => r.type === MedicalRecordType.CHECKUP);
    if (!lastCheckup || this.daysSince(lastCheckup.recordDate) > 365) {
      score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private daysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Automated vaccination reminders
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkVaccinationReminders() {
    const overdueVaccinations = await this.medicalRecordRepository.find({
      where: {
        type: MedicalRecordType.VACCINATION,
        status: VaccinationStatus.PENDING,
        nextDueDate: LessThan(new Date())
      },
      relations: ['pet']
    });

    for (const vaccination of overdueVaccinations) {
      // Send notification (integrate with notification service)
      // console.log(`🩺 Vaccination overdue for pet ${vaccination.pet?.name}: ${vaccination.title}`);
    }
  }
}