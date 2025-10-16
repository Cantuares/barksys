import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyScopeGuard } from '../../../common/guards';
import { CurrentCompany } from '../../../common/decorators';
import { Company } from '../../companies/entities/company.entity';
import { CreateAvailabilityConfigDto } from './dto/create-availability-config.dto';
import { UpdateAvailabilityConfigDto } from './dto/update-availability-config.dto';
import { CreateAvailabilityExceptionDto } from './dto/create-availability-exception.dto';
import { AvailabilityConfigResponseDto } from './dto/availability-config-response.dto';
import { AvailabilityExceptionResponseDto } from './dto/availability-exception-response.dto';

@Controller('trainers/:trainerId/availability')
@UseGuards(JwtAuthGuard, CompanyScopeGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('config')
  async createOrUpdateConfig(
    @Param('trainerId') trainerId: string,
    @Body() dto: CreateAvailabilityConfigDto,
    @CurrentCompany() company: Company,
  ): Promise<AvailabilityConfigResponseDto> {
    return this.availabilityService.createOrUpdateConfig(trainerId, company, dto);
  }

  @Get('config')
  async getConfig(
    @Param('trainerId') trainerId: string,
    @CurrentCompany() company: Company,
  ): Promise<AvailabilityConfigResponseDto | null> {
    const config = await this.availabilityService.getConfigByTrainer(trainerId, company);

    if (!config) {
      throw new NotFoundException('Availability config not found for this trainer');
    }

    return config;
  }

  @Put('config')
  async updateConfig(
    @Param('trainerId') trainerId: string,
    @Body() dto: UpdateAvailabilityConfigDto,
    @CurrentCompany() company: Company,
  ): Promise<AvailabilityConfigResponseDto> {
    return this.availabilityService.updateConfig(trainerId, company, dto);
  }

  @Delete('config')
  async deleteConfig(
    @Param('trainerId') trainerId: string,
    @CurrentCompany() company: Company,
  ): Promise<{ message: string }> {
    await this.availabilityService.deleteConfig(trainerId, company);
    return { message: 'Availability config deleted successfully' };
  }

  @Post('exceptions')
  async createException(
    @Param('trainerId') trainerId: string,
    @Body() dto: CreateAvailabilityExceptionDto,
    @CurrentCompany() company: Company,
  ): Promise<AvailabilityExceptionResponseDto> {
    return this.availabilityService.createException(trainerId, company, dto);
  }

  @Get('exceptions')
  async listExceptions(
    @Param('trainerId') trainerId: string,
    @CurrentCompany() company: Company,
  ): Promise<AvailabilityExceptionResponseDto[]> {
    return this.availabilityService.listExceptionsByTrainer(trainerId, company);
  }

  @Delete('exceptions/:exceptionId')
  async deleteException(
    @Param('exceptionId') exceptionId: string,
    @Param('trainerId') trainerId: string,
    @CurrentCompany() company: Company,
  ): Promise<{ message: string }> {
    await this.availabilityService.deleteException(exceptionId, trainerId, company);
    return { message: 'Exception deleted successfully' };
  }
}
