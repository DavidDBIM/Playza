import { useQuery } from "@tanstack/react-query";
import { getBannerSlides } from "@/api/banner.api";

export const useBannerSlides = () =>
  useQuery({
    queryKey: ["banner-slides"],
    queryFn: getBannerSlides,
    staleTime: 1000 * 60 * 5, // cache 5 min
  });
