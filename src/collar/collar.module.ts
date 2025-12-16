import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollarController } from './collar.controller';
import { ESP32CollarController } from './esp32-collar.controller';
import { CollarService } from './collar.service';
import { CollarAssignment } from './entities/collar-assignment.entity';
import { CollarCommand } from './entities/collar-command.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollarAssignment, CollarCommand])
  ],
  controllers: [CollarController, ESP32CollarController],
  providers: [CollarService],
  exports: [CollarService]
})
export class CollarModule {}