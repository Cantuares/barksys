import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { usePets } from '../lib/hooks/usePets';
import { UserRole } from '../types/auth.types';
import type { UpdatePetData } from '../../types/pet.types';

export default function TutorPetEditPage() {
  const { id } = useParams<{ id: string }>();
  const petId = id || '';
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.TUTOR, UserRole.ADMIN]);
  const { pets, updatePet, isLoading, error, clearError } = usePets();
  const navigate = useNavigate();
  
  const pet = pets.find(p => p.id === petId);
  
  const petSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    species: z.enum(['dog', 'other'], { required_error: 'Espécie é obrigatória' }),
    breed: z.string().optional(),
    birth: z.string().optional(),
    weight: z.number().min(0, 'Peso deve ser positivo').optional().or(z.literal('')),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive'], { required_error: 'Status é obrigatório' }),
  });

  type PetFormData = z.infer<typeof petSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: pet?.name || '',
      species: pet?.species || 'dog',
      breed: pet?.breed || '',
      birth: pet?.birth || '',
      weight: pet?.weight || '',
      description: pet?.description || '',
      status: pet?.status || 'active',
    },
  });

  // Reset form when pet data is loaded
  useEffect(() => {
    if (pet) {
      reset({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || '',
        birth: pet.birth || '',
        weight: pet.weight || '',
        description: pet.description || '',
        status: pet.status,
      });
    }
  }, [pet, reset]);

  const onSubmit = async (data: PetFormData) => {
    try {
      clearError();
      
      const petData: UpdatePetData = {
        name: data.name,
        species: data.species,
        breed: data.breed || undefined,
        birth: data.birth || undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        description: data.description || undefined,
        status: data.status,
      };

      await updatePet(petId, petData);
      navigate(`/tutor/pets/${petId}`);
    } catch (err) {
      // Error is handled by the pets store
    }
  };

  const onCancel = () => {
    navigate(`/tutor/pets/${petId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
            <p className="text-gray-600">Pet não encontrado</p>
            <button 
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
              onClick={() => navigate('/tutor/pets')}
            >
              Voltar para Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <Header
        title="Editar Pet"
        subtitle="Preencha as informações do pet"
        showBackButton
        onBackClick={onCancel}
      />

      {/* Loading State */}
      {isLoading ? (
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">A carregar dados...</p>
          </div>
        </main>
      ) : (
        /* Main Content */
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Editar Pet</h2>
                <p className="text-gray-500 mt-2">Preencha as informações do seu pet</p>
              </div>

              {error && <ErrorMessage message={error} />}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <FormField label="Nome *" htmlFor="name" error={errors.name?.message}>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Nome do pet"
                    icon={<i className="fas fa-paw"></i>}
                    {...register('name')}
                  />
                </FormField>

                {/* Species */}
                <FormField label="Espécie *" htmlFor="species" error={errors.species?.message}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-dog text-gray-400"></i>
                    </div>
                    <select
                      {...register('species')}
                      id="species"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="dog">Cão</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </FormField>

                {/* Breed */}
                <FormField label="Raça" htmlFor="breed" error={errors.breed?.message}>
                  <Input
                    type="text"
                    id="breed"
                    placeholder="Ex: Labrador Retriever"
                    icon={<i className="fas fa-tags"></i>}
                    {...register('breed')}
                  />
                </FormField>

                {/* Birth Date */}
                <FormField label="Data de Nascimento" htmlFor="birth" error={errors.birth?.message}>
                  <Input
                    type="date"
                    id="birth"
                    icon={<i className="fas fa-calendar"></i>}
                    {...register('birth')}
                  />
                </FormField>

                {/* Weight */}
                <FormField label="Peso (kg)" htmlFor="weight" error={errors.weight?.message}>
                  <Input
                    type="number"
                    id="weight"
                    placeholder="Ex: 25.5"
                    icon={<i className="fas fa-weight"></i>}
                    {...register('weight', { valueAsNumber: true })}
                  />
                </FormField>

                {/* Description */}
                <FormField label="Observações" htmlFor="description" error={errors.description?.message}>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                      <i className="fas fa-comment text-gray-400"></i>
                    </div>
                    <textarea
                      {...register('description')}
                      id="description"
                      rows={3}
                      placeholder="Informações sobre comportamento, características especiais, etc."
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                    />
                  </div>
                </FormField>

                {/* Status */}
                <FormField label="Status *" htmlFor="status" error={errors.status?.message}>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('status')}
                        value="active"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Ativo</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('status')}
                        value="inactive"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Inativo</span>
                    </label>
                  </div>
                </FormField>

                {/* Form Actions */}
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    disabled={isLoading}
                    onClick={onCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Atualizar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
