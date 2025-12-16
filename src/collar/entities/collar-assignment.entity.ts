import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('collar_assignments')
@Index(['collarId'], { unique: true })
export class CollarAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'collar_id', length: 50 })
  collarId: string;

  @Column({ name: 'pet_id', type: 'uuid' })
  petId: string;

  @Column({ name: 'assigned_by', type: 'uuid' })
  assignedBy: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}