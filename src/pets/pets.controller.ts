import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pets')
@UseGuards(JwtAuthGuard)
export class PetsController {
  constructor(private petsService: PetsService) {}

  @Post()
  async create(@Body() petData: {
    name: string;
    species: string;
    breed: string;
    age: number;
    weight: number;
    collarId: string;
  }, @Request() req) {
    return this.petsService.create({
      ...petData,
      ownerId: req.user.id
    });
  }

  @Get()
  async findMyPets(@Request() req) {
    return this.petsService.findByOwner(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.petsService.update(id, updateData);
  }
}