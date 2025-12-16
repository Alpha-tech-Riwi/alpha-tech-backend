import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { CollarAssignment } from './entities/collar-assignment.entity';
import { CollarCommand, CollarCommandType, CollarCommandStatus } from './entities/collar-command.entity';

@Injectable()
export class CollarService {
  private readonly logger = new Logger(CollarService.name);

  constructor(
    @InjectRepository(CollarAssignment)
    private readonly assignmentRepository: Repository<CollarAssignment>,
    @InjectRepository(CollarCommand)
    private readonly commandRepository: Repository<CollarCommand>
  ) {}

  async setCommand(petId: string, commandType: CollarCommandType, issuedBy: string): Promise<void> {
    this.logger.log(`DEBUG: setCommand called with issuedBy: ${issuedBy}`);
    
    // Clear any existing pending commands
    await this.commandRepository.update(
      { petId, status: CollarCommandStatus.PENDING },
      { status: CollarCommandStatus.EXPIRED }
    );

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minute expiry

    const command = this.commandRepository.create({
      petId,
      commandType,
      issuedBy,
      expiresAt
    });

    this.logger.log(`DEBUG: Created command with issuedBy: ${command.issuedBy}`);
    await this.commandRepository.save(command);
    this.logger.log(`Command ${commandType} issued for pet ${petId}`);
  }

  async getCommand(petId: string): Promise<CollarCommandType | null> {
    const command = await this.commandRepository.findOne({
      where: {
        petId,
        status: CollarCommandStatus.PENDING,
        expiresAt: MoreThan(new Date())
      },
      order: { createdAt: 'DESC' }
    });

    if (command) {
      this.logger.log(`Command ${command.commandType} retrieved for pet ${petId}`);
      return command.commandType;
    }

    return null;
  }

  async acknowledgeCommand(petId: string): Promise<void> {
    const result = await this.commandRepository.update(
      {
        petId,
        status: CollarCommandStatus.PENDING,
        expiresAt: MoreThan(new Date())
      },
      {
        status: CollarCommandStatus.ACKNOWLEDGED,
        acknowledgedAt: new Date()
      }
    );

    if (result.affected === 0) {
      throw new NotFoundException('No pending command found for acknowledgment');
    }

    this.logger.log(`Command acknowledged for pet ${petId}`);
  }

  async assignCollar(petId: string, collarId: string, assignedBy: string): Promise<void> {
    // Check if collar is already assigned
    const existingAssignment = await this.assignmentRepository.findOne({
      where: { collarId, isActive: true }
    });

    if (existingAssignment) {
      throw new ConflictException(`Collar ${collarId} is already assigned to another pet`);
    }

    // Deactivate any previous assignments for this pet
    await this.assignmentRepository.update(
      { petId, isActive: true },
      { isActive: false }
    );

    const assignment = this.assignmentRepository.create({
      petId,
      collarId,
      assignedBy
    });

    await this.assignmentRepository.save(assignment);
    this.logger.log(`Collar ${collarId} assigned to pet ${petId}`);
  }

  async getPetByCollar(collarId: string): Promise<string | null> {
    const assignment = await this.assignmentRepository.findOne({
      where: { collarId, isActive: true }
    });

    return assignment?.petId || null;
  }

  async getCollarsByPet(petId: string): Promise<CollarAssignment[]> {
    return this.assignmentRepository.find({
      where: { petId, isActive: true }
    });
  }

  async getActiveCollars(): Promise<CollarAssignment[]> {
    return this.assignmentRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async unassignCollar(collarId: string): Promise<void> {
    const result = await this.assignmentRepository.update(
      { collarId, isActive: true },
      { isActive: false }
    );

    if (result.affected === 0) {
      throw new NotFoundException(`No active assignment found for collar ${collarId}`);
    }

    this.logger.log(`Collar ${collarId} unassigned`);
  }
}