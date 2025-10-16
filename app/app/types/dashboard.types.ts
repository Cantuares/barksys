// Dashboard types matching the API DTOs

export interface TrainerPerformance {
  id: string;
  name: string;
  totalSessions: number;
  totalEnrollments: number;
  occupancyRate: number;
}

export interface RecentActivity {
  type: string;
  tutorName: string;
  packageName: string;
  amount: number;
  date: Date;
}

export interface TeamMetrics {
  totalTutors: number;
  totalTrainers: number;
  totalPets: number;
}

export interface RevenueMetrics {
  total: number;
  currentMonth: number;
  previousMonth: number;
  growth: number;
}

export interface BusinessMetrics {
  totalPackages: number;
  totalSessions: number;
  currentMonthSessions: number;
  totalEnrollments: number;
  occupancyRate: number;
}

export interface AdminDashboardResponse {
  team: TeamMetrics;
  revenue: RevenueMetrics;
  business: BusinessMetrics;
  trainerPerformance: TrainerPerformance[];
  recentActivity: RecentActivity[];
}

export interface EnrollmentInfo {
  tutorName: string;
  petName: string;
}

export interface UpcomingSession {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  availableSlots: number;
  enrolledCount: number;
  status: string;
  enrollments: EnrollmentInfo[];
}

export interface SessionStatistics {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
}

export interface TrainerDashboardResponse {
  totalSessions: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  totalTutors: number;
  occupancyRate: number;
  upcomingSessions: UpcomingSession[];
  statistics: SessionStatistics;
}

export interface PackageRemaining {
  packageName: string;
  remaining: number;
  total: number;
  usedSessions: number;
}

export interface RemainingSessions {
  total: number;
  byPackage: PackageRemaining[];
}

export interface TutorUpcomingSession {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  trainer: {
    id: string;
    name: string;
  };
  pet: {
    id: string;
    name: string;
  };
  status: string;
}

export interface TutorDashboardResponse {
  totalPets: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  remainingSessions: RemainingSessions;
  upcomingSessions: TutorUpcomingSession[];
}

// Legacy types for backward compatibility
export interface TutorDashboardStats {
  totalPets: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  remainingSessions: {
    total: number;
    byPackage: Array<{
      packageName: string;
      usedSessions: number;
      total: number;
      remaining: number;
    }>;
  };
  upcomingSessions: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    pet: { name: string };
    trainer: { name: string };
  }>;
}