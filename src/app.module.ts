import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Pet } from './entities/pet.entity';
import { SensorData } from './entities/sensor-data.entity';
import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';
import { SensorDataModule } from './sensor-data/sensor-data.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'admin',
      password: process.env.DB_PASSWORD || 'password123',
      database: process.env.DB_NAME || 'alpha_tech',
      entities: [User, Pet, SensorData],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    PetsModule,
    SensorDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
