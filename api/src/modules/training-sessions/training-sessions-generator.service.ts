import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { v7 as uuidv7 } from 'uuid';
import { TrainingSession, TrainingSessionStatus } from './entities/training-session.entity';
import { TrainingSessionTemplate, Recurrence, Weekday } from '../training-session-templates/entities/training-session-template.entity';
import { TrainerAvailabilityConfig } from '../trainers/availability/entities/trainer-availability-config.entity';
import { TrainerAvailabilityException, ExceptionType } from '../trainers/availability/entities/trainer-availability-exception.entity';
import { Company } from '../companies/entities/company.entity';
import { UserRole } from '../users/entities/user.entity';
import { TrainingSessionGenerationResultDto } from './dto/generation-result.dto';

@Injectable()
export class TrainingSessionsGeneratorService {
  constructor(private readonly em: EntityManager) {}

  async generateFromTemplate(
    templateId: string,
    startDate: Date,
    endDate: Date,
    company: Company,
  ): Promise<TrainingSessionGenerationResultDto> {
    const template = await this.em.findOne(
      TrainingSessionTemplate,
      { id: templateId, trainer: { company, role: UserRole.TRAINER } },
      { populate: ['trainer', 'package'] },
    );

    if (!template) {
      throw new NotFoundException('Template not found or does not belong to your company');
    }

    const trainerAvailability = await this.em.findOne(TrainerAvailabilityConfig, {
      trainer: template.trainer,
      isActive: true,
    });

    if (!trainerAvailability) {
      throw new BadRequestException('Trainer does not have availability configuration');
    }

    const result: TrainingSessionGenerationResultDto = {
      success: true,
      message: 'Training sessions generated successfully',
      generated: 0,
      skipped: 0,
      conflicts: [],
      trainingSessions: [],
    };

    const datesToGenerate = this.generateDates(template, startDate, endDate);

    const trainerExceptions = await this.em.find(TrainerAvailabilityException, {
      trainer: template.trainer,
      exceptionDate: { $gte: startDate, $lte: endDate },
    });

    const exceptionsMap = new Map(
      trainerExceptions.map((ex) => [ex.exceptionDate.toISOString().split('T')[0], ex]),
    );

    for (const date of datesToGenerate) {
      const dateStr = date.toISOString().split('T')[0];

      const isWorkingDay = this.checkIfWorkingDay(date, trainerAvailability.workingDays);
      if (!isWorkingDay) {
        result.skipped++;
        result.conflicts.push({
          date: dateStr,
          reason: 'Not a working day for this trainer',
        });
        continue;
      }

      const exception = exceptionsMap.get(dateStr);
      if (exception && exception.exceptionType === ExceptionType.BLOCKED) {
        result.skipped++;
        result.conflicts.push({
          date: dateStr,
          reason: `Blocked day: ${exception.reason || 'No reason provided'}`,
        });
        continue;
      }

      const hasConflict = await this.checkTimeConflict(
        template.trainer.id,
        date,
        template.startTime,
        template.endTime,
      );

      if (hasConflict) {
        result.skipped++;
        result.conflicts.push({
          date: dateStr,
          reason: 'Time conflict with existing training session',
        });
        continue;
      }

      const timeValidation = this.validateTimeWithinAvailability(
        template.startTime,
        template.endTime,
        trainerAvailability,
      );

      if (!timeValidation.valid) {
        result.skipped++;
        result.conflicts.push({
          date: dateStr,
          reason: timeValidation.reason || 'Time outside trainer availability',
        });
        continue;
      }

      const trainingSession = this.em.create(TrainingSession, {
        trainingSessionKey: uuidv7(),
        template,
        package: template.package,
        trainer: template.trainer,
        date,
        startTime: template.startTime,
        endTime: template.endTime,
        maxParticipants: template.maxParticipants,
        availableSlots: template.maxParticipants,
        status: TrainingSessionStatus.SCHEDULED,
        scheduledAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.em.persist(trainingSession);
      result.generated++;
      result.trainingSessions.push({
        id: trainingSession.id,
        date: trainingSession.date,
        startTime: trainingSession.startTime,
        endTime: trainingSession.endTime,
      });
    }

    await this.em.flush();

    return result;
  }

  private generateDates(template: TrainingSessionTemplate, startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const current = this.normalizeToUTC(new Date(startDate));
    const end = this.normalizeToUTC(new Date(endDate));
    const templateStart = this.normalizeToUTC(new Date(template.startDate));
    const templateEnd = this.normalizeToUTC(new Date(template.endDate));

    const actualStart = current < templateStart ? templateStart : current;
    const actualEnd = end > templateEnd ? templateEnd : end;

    switch (template.recurrence) {
      case Recurrence.ONCE:
        if (actualStart <= templateStart && templateStart <= actualEnd) {
          dates.push(new Date(templateStart));
        }
        break;

      case Recurrence.DAILY:
        for (let d = new Date(actualStart); d <= actualEnd; d.setUTCDate(d.getUTCDate() + 1)) {
          dates.push(new Date(d));
        }
        break;

      case Recurrence.WEEKLY:
        if (!template.weekdays || template.weekdays.length === 0) {
          throw new BadRequestException('Weekly recurrence requires weekdays to be specified');
        }

        const weekdayNumbers = this.weekdaysToNumbers(template.weekdays);

        for (let d = new Date(actualStart); d <= actualEnd; d.setUTCDate(d.getUTCDate() + 1)) {
          if (weekdayNumbers.includes(d.getUTCDay())) {
            dates.push(new Date(d));
          }
        }
        break;

      case Recurrence.MONTHLY:
        const dayOfMonth = templateStart.getUTCDate();

        for (let d = new Date(actualStart); d <= actualEnd; ) {
          const testDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), dayOfMonth));

          if (testDate >= actualStart && testDate <= actualEnd) {
            const lastDayOfMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
            const actualDay = Math.min(dayOfMonth, lastDayOfMonth);
            const monthDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), actualDay));
            dates.push(monthDate);
          }

          d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
        }
        break;
    }

    return dates;
  }

  private weekdaysToNumbers(weekdays: Weekday[]): number[] {
    const mapping: Record<Weekday, number> = {
      [Weekday.SUNDAY]: 0,
      [Weekday.MONDAY]: 1,
      [Weekday.TUESDAY]: 2,
      [Weekday.WEDNESDAY]: 3,
      [Weekday.THURSDAY]: 4,
      [Weekday.FRIDAY]: 5,
      [Weekday.SATURDAY]: 6,
    };

    return weekdays.map((day) => mapping[day]);
  }

  private checkIfWorkingDay(date: Date, workingDays: any): boolean {
    const dayOfWeek = date.getUTCDay();
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayName = dayNames[dayOfWeek];

    return workingDays[dayName] === true;
  }

  private async checkTimeConflict(
    trainerId: string,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const existingTrainingSessions = await this.em.find(TrainingSession, {
      trainer: trainerId,
      date,
      status: { $nin: [TrainingSessionStatus.CANCELLED, TrainingSessionStatus.EXPIRED] },
    });

    for (const ts of existingTrainingSessions) {
      if (this.timesOverlap(startTime, endTime, ts.startTime, ts.endTime)) {
        return true;
      }
    }

    return false;
  }

  private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && start2 < end1;
  }

  private validateTimeWithinAvailability(
    startTime: string,
    endTime: string,
    availability: TrainerAvailabilityConfig,
  ): { valid: boolean; reason?: string } {
    if (startTime < availability.workStartTime) {
      return { valid: false, reason: 'Start time before trainer work hours' };
    }

    if (endTime > availability.workEndTime) {
      return { valid: false, reason: 'End time after trainer work hours' };
    }

    if (availability.lunchBreakStart && availability.lunchBreakEnd) {
      if (this.timesOverlap(startTime, endTime, availability.lunchBreakStart, availability.lunchBreakEnd)) {
        return { valid: false, reason: 'Time conflicts with lunch break' };
      }
    }

    if (availability.breakTimeStart && availability.breakTimeEnd) {
      if (this.timesOverlap(startTime, endTime, availability.breakTimeStart, availability.breakTimeEnd)) {
        return { valid: false, reason: 'Time conflicts with break time' };
      }
    }

    return { valid: true };
  }

  private normalizeToUTC(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
  }
}
