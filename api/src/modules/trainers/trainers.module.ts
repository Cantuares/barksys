import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TrainersService } from './trainers.service';
import { TrainersController } from './trainers.controller';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AvailabilityModule } from './availability/availability.module';
import { PetsModule } from '../pets/pets.module';
import { TrainingSessionsModule } from '../training-sessions/training-sessions.module';
import { TrainingSessionEnrollmentsModule } from '../training-session-enrollments/training-session-enrollments.module';
import { TrainingSessionTemplatesModule } from '../training-session-templates/training-session-templates.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([User]),
    UsersModule,
    AvailabilityModule,
    PetsModule,
    TrainingSessionsModule,
    TrainingSessionEnrollmentsModule,
    TrainingSessionTemplatesModule,
  ],
  controllers: [TrainersController],
  providers: [TrainersService],
  exports: [TrainersService],
})
export class TrainersModule {}
