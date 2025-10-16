import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TutorsService } from './tutors.service';
import { TutorsController } from './tutors.controller';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { PurchasesModule } from './purchases/purchases.module';
import { PetsModule } from '../pets/pets.module';
import { TrainingSessionEnrollmentsModule } from '../training-session-enrollments/training-session-enrollments.module';

@Module({
  imports: [MikroOrmModule.forFeature([User]), UsersModule, PurchasesModule, PetsModule, TrainingSessionEnrollmentsModule],
  controllers: [TutorsController],
  providers: [TutorsService],
  exports: [TutorsService],
})
export class TutorsModule {}
