import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannerService, type BannerSlideInput } from '../services/banner.service';

const QUERY_KEY = ['banner-slides'];

export const useBannerSlides = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => bannerService.getAllSlides(),
  });

export const useCreateBannerSlide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BannerSlideInput) => bannerService.createSlide(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateBannerSlide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BannerSlideInput> }) =>
      bannerService.updateSlide(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteBannerSlide = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannerService.deleteSlide(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUploadBannerImage = () =>
  useMutation({
    mutationFn: (file: File) => bannerService.uploadImage(file),
  });
