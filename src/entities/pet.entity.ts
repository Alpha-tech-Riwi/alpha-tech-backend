import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { SensorData } from './sensor-data.entity';

@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  species: string;

  @Column()
  breed: string;

  @Column()
  age: number;

  @Column('decimal', { precision: 5, scale: 2 })
  weight: number;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ unique: true })
  collarId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ unique: true, nullable: true })
  qrCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  ownerPhone: string;

  @Column({ default: true })
  isPublicProfile: boolean;

  @ManyToOne(() => User, user => user.pets)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => SensorData, sensorData => sensorData.pet)
  sensorData: SensorData[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}