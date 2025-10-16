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
import { TrainersService } from './trainers.service';
import { UsersService } from '../users/users.service';
import { PetsService } from '../pets/pets.service';
import { TrainingSessionsService } from '../training-sessions/training-sessions.service';
import { TrainingSessionsGeneratorService } from '../training-sessions/training-sessions-generator.service';
import { TrainingSessionEnrollmentsService } from '../training-session-enrollments/training-session-enrollments.service';
import { TrainingSessionTemplatesService } from '../training-session-templates/training-session-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CompanyScopeGuard } from '../../common/guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentCompany } from '../../common/decorators';
import { User, UserRole } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { CreateTrainerDto } from '../users/dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { TrainerResponseDto } from './dto/trainer-response.dto';
import { PetResponseDto } from '../pets/dto/pet-response.dto';
import { TrainingSessionEnrollmentResponseDto } from '../training-session-enrollments/dto/training-session-enrollment-response.dto';
import { TrainingSessionTemplateResponseDto } from '../training-session-templates/dto/training-session-template-response.dto';
import { TrainingSessionResponseDto } from '../training-sessions/dto/training-session-response.dto';
import { GenerateTrainingSessionsDto } from '../training-sessions/dto/generate-training-sessions.dto';
import { TrainingSessionGenerationResultDto } from '../training-sessions/dto/generation-result.dto';

@Controller('trainers')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class TrainersController {
  constructor(
    private readonly trainersService: TrainersService,
    private readonly usersService: UsersService,
    private readonly petsService: PetsService,
    private readonly trainingSessionsService: TrainingSessionsService,
    private readonly trainingSessionsGeneratorService: TrainingSessionsGeneratorService,
    private readonly trainingSessionEnrollmentsService: TrainingSessionEnrollmentsService,
    private readonly trainingSessionTemplatesService: TrainingSessionTemplatesService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createTrainerDto: CreateTrainerDto,
    @CurrentUser() user: User,
  ) {
    const trainer = await this.usersService.createTrainer(createTrainerDto, user);
    return TrainerResponseDto.fromEntity(trainer);
  }

  @Get()
  async findAll(
    @CurrentCompany() company: Company,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const trainers = await this.trainersService.findAllByCompany(
      company,
      limit ? +limit : 50,
      offset ? +offset : 0,
    );
    return trainers.map(TrainerResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentCompany() company: Company) {
    const trainer = await this.trainersService.findById(id, company);

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    return TrainerResponseDto.fromEntity(trainer);
  }

  @Get(':id/pets')
  async findPets(
    @Param('id') trainerId: string,
    @CurrentCompany() company: Company,
  ) {
    const pets = await this.petsService.findByTutor(trainerId, company);
    return pets.map(PetResponseDto.fromEntity);
  }

  @Get(':id/enrollments')
  async findEnrollments(
    @Param('id') trainerId: string,
    @CurrentCompany() company: Company,
  ) {
    const enrollments = await this.trainingSessionEnrollmentsService.findByTutor(trainerId, company);
    return enrollments.map(TrainingSessionEnrollmentResponseDto.fromEntity);
  }

  @Get(':id/templates')
  async findTemplates(
    @Param('id') trainerId: string,
    @CurrentCompany() company: Company,
  ) {
    const templates = await this.trainingSessionTemplatesService.findByTrainer(trainerId, company);
    return templates.map(TrainingSessionTemplateResponseDto.fromEntity);
  }

  @Get(':id/sessions')
  async findSessions(
    @Param('id') trainerId: string,
    @CurrentCompany() company: Company,
  ) {
    const sessions = await this.trainingSessionsService.findByTrainer(trainerId, company);
    return sessions.map(TrainingSessionResponseDto.fromEntity);
  }

  @Post(':id/sessions/generate')
  async generateSessions(
    @Param('id') trainerId: string,
    @Body() generateDto: GenerateTrainingSessionsDto,
    @CurrentCompany() company: Company,
  ): Promise<TrainingSessionGenerationResultDto> {
    const startDate = new Date(generateDto.startDate);
    const endDate = new Date(generateDto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.trainingSessionsGeneratorService.generateFromTemplate(
      generateDto.templateId,
      startDate,
      endDate,
      company,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
    @CurrentCompany() company: Company,
  ) {
    const trainer = await this.trainersService.update(id, company, updateTrainerDto);
    return TrainerResponseDto.fromEntity(trainer);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentCompany() company: Company) {
    await this.trainersService.delete(id, company);
    return { message: 'Trainer deleted successfully' };
  }
}
