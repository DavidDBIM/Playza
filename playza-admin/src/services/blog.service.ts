import { apiClient } from '../lib/api-client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  author_name: string;
  tags: string[];
  is_published: boolean;
}

export const blogService = {
  async getAllPosts(): Promise<BlogPost[]> {
    const response = await apiClient.get('/blog/admin/all');
    return response.data?.data || response.data || [];
  },

  async createPost(data: BlogPostInput): Promise<BlogPost> {
    const response = await apiClient.post('/blog', data);
    return response.data?.data || response.data;
  },

  async updatePost(id: string, data: Partial<BlogPostInput>): Promise<BlogPost> {
    const response = await apiClient.put(`/blog/${id}`, data);
    return response.data?.data || response.data;
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/blog/${id}`);
  },

  // Convert file → base64 and upload (no multer dependency on backend)
  async uploadImage(file: File): Promise<string> {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await apiClient.post('/blog/upload', {
      base64,
      filename: file.name,
      mimeType: file.type,
    });

    return response.data?.url;
  },
};