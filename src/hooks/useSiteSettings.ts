import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, type HeroSettings, type ContactSettings, type SocialSettings, type OpeningSoonSettings } from '@/services/settingsService';

export type { HeroSettings, ContactSettings, SocialSettings, OpeningSoonSettings };

const SETTINGS_KEY = 'rayova_site_settings';
const HERO_KEY = 'rayova_hero_settings';

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const response = await settingsService.getAll();
      if (response.data) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(response.data));
      }
      return response.data;
    },
    placeholderData: () => {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : undefined;
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
      const data = await settingsService.getHero();
      if (data) {
        localStorage.setItem(HERO_KEY, JSON.stringify(data));
      }
      return data;
    },
    placeholderData: () => {
      const saved = localStorage.getItem(HERO_KEY);
      return saved ? JSON.parse(saved) : undefined;
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
      // Update specific key in settings cache if possible
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        settings[variables.key] = variables.value;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      }

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
    onSuccess: (data) => {
      if (data) {
        localStorage.setItem(HERO_KEY, JSON.stringify(data));
      }
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
