import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, type HeroSettings, type ContactSettings, type SocialSettings } from '@/services/settingsService';

export type { HeroSettings, ContactSettings, SocialSettings };

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const response = await settingsService.getAll();
      return response.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useSiteSetting = <T = unknown>(key: string) => {
  return useQuery({
    queryKey: ['site-setting', key],
    queryFn: async () => {
      const response = await settingsService.get<T>(key);
      return response.data;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useHeroSettings = () => {
  return useQuery({
    queryKey: ['site-setting', 'hero'],
    queryFn: async () => {
      return await settingsService.getHero();
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const useContactSettings = () => {
  return useQuery({
    queryKey: ['site-setting', 'contact'],
    queryFn: async () => {
      return await settingsService.getContact();
    },
  });
};

export const useSocialSettings = () => {
  return useQuery({
    queryKey: ['site-setting', 'social'],
    queryFn: async () => {
      return await settingsService.getSocial();
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const response = await settingsService.update(key, value);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-setting', variables.key] });
    },
  });
};

export const useUpdateHeroSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<HeroSettings>) => {
      const response = await settingsService.updateHero(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-setting', 'hero'] });
    },
  });
};

export const useUpdateContactSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ContactSettings>) => {
      const response = await settingsService.updateContact(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-setting', 'contact'] });
    },
  });
};
