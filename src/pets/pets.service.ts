import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';
import axios from 'axios';

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

  // Microservices integration
  async getLocationData(collarId: string) {
    try {
      const response = await axios.get(`http://location-service:3002/location/collar/${collarId}/current`);
      console.log('Location response:', response.data);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getLocationHistory(collarId: string, limit = 10) {
    try {
      const response = await axios.get(`http://location-service:3002/location/collar/${collarId}/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      return [];
    }
  }

  async getNotifications(ownerId: string, limit = 20) {
    try {
      console.log('Fetching notifications for owner:', ownerId);
      const response = await axios.get(`http://notification-service:3003/notifications/owner/${ownerId}?limit=${limit}`);
      console.log('Notifications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Notifications error:', error.message);
      return [];
    }
  }

  async getUnreadNotificationsCount(ownerId: string) {
    try {
      const response = await axios.get(`http://notification-service:3003/notifications/owner/${ownerId}/unread-count`);
      return response.data;
    } catch (error) {
      return { count: 0 };
    }
  }
}