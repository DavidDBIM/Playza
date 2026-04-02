import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number is too short"),
  avatarUrl: z.string().optional(),
  tagline: z.string().max(100, "Tagline too long").optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  showActivity: z.boolean().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

