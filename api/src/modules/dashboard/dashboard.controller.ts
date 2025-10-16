import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyScopeGuard } from '../../common/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CurrentCompany } from '../../common/decorators';
import { Company } from '../companies/entities/company.entity';
import { AdminDashboardService } from './admin-dashboard.service';
import { TrainerDashboardService } from './trainer-dashboard.service';
import { TutorDashboardService } from './tutor-dashboard.service';
import { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';
import { TrainerDashboardResponseDto } from './dto/trainer-dashboard-response.dto';
import { TutorDashboardResponseDto } from './dto/tutor-dashboard-response.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, CompanyScopeGuard, RolesGuard)
export class DashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
    private readonly trainerDashboardService: TrainerDashboardService,
    private readonly tutorDashboardService: TutorDashboardService,
  ) {}

  @Get('admin')
  @Roles(UserRole.ADMIN)
  async getAdminDashboard(
    @CurrentCompany() company: Company,
  ): Promise<AdminDashboardResponseDto> {
    return this.adminDashboardService.getDashboard(company);
  }

  @Get('trainer')
  @Roles(UserRole.TRAINER)
  async getTrainerDashboard(
    @Request() req,
    @CurrentCompany() company: Company,
  ): Promise<TrainerDashboardResponseDto> {
    const trainerId = req.user.id;
    return this.trainerDashboardService.getDashboard(trainerId, company);
  }

  @Get('tutor')
  @Roles(UserRole.TUTOR)
  async getTutorDashboard(@Request() req): Promise<TutorDashboardResponseDto> {
    const tutorId = req.user.id;
    return this.tutorDashboardService.getDashboard(tutorId);
  }
}
