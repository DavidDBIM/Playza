import { useQuery } from "@tanstack/react-query";
import { getPublishedBlogPosts, getBlogPostBySlug } from "@/api/blog.api";

export const useBlogPosts = (limit?: number) =>
  useQuery({
    queryKey: ["blog-posts", limit],
    queryFn: () => getPublishedBlogPosts(limit),
    staleTime: 1000 * 60 * 5, // cache 5 min
  });

export const useBlogPost = (slug: string | undefined) =>
  useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => getBlogPostBySlug(slug as string),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });