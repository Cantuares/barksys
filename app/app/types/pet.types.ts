export interface Pet {
  id: number;
  tutor: number | { id: number; name: string };
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
  id: number;
  pet: number | Pet;
  session: number | {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    trainer: number | { id: number; name: string };
    package: number | { id: number; name: string };
  };
  status: 'scheduled' | 'completed' | 'cancelled';
  enrollmentDate: string;
}
