import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { Dog, Tag, Calendar, Weight, FileText } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { FormField } from '../components/ui/FormField';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useAuth } from '../lib/hooks/useAuth';
import { useRequireAuth } from '../lib/hooks/useRequireAuth';
import { usePets } from '../lib/hooks/usePets';
import { UserRole } from '../types/auth.types';
import type { CreatePetData } from '../types/pet.types';

export default function TutorPetNewPage() {
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth([UserRole.TUTOR, UserRole.ADMIN]);
  const { createPet, isLoading, error, clearError } = usePets();
  const navigate = useNavigate();
  
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
    watch,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      species: 'dog',
      status: 'active',
    },
  });

  const onSubmit = async (data: PetFormData) => {
    try {
      clearError();
      
      const petData: CreatePetData = {
        name: data.name,
        species: data.species,
        breed: data.breed || undefined,
        birth: data.birth || undefined,
        weight: data.weight ? Number(data.weight) : undefined,
        description: data.description || undefined,
        status: data.status,
      };

      await createPet(petData);
      navigate('/tutor/pets');
    } catch (err) {
      // Error is handled by the pets store
    }
  };

  const onCancel = () => {
    navigate('/tutor/pets');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header */}
      <Header
        title="Adicionar Novo Pet"
        subtitle="Preencha as informações do pet"
        showBackButton
        onBackClick={onCancel}
      />

      {/* Loading State */}
      {isLoading ? (
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">A guardar...</p>
          </div>
        </main>
      ) : (
        // Main Content
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {error && (
              <div className="mb-6">
                <ErrorMessage message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <FormField label="Nome" htmlFor="name" error={errors.name?.message} required>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Nome do pet"
                    icon={<Dog className="h-5 w-5" />}
                    error={!!errors.name}
                    {...register('name')}
                  />
                </FormField>

                {/* Species */}
                <FormField label="Espécie" htmlFor="species" error={errors.species?.message} required>
                  <Select
                    id="species"
                    icon={<Dog className="h-5 w-5" />}
                    error={!!errors.species}
                    {...register('species')}
                  >
                    <option value="dog">Cão</option>
                    <option value="other">Outro</option>
                  </Select>
                </FormField>

                {/* Breed */}
                <FormField label="Raça" htmlFor="breed" error={errors.breed?.message}>
                  <Input
                    type="text"
                    id="breed"
                    placeholder="Ex: Labrador Retriever"
                    icon={<Tag className="h-5 w-5" />}
                    error={!!errors.breed}
                    {...register('breed')}
                  />
                </FormField>

                {/* Birth Date */}
                <FormField label="Data de Nascimento" htmlFor="birth" error={errors.birth?.message}>
                  <Input
                    type="date"
                    id="birth"
                    icon={<Calendar className="h-5 w-5" />}
                    error={!!errors.birth}
                    {...register('birth')}
                  />
                </FormField>

                {/* Weight */}
                <FormField label="Peso (kg)" htmlFor="weight" error={errors.weight?.message}>
                  <Input
                    type="number"
                    step="0.1"
                    id="weight"
                    placeholder="Ex: 25.5"
                    icon={<Weight className="h-5 w-5" />}
                    error={!!errors.weight}
                    {...register('weight', { valueAsNumber: true })}
                  />
                </FormField>

                {/* Description */}
                <FormField label="Observações" htmlFor="description" error={errors.description?.message}>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder="Informações sobre comportamento, características especiais, etc."
                    icon={<FileText className="h-5 w-5" />}
                    error={!!errors.description}
                    {...register('description')}
                  />
                </FormField>

                {/* Status */}
                <FormField label="Status" htmlFor="status" error={errors.status?.message} required>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('status')}
                        value="active"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Ativo</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        {...register('status')}
                        value="inactive"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Inativo</span>
                    </label>
                  </div>
                </FormField>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    fullWidth
                    disabled={isLoading}
                    onClick={onCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Criar
                  </Button>
                </div>
            </form>
          </div>
        </main>
      )}
    </div>
  );
}
