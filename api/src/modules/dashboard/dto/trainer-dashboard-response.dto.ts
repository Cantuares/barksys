export class EnrollmentInfoDto {
  tutorName: string;
  petName: string;
}

export class UpcomingSessionDto {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  availableSlots: number;
  enrolledCount: number;
  status: string;
  enrollments: EnrollmentInfoDto[];
}

export class SessionStatisticsDto {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
}

export class TrainerDashboardResponseDto {
  totalSessions: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  totalTutors: number;
  occupancyRate: number;
  upcomingSessions: UpcomingSessionDto[];
  statistics: SessionStatisticsDto;
}
