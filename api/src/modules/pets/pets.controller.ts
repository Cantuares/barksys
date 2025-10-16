import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyScopeGuard } from '../../common/guards';
import { CurrentCompany } from '../../common/decorators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Company } from '../companies/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PetResponseDto } from './dto/pet-response.dto';

@Controller('pets')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  async create(
    @Body() createPetDto: CreatePetDto,
    @CurrentUser() user: User,
    @CurrentCompany() company: Company,
  ) {
    const pet = await this.petsService.create(createPetDto, user, company);
    return PetResponseDto.fromEntity(pet);
  }

  @Get()
  async findAll(
    @CurrentCompany() company: Company,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const pets = await this.petsService.findAllByCompany(
      company,
      limit ? +limit : 50,
      offset ? +offset : 0,
    );
    return pets.map(PetResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentCompany() company: Company) {
    const pet = await this.petsService.findById(id, company);

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    return PetResponseDto.fromEntity(pet);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @CurrentCompany() company: Company,
  ) {
    const pet = await this.petsService.update(id, company, {
      ...updatePetDto,
      birth: updatePetDto.birth ? new Date(updatePetDto.birth) : undefined,
    });
    return PetResponseDto.fromEntity(pet);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentCompany() company: Company) {
    await this.petsService.delete(id, company);
    return { message: 'Pet deleted successfully' };
  }
}
