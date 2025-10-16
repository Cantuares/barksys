export class PackageRemainingDto {
  packageName: string;
  remaining: number;
  total: number;
  usedSessions: number;
}

export class RemainingSessionsDto {
  total: number;
  byPackage: PackageRemainingDto[];
}

export class TutorUpcomingSessionDto {
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

export class TutorDashboardResponseDto {
  totalPets: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  remainingSessions: RemainingSessionsDto;
  upcomingSessions: TutorUpcomingSessionDto[];
}
