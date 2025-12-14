import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Pet } from './pet.entity';

export enum MedicalRecordType {
  VACCINATION = 'vaccination',
  CHECKUP = 'checkup',
  TREATMENT = 'treatment',
  SURGERY = 'surgery',
  EMERGENCY = 'emergency',
  MEDICATION = 'medication'
}

export enum VaccinationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

@Entity('medical_records')
@Index(['petId', 'type'])
@Index(['nextDueDate'])
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  petId: string;

  @Column({
    type: 'enum',
    enum: MedicalRecordType
  })
  type: MedicalRecordType;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  veterinarianName: string;

  @Column({ nullable: true })
  clinicName: string;

  @Column('timestamp')
  recordDate: Date;

  @Column('timestamp', { nullable: true })
  nextDueDate: Date;

  @Column({
    type: 'enum',
    enum: VaccinationStatus,
    default: VaccinationStatus.PENDING
  })
  status: VaccinationStatus;

  @Column('jsonb', { nullable: true })
  metadata: any; // Store additional data like dosage, batch number, etc.

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  cost: number;

  @Column({ nullable: true })
  attachmentUrl: string; // For storing medical documents/images

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Pet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'petId' })
  pet: Pet;
}