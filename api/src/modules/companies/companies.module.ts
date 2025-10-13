import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';

@Module({
  imports: [MikroOrmModule.forFeature([Company])],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
