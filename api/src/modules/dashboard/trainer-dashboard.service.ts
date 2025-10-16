import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Company } from '../companies/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { TrainingSession } from '../training-sessions/entities/training-session.entity';
import { TrainingSessionEnrollment, EnrollmentStatus } from '../training-session-enrollments/entities/training-session-enrollment.entity';
import {
  TrainerDashboardResponseDto,
  UpcomingSessionDto,
  EnrollmentInfoDto,
  SessionStatisticsDto,
} from './dto/trainer-dashboard-response.dto';

@Injectable()
export class TrainerDashboardService {
  constructor(private readonly em: EntityManager) {}

  async getDashboard(trainerId: string, company: Company): Promise<TrainerDashboardResponseDto> {
    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Execute all queries in parallel for better performance
    const [
      totalSessions,
      sessionsToday,
      sessionsThisWeek,
      totalTutors,
      mySessions,
      upcomingSessions,
      myEnrollments,
    ] = await Promise.all([
      // 1. Total sessions created by this trainer
      this.em.count(TrainingSession, {
        trainer: trainerId,
      }),

      // 2. Sessions today
      this.em.count(TrainingSession, {
        trainer: trainerId,
        date: today,
      }),

      // 3. Sessions this week
      this.em.count(TrainingSession, {
        trainer: trainerId,
        date: {
          $gte: weekStart,
          $lte: weekEnd,
        },
      }),

      // 4. Total tutors in the company
      this.em.count(User, {
        company,
        role: UserRole.TUTOR,
      }),

      // 5. All sessions for occupancy calculation
      this.em.find(TrainingSession, {
        trainer: trainerId,
      }),

      // 6. Upcoming sessions (next 10)
      this.em.find(
        TrainingSession,
        {
          trainer: trainerId,
          date: {
            $gte: today,
          },
        },
        {
          orderBy: { date: 'ASC', startTime: 'ASC' },
          limit: 10,
        },
      ),

      // 7. All enrollments for trainer's sessions to calculate occupancy
      this.em.find(TrainingSessionEnrollment, {
        trainingSession: {
          trainer: trainerId,
        },
        status: EnrollmentStatus.ENROLLED,
      }),
    ]);

    // Calculate occupancy rate
    const totalSlots = mySessions.reduce((total, session) => {
      return total + (session.maxParticipants || 0);
    }, 0);

    const occupiedSlots = myEnrollments.length;
    const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    // Process upcoming sessions with enrollment data
    const upcomingSessionsData = await Promise.all(
      upcomingSessions.map(async (session) => {
        // Get enrollments for this session
        const sessionEnrollments = await this.em.find(
          TrainingSessionEnrollment,
          {
            trainingSession: session.id,
            status: EnrollmentStatus.ENROLLED,
          },
          {
            populate: ['tutor', 'pet'],
          },
        );

        const enrollments: EnrollmentInfoDto[] = sessionEnrollments.map((enrollment) => ({
          tutorName: enrollment.tutor?.fullName || 'Unknown',
          petName: enrollment.pet?.name || 'Unknown',
        }));

        const upcomingSession: UpcomingSessionDto = {
          id: session.id,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          maxParticipants: session.maxParticipants,
          availableSlots: session.availableSlots,
          enrolledCount: sessionEnrollments.length,
          status: session.status,
          enrollments,
        };

        return upcomingSession;
      }),
    );

    // Build response
    const statistics: SessionStatisticsDto = {
      totalSlots,
      occupiedSlots,
      availableSlots: totalSlots - occupiedSlots,
    };

    const dashboardData: TrainerDashboardResponseDto = {
      totalSessions,
      sessionsToday,
      sessionsThisWeek,
      totalTutors,
      occupancyRate,
      upcomingSessions: upcomingSessionsData,
      statistics,
    };

    return dashboardData;
  }
}
