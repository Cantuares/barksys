import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { TrainerAvailabilityConfig } from './entities/trainer-availability-config.entity';
import { TrainerAvailabilityException } from './entities/trainer-availability-exception.entity';

@Module({
  imports: [MikroOrmModule.forFeature([TrainerAvailabilityConfig, TrainerAvailabilityException])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
