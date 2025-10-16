import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  Put,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TrainingSessionEnrollmentsService } from './training-session-enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyScopeGuard } from '../../common/guards';
import { CurrentCompany } from '../../common/decorators';
import { Public } from '../auth/decorators/public.decorator';
import { Company } from '../companies/entities/company.entity';
import { CreateTrainingSessionEnrollmentDto } from './dto/create-training-session-enrollment.dto';
import { TrainingSessionEnrollmentResponseDto } from './dto/training-session-enrollment-response.dto';

@Controller('training-session-enrollments')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class TrainingSessionEnrollmentsController {
  constructor(private readonly trainingSessionEnrollmentsService: TrainingSessionEnrollmentsService) {}

  @Post()
  async create(
    @Body() createEnrollmentDto: CreateTrainingSessionEnrollmentDto,
    @CurrentCompany() company: Company,
  ) {
    const enrollment = await this.trainingSessionEnrollmentsService.create(
      createEnrollmentDto.trainingSessionId,
      createEnrollmentDto.tutorId,
      createEnrollmentDto.petId,
      company,
    );

    return TrainingSessionEnrollmentResponseDto.fromEntity(enrollment);
  }

  @Get()
  async findAll(
    @CurrentCompany() company: Company,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const enrollments = await this.trainingSessionEnrollmentsService.findAllByCompany(
      company,
      limit ? +limit : 50,
      offset ? +offset : 0,
    );
    return enrollments.map(TrainingSessionEnrollmentResponseDto.fromEntity);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentCompany() company: Company) {
    const enrollment = await this.trainingSessionEnrollmentsService.findById(id, company);

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return TrainingSessionEnrollmentResponseDto.fromEntity(enrollment);
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentCompany() company: Company) {
    const enrollment = await this.trainingSessionEnrollmentsService.cancel(id, company);
    return TrainingSessionEnrollmentResponseDto.fromEntity(enrollment);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentCompany() company: Company) {
    await this.trainingSessionEnrollmentsService.delete(id, company);
    return { message: 'Enrollment deleted successfully' };
  }

  @Public()
  @Get('confirm/:token')
  @HttpCode(HttpStatus.OK)
  async confirmEnrollmentByToken(@Param('token') token: string) {
    const enrollment = await this.trainingSessionEnrollmentsService.confirmByToken(token);
    return {
      success: true,
      message: 'Enrollment confirmed successfully',
      data: {
        enrollmentId: enrollment.id,
        status: enrollment.status,
        confirmedAt: enrollment.confirmedAt,
      },
    };
  }

  @Public()
  @Get('cancel/:token')
  @HttpCode(HttpStatus.OK)
  async cancelEnrollmentByToken(@Param('token') token: string) {
    const enrollment = await this.trainingSessionEnrollmentsService.cancelByToken(token);
    return {
      success: true,
      message: 'Enrollment cancelled successfully',
      data: {
        enrollmentId: enrollment.id,
        status: enrollment.status,
        cancelledAt: enrollment.cancelledAt,
      },
    };
  }
}
