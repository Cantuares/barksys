import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TrainerAvailabilityConfig } from './entities/trainer-availability-config.entity';
import { AvailabilityConfiguredEvent } from './events/availability-configured.event';
import { TrainerAvailabilityException, ExceptionType } from './entities/trainer-availability-exception.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { CreateAvailabilityConfigDto } from './dto/create-availability-config.dto';
import { UpdateAvailabilityConfigDto } from './dto/update-availability-config.dto';
import { CreateAvailabilityExceptionDto } from './dto/create-availability-exception.dto';
import { AvailabilityConfigResponseDto } from './dto/availability-config-response.dto';
import { AvailabilityExceptionResponseDto } from './dto/availability-exception-response.dto';
import { WorkingDays } from './entities/trainer-availability-config.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly em: EntityManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private convertWorkingDaysToArray(workingDays: WorkingDays): string[] {
    const days: string[] = [];
    if (workingDays.mon) days.push('Monday');
    if (workingDays.tue) days.push('Tuesday');
    if (workingDays.wed) days.push('Wednesday');
    if (workingDays.thu) days.push('Thursday');
    if (workingDays.fri) days.push('Friday');
    if (workingDays.sat) days.push('Saturday');
    if (workingDays.sun) days.push('Sunday');
    return days;
  }

  async createOrUpdateConfig(
    trainerId: string,
    company: Company,
    dto: CreateAvailabilityConfigDto,
  ): Promise<AvailabilityConfigResponseDto> {
    // Verify trainer exists and belongs to company
    const trainer = await this.em.findOne(User, {
      id: trainerId,
      company,
      role: UserRole.TRAINER,
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    // Validate time ranges
    this.validateTimeRanges(dto);

    // Check if config already exists
    const existingConfig = await this.em.findOne(TrainerAvailabilityConfig, { trainer });

    if (existingConfig) {
      // Update existing config
      Object.assign(existingConfig, {
        workStartTime: dto.workStartTime,
        workEndTime: dto.workEndTime,
        slotDurationMinutes: dto.slotDurationMinutes,
        lunchBreakStart: dto.lunchBreakStart,
        lunchBreakEnd: dto.lunchBreakEnd,
        breakTimeStart: dto.breakTimeStart,
        breakTimeEnd: dto.breakTimeEnd,
        workingDays: dto.workingDays,
        timezone: dto.timezone || 'Europe/Lisbon',
        bufferTimeMinutes: dto.bufferTimeMinutes,
        maxBookingsPerDay: dto.maxBookingsPerDay,
        advanceBookingDays: dto.advanceBookingDays ?? 30,
        minNoticeHours: dto.minNoticeHours ?? 24,
        updatedAt: new Date(),
      });

      await this.em.persistAndFlush(existingConfig);

      // Emit availability.configured event (update)
      await this.em.populate(trainer, ['company']);
      const companyId = typeof trainer.company === 'object' ? trainer.company.id : (trainer.company || '');
      this.eventEmitter.emit(
        'availability.configured',
        new AvailabilityConfiguredEvent(
          trainer.id,
          trainer.fullName,
          trainer.email,
          existingConfig.workStartTime,
          existingConfig.workEndTime,
          this.convertWorkingDaysToArray(existingConfig.workingDays),
          companyId,
          true, // isUpdate
        ),
      );

      return this.mapConfigToResponse(existingConfig);
    }

    // Create new config
    const config = this.em.create(TrainerAvailabilityConfig, {
      trainer,
      workStartTime: dto.workStartTime,
      workEndTime: dto.workEndTime,
      slotDurationMinutes: dto.slotDurationMinutes,
      lunchBreakStart: dto.lunchBreakStart,
      lunchBreakEnd: dto.lunchBreakEnd,
      breakTimeStart: dto.breakTimeStart,
      breakTimeEnd: dto.breakTimeEnd,
      workingDays: dto.workingDays,
      timezone: dto.timezone || 'America/Sao_Paulo',
      bufferTimeMinutes: dto.bufferTimeMinutes,
      maxBookingsPerDay: dto.maxBookingsPerDay,
      advanceBookingDays: dto.advanceBookingDays ?? 30,
      minNoticeHours: dto.minNoticeHours ?? 24,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(config);

    // Emit availability.configured event (new config)
    await this.em.populate(trainer, ['company']);
    const companyId = typeof trainer.company === 'object' ? trainer.company.id : (trainer.company || '');
    this.eventEmitter.emit(
      'availability.configured',
      new AvailabilityConfiguredEvent(
        trainer.id,
        trainer.fullName,
        trainer.email,
        config.workStartTime,
        config.workEndTime,
        this.convertWorkingDaysToArray(config.workingDays),
        companyId,
        false, // isUpdate
      ),
    );

    return this.mapConfigToResponse(config);
  }

  async getConfigByTrainer(trainerId: string, company: Company): Promise<AvailabilityConfigResponseDto | null> {
    const trainer = await this.em.findOne(User, {
      id: trainerId,
      company,
      role: UserRole.TRAINER,
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    const config = await this.em.findOne(TrainerAvailabilityConfig, { trainer }, { populate: ['trainer'] });

    if (!config) {
      return null;
    }

    return this.mapConfigToResponse(config);
  }

  async updateConfig(
    trainerId: string,
    company: Company,
    dto: UpdateAvailabilityConfigDto,
  ): Promise<AvailabilityConfigResponseDto> {
    const trainer = await this.em.findOne(User, {
      id: trainerId,
      company,
      role: UserRole.TRAINER,
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    const config = await this.em.findOne(TrainerAvailabilityConfig, { trainer });

    if (!config) {
      throw new NotFoundException('Availability config not found');
    }

    // Validate time ranges if provided
    if (dto.workStartTime || dto.workEndTime) {
      this.validateTimeRanges({
        workStartTime: dto.workStartTime || config.workStartTime,
        workEndTime: dto.workEndTime || config.workEndTime,
        lunchBreakStart: dto.lunchBreakStart !== undefined ? dto.lunchBreakStart : config.lunchBreakStart,
        lunchBreakEnd: dto.lunchBreakEnd !== undefined ? dto.lunchBreakEnd : config.lunchBreakEnd,
        breakTimeStart: dto.breakTimeStart !== undefined ? dto.breakTimeStart : config.breakTimeStart,
        breakTimeEnd: dto.breakTimeEnd !== undefined ? dto.breakTimeEnd : config.breakTimeEnd,
      } as any);
    }

    Object.assign(config, {
      ...dto,
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(config);
    return this.mapConfigToResponse(config);
  }

  async deleteConfig(trainerId: string, company: Company): Promise<void> {
    const trainer = await this.em.findOne(User, {
      id: trainerId,
      company,
      role: UserRole.TRAINER,
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    const config = await this.em.findOne(TrainerAvailabilityConfig, { trainer });

    if (!config) {
      throw new NotFoundException('Availability config not found');
    }

    await this.em.removeAndFlush(config);
  }

  async createException(
    trainerId: string,
    company: Company,
    dto: CreateAvailabilityExceptionDto,
  ): Promise<AvailabilityExceptionResponseDto> {
    // Verify trainer exists and belongs to company
    const trainer = await this.em.findOne(User, {
      id: trainerId,
      company,
      role: UserRole.TRAINER,
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    // Validate custom hours if exception type is CUSTOM_HOURS
    if (dto.exceptionType === ExceptionType.CUSTOM_HOURS) {
      if (!dto.customStartTime || !dto.customEndTime) {
        throw new BadRequestException('Custom start and end times are required for custom_hours exception type');
      }

      if (dto.customStartTime >= dto.customEndTime) {
        throw new BadRequestException('Custom start time must be before custom end time');
      }
    }

    // Check if exception already exists for this date
    const exceptionDate = new Date(dto.exceptionDate);
    const existing = await this.em.findOne(TrainerAvailabilityException, {
      trainer,
      exceptionDate,
    });

    if (existing) {
      throw new ConflictException('Exception already exists for this date');
    }

    const exception = this.em.create(TrainerAvailabilityException, {
      trainer,
      exceptionDate,
      exceptionType: dto.exceptionType,
      customStartTime: dto.customStartTime,
      customEndTime: dto.customEndTime,
      reason: dto.reason,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(exception);
    return this.mapExceptionToResponse(exception);
  }

  async listExceptionsByTrainer(trainerId: string, company: Company): Promise<AvailabilityExceptionResponseDto[]> {
    const trainer = await this.em.findOne(User, {
      id: trainerId,
      company,
      role: UserRole.TRAINER,
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    const exceptions = await this.em.find(
      TrainerAvailabilityException,
      { trainer },
      { orderBy: { exceptionDate: 'ASC' } },
    );

    return exceptions.map((exception) => this.mapExceptionToResponse(exception));
  }

  async deleteException(exceptionId: string, trainerId: string, company: Company): Promise<void> {
    const trainer = await this.em.findOne(User, {
      id: trainerId,
      company,
      role: UserRole.TRAINER,
    });

    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }

    const exception = await this.em.findOne(TrainerAvailabilityException, {
      id: exceptionId,
      trainer,
    });

    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    await this.em.removeAndFlush(exception);
  }

  private validateTimeRanges(dto: Partial<CreateAvailabilityConfigDto>): void {
    if (dto.workStartTime && dto.workEndTime && dto.workStartTime >= dto.workEndTime) {
      throw new BadRequestException('Work start time must be before work end time');
    }

    if (dto.lunchBreakStart && dto.lunchBreakEnd) {
      if (dto.lunchBreakStart >= dto.lunchBreakEnd) {
        throw new BadRequestException('Lunch break start time must be before lunch break end time');
      }
    }

    if (dto.breakTimeStart && dto.breakTimeEnd) {
      if (dto.breakTimeStart >= dto.breakTimeEnd) {
        throw new BadRequestException('Break start time must be before break end time');
      }
    }
  }

  private mapConfigToResponse(config: TrainerAvailabilityConfig): AvailabilityConfigResponseDto {
    return {
      id: config.id,
      trainerId: typeof config.trainer === 'object' ? config.trainer.id : config.trainer,
      workStartTime: config.workStartTime,
      workEndTime: config.workEndTime,
      slotDurationMinutes: config.slotDurationMinutes,
      lunchBreakStart: config.lunchBreakStart,
      lunchBreakEnd: config.lunchBreakEnd,
      breakTimeStart: config.breakTimeStart,
      breakTimeEnd: config.breakTimeEnd,
      workingDays: config.workingDays,
      timezone: config.timezone,
      bufferTimeMinutes: config.bufferTimeMinutes,
      maxBookingsPerDay: config.maxBookingsPerDay,
      advanceBookingDays: config.advanceBookingDays,
      minNoticeHours: config.minNoticeHours,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  private mapExceptionToResponse(exception: TrainerAvailabilityException): AvailabilityExceptionResponseDto {
    return {
      id: exception.id,
      trainerId: typeof exception.trainer === 'object' ? exception.trainer.id : exception.trainer,
      exceptionDate: exception.exceptionDate,
      exceptionType: exception.exceptionType,
      customStartTime: exception.customStartTime,
      customEndTime: exception.customEndTime,
      reason: exception.reason,
      createdAt: exception.createdAt,
      updatedAt: exception.updatedAt,
    };
  }
}
