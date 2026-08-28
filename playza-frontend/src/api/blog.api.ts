import axiosInstance from './axiosInstance';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  tags: string[];
  published_at: string | null;
  view_count: number;
}

export const getPublishedBlogPosts = async (limit?: number): Promise<BlogPost[]> => {
  const response = await axiosInstance.get('/blog', { params: limit ? { limit } : undefined });
  return response.data?.data || response.data || [];
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost> => {
  const response = await axiosInstance.get(`/blog/slug/${slug}`);
  return response.data?.data || response.data;
};