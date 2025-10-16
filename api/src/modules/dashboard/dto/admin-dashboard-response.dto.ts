export class TrainerPerformanceDto {
  id: string;
  name: string;
  totalSessions: number;
  totalEnrollments: number;
  occupancyRate: number;
}

export class RecentActivityDto {
  type: string;
  tutorName: string;
  packageName: string;
  amount: number;
  date: Date;
}

export class TeamMetricsDto {
  totalTutors: number;
  totalTrainers: number;
  totalPets: number;
}

export class RevenueMetricsDto {
  total: number;
  currentMonth: number;
  previousMonth: number;
  growth: number;
}

export class BusinessMetricsDto {
  totalPackages: number;
  totalSessions: number;
  currentMonthSessions: number;
  totalEnrollments: number;
  occupancyRate: number;
}

export class AdminDashboardResponseDto {
  team: TeamMetricsDto;
  revenue: RevenueMetricsDto;
  business: BusinessMetricsDto;
  trainerPerformance: TrainerPerformanceDto[];
  recentActivity: RecentActivityDto[];
}
