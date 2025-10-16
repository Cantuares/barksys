import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { PackagePurchase, PurchaseStatus } from '../tutors/purchases/entities/package-purchase.entity';
import { TrainingSessionEnrollment, EnrollmentStatus } from '../training-session-enrollments/entities/training-session-enrollment.entity';
import {
  TutorDashboardResponseDto,
  PackageRemainingDto,
  RemainingSessionsDto,
  TutorUpcomingSessionDto,
} from './dto/tutor-dashboard-response.dto';

@Injectable()
export class TutorDashboardService {
  constructor(private readonly em: EntityManager) {}

  async getDashboard(tutorId: string): Promise<TutorDashboardResponseDto> {
    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Execute all queries in parallel for better performance
    const [petsCount, allEnrollments, activePurchases, upcomingEnrollments] = await Promise.all([
      // 1. Total pets count
      this.em.count(Pet, {
        tutor: tutorId,
      }),

      // 2. All sessions where tutor is enrolled
      this.em.find(
        TrainingSessionEnrollment,
        {
          tutor: tutorId,
          status: EnrollmentStatus.ENROLLED,
        },
        {
          populate: ['trainingSession'],
        },
      ),

      // 3. Active package purchases
      this.em.find(
        PackagePurchase,
        {
          tutor: tutorId,
          status: PurchaseStatus.ACTIVE,
        },
        {
          populate: ['package'],
        },
      ),

      // 4. Upcoming sessions (next 10)
      this.em.find(
        TrainingSessionEnrollment,
        {
          tutor: tutorId,
          status: EnrollmentStatus.ENROLLED,
        },
        {
          populate: ['trainingSession', 'trainingSession.trainer', 'pet'],
          limit: 100, // Get more to filter and sort in code
        },
      ),
    ]);

    // Process sessions data
    let sessionsToday = 0;
    let sessionsThisWeek = 0;

    allEnrollments.forEach((enrollment) => {
      const session = enrollment.trainingSession;
      if (session && session.date) {
        const sessionDate = new Date(session.date);

        // Count sessions today
        if (sessionDate.toDateString() === today.toDateString()) {
          sessionsToday++;
        }

        // Count sessions this week
        if (sessionDate >= weekStart && sessionDate <= weekEnd) {
          sessionsThisWeek++;
        }
      }
    });

    // Calculate remaining sessions from active packages
    let totalRemainingSessions = 0;
    const remainingByPackage: PackageRemainingDto[] = activePurchases.map((purchase) => {
      const packageObj = purchase.package;
      const totalSessions = packageObj?.totalSessions || 0;
      const usedSessions = purchase.usedSessions || 0;
      const remaining = Math.max(0, totalSessions - usedSessions);

      totalRemainingSessions += remaining;

      return {
        packageName: packageObj?.name || 'Unknown Package',
        remaining,
        total: totalSessions,
        usedSessions,
      };
    });

    // Process upcoming sessions
    const upcomingSessions = upcomingEnrollments
      .map((enrollment) => {
        const session = enrollment.trainingSession;
        const pet = enrollment.pet;

        if (!session || !session.date) return null;

        const sessionDate = new Date(session.date);
        if (sessionDate < now) return null; // Skip past sessions

        const result: TutorUpcomingSessionDto = {
          id: session.id,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          trainer: {
            id: session.trainer?.id || '',
            name: session.trainer?.fullName || 'Unknown',
          },
          pet: {
            id: pet?.id || '',
            name: pet?.name || 'Unknown',
          },
          status: session.status,
        };

        return result;
      })
      .filter((session) => session !== null)
      .sort((a, b) => {
        if (!a || !b) return 0;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .slice(0, 10) as TutorUpcomingSessionDto[];

    // Build response
    const remainingSessions: RemainingSessionsDto = {
      total: totalRemainingSessions,
      byPackage: remainingByPackage,
    };

    const dashboardData: TutorDashboardResponseDto = {
      totalPets: petsCount,
      sessionsToday,
      sessionsThisWeek,
      remainingSessions,
      upcomingSessions,
    };

    return dashboardData;
  }
}
