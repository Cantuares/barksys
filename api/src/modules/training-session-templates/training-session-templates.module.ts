import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TrainingSessionTemplatesService } from './training-session-templates.service';
import { TrainingSessionTemplatesController } from './training-session-templates.controller';
import { TrainingSessionTemplate } from './entities/training-session-template.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([TrainingSessionTemplate]),
  ],
  controllers: [TrainingSessionTemplatesController],
  providers: [TrainingSessionTemplatesService],
  exports: [TrainingSessionTemplatesService],
})
export class TrainingSessionTemplatesModule {}
