import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pet } from './pet.entity';

@Entity('pet_sightings')
export class PetSighting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  @Column()
  petId: string;

  @Column({ nullable: true })
  finderName: string;

  @Column({ nullable: true })
  finderPhone: string;

  @Column({ nullable: true })
  finderEmail: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ default: false })
  isResolved: boolean;

  @CreateDateColumn()
  createdAt: Date;
}