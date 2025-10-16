import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DashboardController } from './dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { TrainerDashboardService } from './trainer-dashboard.service';
import { TutorDashboardService } from './tutor-dashboard.service';
import { User } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Package } from '../packages/entities/package.entity';
import { PackagePurchase } from '../tutors/purchases/entities/package-purchase.entity';
import { TrainingSession } from '../training-sessions/entities/training-session.entity';
import { TrainingSessionEnrollment } from '../training-session-enrollments/entities/training-session-enrollment.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      User,
      Pet,
      Package,
      PackagePurchase,
      TrainingSession,
      TrainingSessionEnrollment,
    ]),
  ],
  controllers: [DashboardController],
  providers: [AdminDashboardService, TrainerDashboardService, TutorDashboardService],
  exports: [AdminDashboardService, TrainerDashboardService, TutorDashboardService],
})
export class DashboardModule {}
