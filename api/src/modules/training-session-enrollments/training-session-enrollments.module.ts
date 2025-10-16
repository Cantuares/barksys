import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TrainingSessionEnrollmentsService } from './training-session-enrollments.service';
import { TrainingSessionEnrollmentsController } from './training-session-enrollments.controller';
import { TrainingSessionEnrollment } from './entities/training-session-enrollment.entity';

@Module({
  imports: [MikroOrmModule.forFeature([TrainingSessionEnrollment])],
  controllers: [TrainingSessionEnrollmentsController],
  providers: [TrainingSessionEnrollmentsService],
  exports: [TrainingSessionEnrollmentsService],
})
export class TrainingSessionEnrollmentsModule {}
