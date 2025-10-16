import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TrainingSessionsService } from './training-sessions.service';
import { TrainingSessionsGeneratorService } from './training-sessions-generator.service';
import { TrainingSessionsController } from './training-sessions.controller';
import { TrainingSession } from './entities/training-session.entity';
import { PackagesModule } from '../packages/packages.module';
import { TrainingSessionTemplatesModule } from '../training-session-templates/training-session-templates.module';
import { AvailabilityModule } from '../trainers/availability/availability.module';
import { TrainingSessionEnrollmentsModule } from '../training-session-enrollments/training-session-enrollments.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([TrainingSession]),
    PackagesModule,
    TrainingSessionTemplatesModule,
    AvailabilityModule,
    TrainingSessionEnrollmentsModule,
  ],
  controllers: [TrainingSessionsController],
  providers: [TrainingSessionsService, TrainingSessionsGeneratorService],
  exports: [TrainingSessionsService, TrainingSessionsGeneratorService],
})
export class TrainingSessionsModule {}
