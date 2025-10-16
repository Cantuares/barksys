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

    const response = await apiClient.get(`/pets?${params}`);
    // API returns array directly, wrap it in expected format
    return {
      docs: Array.isArray(response) ? response : [],
      total: Array.isArray(response) ? response.length : 0,
      page: page,
      limit: limit,
      totalPages: Math.ceil((Array.isArray(response) ? response.length : 0) / limit)
    };
  },

  /**
   * Get a specific pet by ID
   */
  getPetById: async (petId: string): Promise<Pet> => {
    const response = await apiClient.get(`/pets/${petId}`);
    return response;
  },

  /**
   * Create a new pet
   */
  createPet: async (petData: CreatePetData): Promise<Pet> => {
    const response = await apiClient.post('/pets', petData);
    return response;
  },

  /**
   * Update an existing pet
   */
  updatePet: async (petId: string, petData: UpdatePetData): Promise<Pet> => {
    const response = await apiClient.patch(`/pets/${petId}`, petData);
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
