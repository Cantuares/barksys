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
} from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { UsersService } from '../users/users.service';
import { PetsService } from '../pets/pets.service';
import { TrainingSessionEnrollmentsService } from '../training-session-enrollments/training-session-enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CompanyScopeGuard } from '../../common/guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentCompany } from '../../common/decorators';
import { User, UserRole } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { CreateTutorDto } from '../users/dto/create-tutor.dto';
import { UpdateTutorDto } from './dto/update-tutor.dto';
import { TutorResponseDto } from './dto/tutor-response.dto';
import { PetResponseDto } from '../pets/dto/pet-response.dto';
import { TrainingSessionEnrollmentResponseDto } from '../training-session-enrollments/dto/training-session-enrollment-response.dto';

@Controller('tutors')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class TutorsController {
  constructor(
    private readonly tutorsService: TutorsService,
    private readonly usersService: UsersService,
    private readonly petsService: PetsService,
    private readonly trainingSessionEnrollmentsService: TrainingSessionEnrollmentsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TRAINER)
  async create(
    @Body() createTutorDto: CreateTutorDto,
    @CurrentUser() user: User,
  ) {
    const tutor = await this.usersService.createTutor(createTutorDto, user);
    return TutorResponseDto.fromEntity(tutor);
  }

  @Get()
  async findAll(
    @CurrentCompany() company: Company,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const tutors = await this.tutorsService.findAllByCompany(
      company,
      limit ? +limit : 50,
      offset ? +offset : 0,
    );
    return tutors.map(TutorResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentCompany() company: Company) {
    const tutor = await this.tutorsService.findById(id, company);

    if (!tutor) {
      throw new NotFoundException('Tutor not found');
    }

    return TutorResponseDto.fromEntity(tutor);
  }

  @Get(':id/pets')
  async findPets(
    @Param('id') tutorId: string,
    @CurrentCompany() company: Company,
  ) {
    const pets = await this.petsService.findByTutor(tutorId, company);
    return pets.map(PetResponseDto.fromEntity);
  }

  @Get(':id/enrollments')
  async findEnrollments(
    @Param('id') tutorId: string,
    @CurrentCompany() company: Company,
  ) {
    const enrollments = await this.trainingSessionEnrollmentsService.findByTutor(tutorId, company);
    return enrollments.map(TrainingSessionEnrollmentResponseDto.fromEntity);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTutorDto: UpdateTutorDto,
    @CurrentCompany() company: Company,
  ) {
    const tutor = await this.tutorsService.update(id, company, updateTutorDto);
    return TutorResponseDto.fromEntity(tutor);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentCompany() company: Company) {
    await this.tutorsService.delete(id, company);
    return { message: 'Tutor deleted successfully' };
  }
}
