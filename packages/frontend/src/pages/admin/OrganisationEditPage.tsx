import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOrganisationSchema, type CreateOrganisationInput } from '@raffle/shared';
import { adminApi } from '../../api/endpoints.js';

export default function OrganisationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const { data: org } = useQuery({
    queryKey: ['admin-organisation', id],
    queryFn: () => adminApi.getOrganisation(id!),
    enabled: !isNew && !!id,
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateOrganisationInput>({
    resolver: zodResolver(createOrganisationSchema),
    defaultValues: {
      primaryColour: '#4F46E5',
      secondaryColour: '#10B981',
    },
  });

  useEffect(() => {
    if (org) {
      reset({
        name: org.name,
        slug: org.slug,
        logoUrl: org.logoUrl,
        primaryColour: org.primaryColour,
        secondaryColour: org.secondaryColour,
      });
    }
  }, [org, reset]);

  const primaryColour = watch('primaryColour');
  const secondaryColour = watch('secondaryColour');

  const createMutation = useMutation({
    mutationFn: adminApi.createOrganisation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organisations'] });
      navigate('/admin/organisations');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateOrganisationInput) => adminApi.updateOrganisation(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organisations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-organisation', id] });
      navigate('/admin/organisations');
    },
  });

  const onSubmit = (data: CreateOrganisationInput) => {
    if (isNew) createMutation.mutate(data);
    else updateMutation.mutate(data);
  };

  const error = createMutation.error || updateMutation.error;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">{isNew ? 'New Organisation' : 'Edit Organisation'}</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{(error as Error).message}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            {...register('name')}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL path)</label>
          <input
            {...register('slug')}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="my-organisation"
          />
          {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (optional)</label>
          <input
            {...register('logoUrl')}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Colour</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                {...register('primaryColour')}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                {...register('primaryColour')}
                className="flex-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>
            {errors.primaryColour && <p className="text-red-500 text-sm mt-1">{errors.primaryColour.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Colour</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                {...register('secondaryColour')}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                {...register('secondaryColour')}
                className="flex-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>
            {errors.secondaryColour && <p className="text-red-500 text-sm mt-1">{errors.secondaryColour.message}</p>}
          </div>
        </div>

        {/* Branding preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Branding Preview</label>
          <div className="rounded-lg overflow-hidden border">
            <div className="text-white p-4" style={{ backgroundColor: primaryColour }}>
              <div className="font-bold">Organisation Header</div>
              <div className="text-sm opacity-80">This is how the public page header will look</div>
            </div>
            <div className="p-4 bg-gray-50">
              <button
                type="button"
                className="text-white px-4 py-2 rounded-md text-sm"
                style={{ backgroundColor: secondaryColour }}
              >
                Sample Button
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            {isNew ? 'Create' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/organisations')}
            className="px-6 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
