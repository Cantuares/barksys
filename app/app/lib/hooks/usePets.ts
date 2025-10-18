import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { petsApi } from '../api/pets.api';
import { useAuth } from './useAuth';
import type { Pet, CreatePetData, UpdatePetData, PetSession } from '../../types/pet.types';

export const usePets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isInitialized, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const loadPets = useCallback(async () => {
    // Only load pets if auth is initialized and user is authenticated
    if (!isInitialized || !isAuthenticated) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await petsApi.getPets(1, 50);
      setPets(response.docs);
    } catch (err) {
      console.error('Failed to load pets:', err);
      setError(t('dashboard.tutor.failedToLoadPets'));
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, isAuthenticated, t]);

  const createPet = useCallback(async (petData: CreatePetData): Promise<Pet> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newPet = await petsApi.createPet(petData);
      setPets(prev => [newPet, ...prev]);
      return newPet;
    } catch (err) {
      console.error('Failed to create pet:', err);
      setError(t('dashboard.tutor.failedToCreatePet'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const updatePet = useCallback(async (petId: string, petData: UpdatePetData): Promise<Pet> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedPet = await petsApi.updatePet(petId, petData);
      setPets(prev => prev.map(pet => pet.id === petId ? updatedPet : pet));
      return updatedPet;
    } catch (err) {
      console.error('Failed to update pet:', err);
      setError(t('dashboard.tutor.failedToUpdatePet'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const deletePet = useCallback(async (petId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await petsApi.deletePet(petId);
      setPets(prev => prev.filter(pet => pet.id !== petId));
    } catch (err) {
      console.error('Failed to delete pet:', err);
      setError(t('dashboard.tutor.failedToDeletePet'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  // Clear error when language changes to update error messages
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [t]);

  return {
    pets,
    isLoading,
    error,
    loadPets,
    createPet,
    updatePet,
    deletePet,
    clearError,
  };
};

export const usePet = (petId: string) => {
  const { t } = useTranslation();
  const [pet, setPet] = useState<Pet | null>(null);
  const [petSessions, setPetSessions] = useState<PetSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPet = useCallback(async () => {
    if (!petId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const petData = await petsApi.getPetById(petId);
      setPet(petData);
    } catch (err) {
      console.error('Failed to load pet:', err);
      setError(t('dashboard.tutor.failedToLoadPetDetails'));
    } finally {
      setIsLoading(false);
    }
  }, [petId]);

  const loadPetSessions = useCallback(async () => {
    if (!petId) return;
    
    setSessionsLoading(true);
    
    try {
      const sessions = await petsApi.getPetSessions(petId);
      setPetSessions(sessions);
    } catch (err) {
      console.error('Failed to load pet sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    loadPet();
    loadPetSessions();
  }, [loadPet, loadPetSessions]);

  return {
    pet,
    petSessions,
    isLoading,
    sessionsLoading,
    error,
    loadPet,
    loadPetSessions,
  };
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: string | null): string => {
  if (!birthDate) return '';
  
  const birth = new Date(birthDate);
  const today = new Date();
  const ageInYears = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return `${ageInYears - 1} anos`;
  }
  
  return `${ageInYears} anos`;
};

/**
 * Get species label
 */
export const getSpeciesLabel = (species: 'dog' | 'other'): string => {
  return species === 'dog' ? 'Cão' : 'Outro';
};

/**
 * Get status label
 */
export const getStatusLabel = (status: 'active' | 'inactive'): string => {
  return status === 'active' ? 'Ativo' : 'Inativo';
};

/**
 * Get status color classes
 */
export const getStatusColor = (status: 'active' | 'inactive'): string => {
  return status === 'active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-yellow-100 text-yellow-800';
};

/**
 * Get session status label
 */
export const getSessionStatusLabel = (status: string): string => {
  switch (status) {
    case 'scheduled': return 'Agendado';
    case 'completed': return 'Concluído';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

/**
 * Get session status color classes
 */
export const getSessionStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
