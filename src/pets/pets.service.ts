import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
  ) {}

  async create(petData: {
    name: string;
    species: string;
    breed: string;
    age: number;
    weight: number;
    collarId: string;
    ownerId: string;
  }) {
    const pet = this.petRepository.create(petData);
    return this.petRepository.save(pet);
  }

  async findByOwner(ownerId: string) {
    return this.petRepository.find({
      where: { ownerId },
      relations: ['sensorData'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    return this.petRepository.findOne({
      where: { id },
      relations: ['owner', 'sensorData']
    });
  }

  async update(id: string, updateData: Partial<Pet>) {
    await this.petRepository.update(id, updateData);
    return this.findOne(id);
  }

  async findByCollarId(collarId: string) {
    return this.petRepository.findOne({
      where: { collarId },
      relations: ['owner']
    });
  }
}