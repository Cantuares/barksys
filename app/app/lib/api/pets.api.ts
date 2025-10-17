import { apiClient } from './client';
import type { Pet, PetResponse, CreatePetData, UpdatePetData, PetSession } from '../../types/pet.types';

export const petsApi = {
  /**
   * Get pets for the authenticated tutor
   */
  getPets: async (page: number = 1, limit: number = 20): Promise<PetResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort: '-createdAt',
    });

    const response = await apiClient.get(`/pets?${params}`) as Pet[] | PetResponse;
    // API may return array directly or PetResponse object
    if (Array.isArray(response)) {
      return {
        docs: response,
        totalDocs: response.length,
        page: page,
        totalPages: Math.ceil(response.length / limit),
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
    return response;
  },

  /**
   * Get a specific pet by ID
   */
  getPetById: async (petId: string): Promise<Pet> => {
    const response = await apiClient.get(`/pets/${petId}`) as Pet;
    return response;
  },

  /**
   * Create a new pet
   */
  createPet: async (petData: CreatePetData): Promise<Pet> => {
    const response = await apiClient.post('/pets', petData) as Pet;
    return response;
  },

  /**
   * Update an existing pet
   */
  updatePet: async (petId: string, petData: UpdatePetData): Promise<Pet> => {
    const response = await apiClient.patch(`/pets/${petId}`, petData) as Pet;
    return response;
  },

  /**
   * Delete a pet
   */
  deletePet: async (petId: string): Promise<void> => {
    await apiClient.delete(`/pets/${petId}`);
  },

  /**
   * Get pet sessions/enrollments
   */
  getPetSessions: async (petId: string): Promise<PetSession[]> => {
    const params = new URLSearchParams({
      'where[pet][equals]': petId.toString(),
      sort: '-enrollmentDate',
    });

    const response = await apiClient.get(`/training-session-enrollments?${params}`);
    // API returns array directly
    return Array.isArray(response) ? response : [];
  },
};
