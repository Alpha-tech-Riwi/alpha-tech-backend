import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetsService } from './pets.service';
import { PetsController, PublicPetsController } from './pets.controller';
import { Pet } from '../entities/pet.entity';
import { PetSighting } from '../entities/pet-sighting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, PetSighting])],
  providers: [PetsService],
  controllers: [PetsController, PublicPetsController],
  exports: [PetsService],
})
export class PetsModule {}