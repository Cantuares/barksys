import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Company } from '../companies/entities/company.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Pet } from '../pets/entities/pet.entity';
import { Package } from '../packages/entities/package.entity';
import { PackagePurchase, PurchaseStatus } from '../tutors/purchases/entities/package-purchase.entity';
import { TrainingSession } from '../training-sessions/entities/training-session.entity';
import { TrainingSessionEnrollment, EnrollmentStatus } from '../training-session-enrollments/entities/training-session-enrollment.entity';
import {
  AdminDashboardResponseDto,
  TeamMetricsDto,
  RevenueMetricsDto,
  BusinessMetricsDto,
  TrainerPerformanceDto,
  RecentActivityDto,
} from './dto/admin-dashboard-response.dto';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly em: EntityManager) {}

  async getDashboard(company: Company): Promise<AdminDashboardResponseDto> {
    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Previous month for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Execute all queries in parallel for better performance
    const [
      tutorsCount,
      trainersCount,
      petsCount,
      packagesCount,
      allPurchases,
      currentMonthPurchases,
      prevMonthPurchases,
      sessionsCount,
      currentMonthSessionsCount,
      enrollmentsCount,
      recentPurchases,
      trainers,
    ] = await Promise.all([
      // 1. Total tutors in company
      this.em.count(User, {
        company,
        role: UserRole.TUTOR,
      }),

      // 2. Total trainers in company
      this.em.count(User, {
        company,
        role: UserRole.TRAINER,
      }),

      // 3. Total pets in company (through tutors)
      this.em.count(Pet, {
        tutor: {
          company,
        },
      }),

      // 4. Available packages
      this.em.count(Package, {
        company,
      }),

      // 5. All package purchases for revenue calculation
      this.em.find(
        PackagePurchase,
        {
          tutor: {
            company,
          },
        },
        {
          populate: ['package'],
        },
      ),

      // 6. Current month purchases
      this.em.find(
        PackagePurchase,
        {
          tutor: {
            company,
          },
          purchaseDate: {
            $gte: monthStart,
            $lte: monthEnd,
          },
        },
        {
          populate: ['package'],
        },
      ),

      // 7. Previous month purchases for comparison
      this.em.find(
        PackagePurchase,
        {
          tutor: {
            company,
          },
          purchaseDate: {
            $gte: prevMonthStart,
            $lte: prevMonthEnd,
          },
        },
        {
          populate: ['package'],
        },
      ),

      // 8. All sessions in company
      this.em.count(TrainingSession, {
        trainer: {
          company,
          role: UserRole.TRAINER,
        },
      }),

      // 9. Current month sessions
      this.em.count(TrainingSession, {
        trainer: {
          company,
          role: UserRole.TRAINER,
        },
        date: {
          $gte: monthStart,
          $lte: monthEnd,
        },
      }),

      // 10. All enrollments for occupancy
      this.em.count(TrainingSessionEnrollment, {
        tutor: {
          company,
        },
        status: EnrollmentStatus.ENROLLED,
      }),

      // 11. Recent activity (latest 10 purchases)
      this.em.find(
        PackagePurchase,
        {
          tutor: {
            company,
          },
        },
        {
          populate: ['tutor', 'package'],
          orderBy: { purchaseDate: 'DESC' },
          limit: 10,
        },
      ),

      // 12. Get all trainers for performance calculation
      this.em.find(User, {
        company,
        role: UserRole.TRAINER,
      }),
    ]);

    // Calculate revenue metrics
    const currentMonthRevenue = currentMonthPurchases.reduce((total, purchase) => {
      const packagePrice = purchase.package?.price || 0;
      return total + packagePrice;
    }, 0);

    const prevMonthRevenue = prevMonthPurchases.reduce((total, purchase) => {
      const packagePrice = purchase.package?.price || 0;
      return total + packagePrice;
    }, 0);

    const totalRevenue = allPurchases.reduce((total, purchase) => {
      const packagePrice = purchase.package?.price || 0;
      return total + packagePrice;
    }, 0);

    const revenueGrowth =
      prevMonthRevenue > 0
        ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : 0;

    // Calculate trainer performance
    const trainerPerformance = await Promise.all(
      trainers.map(async (trainer) => {
        const trainerSessions = await this.em.count(TrainingSession, {
          trainer: trainer.id,
        });

        const trainerEnrollments = await this.em.count(TrainingSessionEnrollment, {
          trainingSession: {
            trainer: trainer.id,
          },
          status: EnrollmentStatus.ENROLLED,
        });

        const performanceDto: TrainerPerformanceDto = {
          id: trainer.id,
          name: trainer.fullName,
          totalSessions: trainerSessions,
          totalEnrollments: trainerEnrollments,
          occupancyRate:
            trainerSessions > 0
              ? Math.round((trainerEnrollments / (trainerSessions * 4)) * 100) // Assuming avg 4 slots per session
              : 0,
        };

        return performanceDto;
      }),
    );

    // Calculate session statistics
    const overallOccupancyRate =
      sessionsCount > 0
        ? Math.round((enrollmentsCount / (sessionsCount * 4)) * 100) // Assuming avg 4 slots per session
        : 0;

    // Recent activity formatting
    const recentActivity: RecentActivityDto[] = recentPurchases.map((purchase) => ({
      type: 'package_purchase',
      tutorName: purchase.tutor?.fullName || 'Unknown',
      packageName: purchase.package?.name || 'Unknown Package',
      amount: purchase.package?.price || 0,
      date: purchase.purchaseDate,
    }));

    // Build response
    const team: TeamMetricsDto = {
      totalTutors: tutorsCount,
      totalTrainers: trainersCount,
      totalPets: petsCount,
    };

    const revenue: RevenueMetricsDto = {
      total: totalRevenue,
      currentMonth: currentMonthRevenue,
      previousMonth: prevMonthRevenue,
      growth: revenueGrowth,
    };

    const business: BusinessMetricsDto = {
      totalPackages: packagesCount,
      totalSessions: sessionsCount,
      currentMonthSessions: currentMonthSessionsCount,
      totalEnrollments: enrollmentsCount,
      occupancyRate: overallOccupancyRate,
    };

    const dashboardData: AdminDashboardResponseDto = {
      team,
      revenue,
      business,
      trainerPerformance: trainerPerformance.slice(0, 5), // Top 5 trainers
      recentActivity: recentActivity.slice(0, 10),
    };

    return dashboardData;
  }
}
