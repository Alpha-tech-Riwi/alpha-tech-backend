import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Pet } from './entities/pet.entity';
import { SensorData } from './entities/sensor-data.entity';
import { PetSighting } from './entities/pet-sighting.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';
import { SensorDataModule } from './sensor-data/sensor-data.module';
import { VeterinaryModule } from './veterinary/veterinary.module';
import { CacheConfigModule } from './cache/cache.module';
import { CollarController } from './collar/collar.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'admin',
      password: process.env.DB_PASSWORD || 'password123',
      database: process.env.DB_NAME || 'alpha_tech',
      entities: [User, Pet, SensorData, PetSighting, MedicalRecord],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    CacheConfigModule,
    AuthModule,
    PetsModule,
    SensorDataModule,
    VeterinaryModule,
  ],
  controllers: [AppController, CollarController],
  providers: [AppService],
})
export class AppModule {}
