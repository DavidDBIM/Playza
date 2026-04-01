import { z } from 'zod'

export const signupSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  password: z.string().min(8)
    .regex(/[A-Z]/, 'Need at least one uppercase letter')
    .regex(/[0-9]/, 'Need at least one number'),
  referral_code: z.string().optional(),
})

export const signinSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
})

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6),
})

export const resendOtpSchema = z.object({
  email: z.string().email(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type SigninInput = z.infer<typeof signinSchema>
