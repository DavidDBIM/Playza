import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService, type BlogPostInput } from '../services/blog.service';

const QUERY_KEY = ['blog-posts'];

export const useBlogPosts = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => blogService.getAllPosts(),
  });

export const useCreateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BlogPostInput) => blogService.createPost(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogPostInput> }) =>
      blogService.updatePost(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteBlogPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogService.deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUploadBlogImage = () =>
  useMutation({
    mutationFn: (file: File) => blogService.uploadImage(file),
  });