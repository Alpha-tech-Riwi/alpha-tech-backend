import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Cache patterns for common operations
  getPetCacheKey(petId: string): string {
    return `pet:${petId}`;
  }

  getLocationCacheKey(collarId: string): string {
    return `location:${collarId}`;
  }

  getNotificationsCacheKey(ownerId: string): string {
    return `notifications:${ownerId}`;
  }

  getUserPetsCacheKey(ownerId: string): string {
    return `user:${ownerId}:pets`;
  }
}