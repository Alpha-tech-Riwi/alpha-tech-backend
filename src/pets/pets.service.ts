import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from '../entities/pet.entity';
import { PetSighting } from '../entities/pet-sighting.entity';
import { CacheService } from '../cache/cache.service';
import axios from 'axios';


@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petRepository: Repository<Pet>,
    @InjectRepository(PetSighting)
    private petSightingRepository: Repository<PetSighting>,
    private cacheService: CacheService,
  ) {}

  async create(petData: {
    name: string;
    species: string;
    breed: string;
    age: number;
    weight: number;
    collarId: string;
    ownerId: string;
    description?: string;
    ownerPhone?: string;
  }) {
    // Crear mascota primero sin QR
    const pet = this.petRepository.create({
      ...petData,
      isPublicProfile: true
    });
    
    const savedPet = await this.petRepository.save(pet);
    
    // Generar QR basado en el ID real de la mascota (primeros 8 caracteres)
    const qrCode = `PET${savedPet.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`;
    
    // Actualizar con el QR
    await this.petRepository.update(savedPet.id, { qrCode });
    savedPet.qrCode = qrCode;
    
    // Registrar automáticamente el QR en el QR Service
    // console.log(`🔄 Intentando registrar QR automáticamente: ${qrCode} para ${savedPet.name}`);
    
    try {
      const qrData = {
        qrCode,
        petData: {
          petId: savedPet.id,
          petName: savedPet.name,
          ownerId: savedPet.ownerId,
          ownerName: 'Noah',
          ownerPhone: '+57 300 123 4567',
          ownerEmail: 'noah123@mail.com',
          petBreed: savedPet.breed,
          petColor: 'No especificado',
          emergencyContact: '+57 300 123 4567',
          isActive: true
        }
      };
      
      // console.log('📤 Enviando datos QR:', JSON.stringify(qrData, null, 2));
      
      const response = await axios.post('http://qr-service:3004/qr/register', qrData);
      
      // console.log(`✅ QR Code ${qrCode} registrado automáticamente para ${savedPet.name}`);
      // console.log('📥 Respuesta QR service:', response.data);
      
    } catch (error) {
      console.error('❌ Error registrando QR automáticamente:', error.message);
      if (error.response) {
        console.error('📄 Respuesta de error:', error.response.data);
      }
    }
    
    return savedPet;
  }

  async findByOwner(ownerId: string) {
    const cacheKey = this.cacheService.getUserPetsCacheKey(ownerId);
    let pets = await this.cacheService.get(cacheKey);
    
    if (!pets) {
      pets = await this.petRepository.find({
        where: { ownerId },
        relations: ['sensorData'],
        order: { createdAt: 'DESC' }
      });
      
      await this.cacheService.set(cacheKey, pets, 600); // 10 minutes
    }
    
    return pets;
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
    const cacheKey = this.cacheService.getLocationCacheKey(collarId);
    let locationData = await this.cacheService.get(cacheKey);
    
    if (!locationData) {
      try {
        const response = await axios.get(`http://host.docker.internal:3002/location/collar/${collarId}/current`);
        locationData = response.data;
        
        // Cache for 30 seconds (location data changes frequently)
        await this.cacheService.set(cacheKey, locationData, 30);
        
        // console.log('Location response:', locationData);
      } catch (error) {
        return null;
      }
    }
    
    return locationData;
  }

  async getLocationHistory(collarId: string, limit = 10) {
    try {
      const response = await axios.get(`http://host.docker.internal:3002/location/collar/${collarId}/history?limit=${limit}`);
      return response.data;
    } catch (error) {
      return [];
    }
  }

  async getNotifications(ownerId: string, limit = 20) {
    try {
      // console.log('Fetching notifications for owner:', ownerId);
      const response = await axios.get(`http://notification-service:3003/notifications/owner/${ownerId}?limit=${limit}`);
      // console.log('Notifications response:', response.data);
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

  // Métodos para QR y mascotas perdidas
  async getPublicPetProfile(qrCode: string) {
    const pet = await this.petRepository.findOne({
      where: { qrCode, isPublicProfile: true },
      relations: ['owner'],
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        age: true,
        weight: true,
        profileImage: true,
        description: true,
        ownerPhone: true,
        qrCode: true,
        owner: {
          firstName: true,
          lastName: true,
          email: true
        }
      }
    });

    if (!pet) {
      throw new HttpException('Mascota no encontrada', HttpStatus.NOT_FOUND);
    }

    return pet;
  }

  async reportFoundPet(qrCode: string, reportData: {
    finderName?: string;
    finderPhone?: string;
    finderEmail?: string;
    latitude?: number;
    longitude?: number;
    message?: string;
    photo?: string;
  }) {
    const pet = await this.petRepository.findOne({
      where: { qrCode },
      relations: ['owner']
    });

    if (!pet) {
      throw new HttpException('Mascota no encontrada', HttpStatus.NOT_FOUND);
    }

    // Crear reporte de avistamiento
    const sighting = this.petSightingRepository.create({
      petId: pet.id,
      ...reportData
    });
    
    const savedSighting = await this.petSightingRepository.save(sighting);

    // Enviar notificación al dueño
    try {
      await axios.post('http://notification-service:3003/notifications', {
        type: 'PET_FOUND',
        title: '¡Tu mascota fue encontrada!',
        message: `Alguien reportó haber encontrado a ${pet.name}. ${reportData.message || ''}`,
        priority: 'HIGH',
        ownerId: pet.ownerId,
        petId: pet.id,
        petName: pet.name,
        metadata: {
          sightingId: savedSighting.id,
          finderPhone: reportData.finderPhone,
          finderEmail: reportData.finderEmail,
          location: reportData.latitude && reportData.longitude ? 
            `${reportData.latitude}, ${reportData.longitude}` : null
        }
      });
    } catch (error) {
      console.error('Error sending found pet notification:', error);
    }

    return savedSighting;
  }

  async getPetSightings(petId: string) {
    return this.petSightingRepository.find({
      where: { petId },
      order: { createdAt: 'DESC' }
    });
  }

  async generateQRCode(petId: string) {
    const pet = await this.findOne(petId);
    if (!pet) {
      throw new HttpException('Mascota no encontrada', HttpStatus.NOT_FOUND);
    }

    if (!pet.qrCode) {
      const qrCode = `PET${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      await this.petRepository.update(petId, { qrCode });
      return { qrCode, url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/found/${qrCode}` };
    }

    return { qrCode: pet.qrCode, url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/found/${pet.qrCode}` };
  }
}