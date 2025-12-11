import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Pet } from './pet.entity';

export enum UserRole {
  USER = 'user',
  VETERINARIAN = 'veterinarian',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  veterinaryLicense: string;

  @Column({ nullable: true })
  specialization: string;

  @OneToMany(() => Pet, pet => pet.owner)
  pets: Pet[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}