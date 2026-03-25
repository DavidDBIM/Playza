import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username is too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is too short").max(15, "Phone number is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),



}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export type SignupFormValues = z.infer<typeof signupSchema>;
