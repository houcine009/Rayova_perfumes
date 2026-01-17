import { useMutation } from '@tanstack/react-query';
import { newsletterService } from '@/services/newsletterService';

export const useNewsletterSubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return await newsletterService.subscribe(email);
    },
  });
};

export const useNewsletterUnsubscribe = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return await newsletterService.unsubscribe(email);
    },
  });
};
