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
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/postgresql';
import { TrainingSessionsService } from './training-sessions.service';
import { PackagesService } from '../packages/packages.service';
import { TrainingSessionTemplatesService } from '../training-session-templates/training-session-templates.service';
import { TrainingSessionEnrollmentsService } from '../training-session-enrollments/training-session-enrollments.service';
import { TrainingSessionTemplate } from '../training-session-templates/entities/training-session-template.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyScopeGuard } from '../../common/guards';
import { CurrentCompany } from '../../common/decorators';
import { Company } from '../companies/entities/company.entity';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { TrainingSessionResponseDto } from './dto/training-session-response.dto';
import { TrainingSessionEnrollmentResponseDto } from '../training-session-enrollments/dto/training-session-enrollment-response.dto';

@ApiTags('Training Sessions')
@ApiBearerAuth()
@Controller('training-sessions')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class TrainingSessionsController {
  constructor(
    private readonly em: EntityManager,
    private readonly trainingSessionsService: TrainingSessionsService,
    private readonly packagesService: PackagesService,
    private readonly trainingSessionTemplatesService: TrainingSessionTemplatesService,
    private readonly trainingSessionEnrollmentsService: TrainingSessionEnrollmentsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new training session' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Training session created successfully' })
  async create(
    @Body() createTrainingSessionDto: CreateTrainingSessionDto,
    @CurrentCompany() company: Company,
  ) {
    // Verify trainer belongs to company (trainerId is required in DTO)
    const trainer = await this.em.findOne(User, {
      id: createTrainingSessionDto.trainerId,
      company,
      role: UserRole.TRAINER,
    });

    if (!trainer) {
      throw new BadRequestException('Trainer not found or does not belong to your company');
    }

    // Verify package belongs to company
    const pkg = await this.packagesService.findById(createTrainingSessionDto.packageId, company);

    if (!pkg) {
      throw new BadRequestException('Package not found or does not belong to your company');
    }

    // Optionally verify template if provided
    let template: TrainingSessionTemplate | undefined;
    if (createTrainingSessionDto.templateId) {
      const foundTemplate = await this.trainingSessionTemplatesService.findById(createTrainingSessionDto.templateId, company);

      if (!foundTemplate) {
        throw new BadRequestException('Template not found or does not belong to your company');
      }
      template = foundTemplate;
    }

    const maxParticipants = createTrainingSessionDto.maxParticipants || 1;

    const trainingSession = await this.trainingSessionsService.create({
      template: template || undefined,
      package: pkg,
      trainer: trainer,
      date: new Date(createTrainingSessionDto.date),
      startTime: createTrainingSessionDto.startTime,
      endTime: createTrainingSessionDto.endTime,
      maxParticipants,
      availableSlots: maxParticipants,
      status: createTrainingSessionDto.status,
    });

    return TrainingSessionResponseDto.fromEntity(trainingSession);
  }

  @Get()
  @ApiOperation({
    summary: 'List all training sessions',
    description: 'List all training sessions with optional filters by trainerId and/or packageId'
  })
  @ApiQuery({ name: 'trainerId', required: false, description: 'Filter by trainer ID' })
  @ApiQuery({ name: 'packageId', required: false, description: 'Filter by package ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination (default: 0)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Training sessions retrieved successfully' })
  async findAll(
    @CurrentCompany() company: Company,
    @Query('trainerId') trainerId?: string,
    @Query('packageId') packageId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    let trainingSessions;

    if (trainerId) {
      trainingSessions = await this.trainingSessionsService.findByTrainer(trainerId, company);
    } else {
      trainingSessions = await this.trainingSessionsService.findAllByCompany(
        company,
        limit ? +limit : 50,
        offset ? +offset : 0
      );
    }

    return trainingSessions.map(TrainingSessionResponseDto.fromEntity);
  }

  @Get('available')
  @ApiOperation({
    summary: 'List available training sessions',
    description: 'Returns all upcoming training sessions with available slots. Optionally filter by package. Accessible by all authenticated users (tutors, trainers, admins).'
  })
  @ApiQuery({ name: 'packageId', required: false, description: 'Filter by package ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset for pagination (default: 0)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Available sessions retrieved successfully' })
  async findAvailable(
    @CurrentCompany() company: Company,
    @Query('packageId') packageId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const sessions = await this.trainingSessionsService.findAvailable(
      company,
      packageId,
      limit ? +limit : 50,
      offset ? +offset : 0,
    );
    return sessions.map(TrainingSessionResponseDto.fromEntity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a training session by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Training session retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Training session not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentCompany() company: Company,
  ) {
    const trainingSession = await this.trainingSessionsService.findById(id, company);

    if (!trainingSession) {
      throw new NotFoundException('Training session not found');
    }

    return TrainingSessionResponseDto.fromEntity(trainingSession);
  }

  @Get(':id/enrollments')
  @ApiOperation({ summary: 'Get enrollments for a training session' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Enrollments retrieved successfully' })
  async findEnrollments(
    @Param('id') trainingSessionId: string,
    @CurrentCompany() company: Company,
  ) {
    const enrollments = await this.trainingSessionEnrollmentsService.findByTrainingSession(trainingSessionId, company);
    return enrollments.map(TrainingSessionEnrollmentResponseDto.fromEntity);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a training session' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Training session updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Training session not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTrainingSessionDto: UpdateTrainingSessionDto,
    @CurrentCompany() company: Company,
  ) {
    const trainingSession = await this.trainingSessionsService.update(id, company, {
      ...updateTrainingSessionDto,
      date: updateTrainingSessionDto.date ? new Date(updateTrainingSessionDto.date) : undefined,
    });
    return TrainingSessionResponseDto.fromEntity(trainingSession);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training session' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Training session deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Training session not found' })
  async remove(
    @Param('id') id: string,
    @CurrentCompany() company: Company,
  ) {
    await this.trainingSessionsService.delete(id, company);
    return { message: 'Training session deleted successfully' };
  }
}
