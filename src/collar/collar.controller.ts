import { Controller, Post, Get, Body, Param } from '@nestjs/common';

interface CollarState {
  isLost: boolean;
  soundEnabled: boolean;
  lightEnabled: boolean;
  soundInterval: number;
  lightPattern: string;
}

@Controller('collar')
export class CollarController {
  private collarStates: Map<string, CollarState> = new Map();

  @Post('emergency')
  async handleEmergency(@Body() body: any) {
    const { petId, action, settings } = body;
    
    // console.log(`🚨 Collar Emergency Command: ${action} for pet ${petId}`);
    
    let collarState = this.collarStates.get(petId) || {
      isLost: false,
      soundEnabled: false,
      lightEnabled: false,
      soundInterval: 30,
      lightPattern: 'OFF'
    };
    
    switch (action) {
      case 'ACTIVATE_LOST_MODE':
        collarState = {
          ...collarState,
          isLost: true,
          soundEnabled: settings?.soundEnabled || true,
          lightEnabled: settings?.lightEnabled || true,
          soundInterval: settings?.soundInterval || 30,
          lightPattern: settings?.lightPattern || 'BLINK_FAST'
        };
        // console.log(`✅ Lost mode ACTIVATED for pet ${petId}`);
        break;
        
      case 'DEACTIVATE_LOST_MODE':
        collarState = {
          ...collarState,
          isLost: false,
          soundEnabled: false,
          lightEnabled: false,
          lightPattern: 'OFF'
        };
        // console.log(`✅ Lost mode DEACTIVATED for pet ${petId}`);
        break;
    }
    
    this.collarStates.set(petId, collarState);
    // console.log(`📡 Sending command to ESP32 collar...`);
    
    return {
      success: true,
      message: `Command ${action} sent successfully`,
      collarState
    };
  }

  @Get('status/:petId')
  getCollarStatus(@Param('petId') petId: string) {
    return this.collarStates.get(petId) || {
      isLost: false,
      soundEnabled: false,
      lightEnabled: false,
      soundInterval: 30,
      lightPattern: 'OFF'
    };
  }
}