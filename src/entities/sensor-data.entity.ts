import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from './pet.entity';

@Entity('sensor_data')
export class SensorData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  heartRate: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  temperature: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column('int', { nullable: true })
  activityLevel: number;

  @Column('int', { nullable: true })
  batteryLevel: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  ambientTemperature: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  humidity: number;

  @Column({ type: 'jsonb', nullable: true })
  rawData: any;

  @ManyToOne(() => Pet, pet => pet.sensorData)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @CreateDateColumn()
  timestamp: Date;
}