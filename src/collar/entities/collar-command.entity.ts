import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum CollarCommandType {
  FIND_PET = 'FIND_PET',
  EMERGENCY_ALERT = 'EMERGENCY_ALERT',
  HEALTH_CHECK = 'HEALTH_CHECK'
}

export enum CollarCommandStatus {
  PENDING = 'PENDING',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  EXPIRED = 'EXPIRED'
}

@Entity('collar_commands')
@Index(['petId', 'status'])
export class CollarCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pet_id', type: 'uuid' })
  petId: string;

  @Column({ 
    type: 'enum', 
    enum: CollarCommandType,
    name: 'command_type'
  })
  commandType: CollarCommandType;

  @Column({ 
    type: 'enum', 
    enum: CollarCommandStatus,
    default: CollarCommandStatus.PENDING
  })
  status: CollarCommandStatus;

  @Column({ name: 'issued_by', type: 'uuid' })
  issuedBy: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'acknowledged_at', type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}