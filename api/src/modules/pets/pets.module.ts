import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PetsService } from './pets.service';
import { PetsController } from './pets.controller';
import { Pet } from './entities/pet.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Pet])],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
