import { Controller, Post, Get, Body, Param, UseGuards, Request, HttpStatus, HttpException } from '@nestjs/common';
import { CollarService } from './collar.service';
import { CollarCommandType } from './entities/collar-command.entity';

interface SendCommandDto {
  petId: string;
  command: string;
}

interface AssignCollarDto {
  petId: string;
  collarId: string;
}

interface AcknowledgeCommandDto {
  petId: string;
  status: string;
}

@Controller('collar')
export class CollarController {
  constructor(private readonly collarService: CollarService) {}

  @Post('commands')
  async sendCommand(@Body() dto: SendCommandDto) {
    const { petId, command } = dto;
    
    if (command !== 'FIND_PET') {
      throw new HttpException('Invalid command type', HttpStatus.BAD_REQUEST);
    }

    // Use a valid UUID for issuedBy
    const validUserId = 'e032669a-a290-4186-a384-3650ebce6c89';
    await this.collarService.setCommand(petId, CollarCommandType.FIND_PET, validUserId);
    
    return {
      success: true,
      message: `Command ${command} issued for pet ${petId}`,
      timestamp: new Date().toISOString()
    };
  }

  @Get('commands/:petId')
  async getCommand(@Param('petId') petId: string) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(petId)) {
      throw new HttpException('Invalid petId format', HttpStatus.BAD_REQUEST);
    }
    
    const command = await this.collarService.getCommand(petId);
    return { command: command || 'NONE' };
  }

  @Post('commands/ack')
  async acknowledgeCommand(@Body() dto: AcknowledgeCommandDto) {
    const { petId, status } = dto;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(petId)) {
      throw new HttpException('Invalid petId format', HttpStatus.BAD_REQUEST);
    }
    
    if (status !== 'ACK_RECEIVED') {
      throw new HttpException('Invalid acknowledgment status', HttpStatus.BAD_REQUEST);
    }

    await this.collarService.acknowledgeCommand(petId);
    return {
      success: true,
      message: 'Command acknowledged successfully',
      timestamp: new Date().toISOString()
    };
  }

  @Post('assign')
  async assignCollar(@Body() dto: AssignCollarDto, @Request() req?: any) {
    const { petId, collarId } = dto;
    
    // Validate UUID format for petId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(petId)) {
      throw new HttpException('Invalid petId format', HttpStatus.BAD_REQUEST);
    }
    
    const assignedBy = req?.user?.id || '00000000-0000-0000-0000-000000000000';
    
    await this.collarService.assignCollar(petId, collarId, assignedBy);
    return {
      success: true,
      message: `Collar ${collarId} assigned to pet ${petId}`,
      timestamp: new Date().toISOString()
    };
  }

  @Get('pet/:collarId')
  async getPetByCollar(@Param('collarId') collarId: string) {
    const petId = await this.collarService.getPetByCollar(collarId);
    return { petId };
  }

  @Get('assignments')
  async getActiveCollars() {
    const assignments = await this.collarService.getActiveCollars();
    return { assignments };
  }

  @Post('unassign/:collarId')
  async unassignCollar(@Param('collarId') collarId: string) {
    await this.collarService.unassignCollar(collarId);
    return {
      success: true,
      message: `Collar ${collarId} unassigned successfully`,
      timestamp: new Date().toISOString()
    };
  }
}