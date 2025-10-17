export interface Pet {
  id: string;
  tutor: string | { id: string; name: string };
  name: string;
  species: 'dog' | 'other';
  breed?: string | null;
  birth?: string | null;
  weight?: number | null;
  description?: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface PetResponse {
  docs: Pet[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreatePetData {
  name: string;
  species: 'dog' | 'other';
  breed?: string;
  birth?: string;
  weight?: number;
  description?: string;
  status: 'active' | 'inactive';
}

export interface UpdatePetData extends Partial<CreatePetData> {}

export interface PetSession {
  id: string;
  pet: string | Pet;
  session: string | {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    trainer: string | { id: string; name: string };
    package: string | { id: string; name: string };
  };
  status: 'scheduled' | 'completed' | 'cancelled';
  enrollmentDate: string;
}
