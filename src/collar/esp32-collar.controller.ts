import { Controller, Post, Get, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { CollarService } from './collar.service';
import { CollarCommandType } from './entities/collar-command.entity';

/**
 * ESP32 Collar Controller - Simplified API for ESP32 Hardware
 * Matches the exact specification provided by the ESP32 developer
 */
@Controller()
export class ESP32CollarController {
  constructor(private readonly collarService: CollarService) {}

  /**
   * Endpoint 1: Frontend -> Backend (Send Command)
   * POST /commands
   * Used when user clicks "Find My Pet" button
   */
  @Post('commands')
  async sendCommand(@Body() body: { petId: string; command: string }) {
    const { petId, command } = body;
    
    if (command !== 'FIND_PET') {
      throw new HttpException('Invalid command', HttpStatus.BAD_REQUEST);
    }

    await this.collarService.setCommand(petId, CollarCommandType.FIND_PET, 'system');
    
    return {
      success: true,
      message: `Command FIND_PET saved for ${petId}`
    };
  }

  /**
   * Endpoint 2: ESP32 -> Backend (Polling Check)
   * GET /commands/:petId
   * ESP32 polls this every 5 seconds to check for pending commands
   */
  @Get('commands/:petId')
  async getCommand(@Param('petId') petId: string) {
    const command = await this.collarService.getCommand(petId);
    
    return {
      command: command || 'NONE'
    };
  }

  /**
   * Endpoint 3: ESP32 -> Backend (Execution Confirmation)
   * POST /commands/ack
   * ESP32 confirms command execution to prevent infinite buzzing
   */
  @Post('commands/ack')
  async acknowledgeCommand(@Body() body: { petId: string; status: string }) {
    const { petId, status } = body;
    
    if (status !== 'ACK_RECEIVED') {
      throw new HttpException('Invalid status', HttpStatus.BAD_REQUEST);
    }

    await this.collarService.acknowledgeCommand(petId);
    
    return {
      success: true,
      message: 'Command reset to NONE'
    };
  }
}