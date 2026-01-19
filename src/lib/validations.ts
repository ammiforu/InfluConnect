import { z } from 'zod';

// Auth validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['influencer', 'brand'], {
      required_error: 'Please select a role',
    }),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Profile validation schemas
export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export const influencerProfileSchema = z.object({
  niche: z.enum([
    'fashion', 'beauty', 'fitness', 'tech', 'gaming', 'food', 'travel',
    'lifestyle', 'business', 'entertainment', 'education', 'health',
    'parenting', 'pets', 'sports', 'music', 'art', 'photography', 'other'
  ]),
  instagram_handle: z.string().max(30).optional().nullable(),
  instagram_followers: z.number().int().min(0).optional().nullable(),
  tiktok_handle: z.string().max(24).optional().nullable(),
  tiktok_followers: z.number().int().min(0).optional().nullable(),
  youtube_handle: z.string().max(50).optional().nullable(),
  youtube_subscribers: z.number().int().min(0).optional().nullable(),
  twitter_handle: z.string().max(15).optional().nullable(),
  twitter_followers: z.number().int().min(0).optional().nullable(),
  engagement_rate: z.number().min(0).max(100).optional().nullable(),
  hourly_rate: z.number().min(0).optional().nullable(),
  availability_status: z.enum(['available', 'busy', 'unavailable']),
  is_public: z.boolean(),
});

export const brandProfileSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(100),
  company_description: z.string().max(1000).optional().nullable(),
  website: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  industry: z.string().max(50).optional().nullable(),
  company_logo_url: z.string().url('Invalid logo URL').optional().nullable().or(z.literal('')),
});

// Campaign/Request validation schemas
export const deliverableItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['post', 'story', 'video', 'reel', 'other']),
  quantity: z.number().int().min(1).max(100),
});

export const createRequestSchema = z.object({
  influencer_id: z.string().uuid('Invalid influencer ID'),
  campaign_title: z.string().min(1, 'Campaign title is required').max(200),
  campaign_description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  deliverables: z.array(deliverableItemSchema).min(1, 'At least one deliverable is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  deadline: z.string().min(1, 'Deadline is required'),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'End date must be after start date',
  path: ['end_date'],
}).refine((data) => new Date(data.deadline) <= new Date(data.end_date), {
  message: 'Deadline must be on or before end date',
  path: ['deadline'],
});

export const rejectRequestSchema = z.object({
  reason: z.string().max(500).optional(),
});

// Deliverable validation schemas
export const submitDeliverableSchema = z.object({
  submission_url: z.string().url('Invalid URL'),
  submission_notes: z.string().max(1000).optional(),
});

export const rejectDeliverableSchema = z.object({
  rejection_reason: z.string().min(1, 'Please provide a reason').max(500),
});

// Message validation schemas
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
});

// Note validation schemas
export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note cannot be empty').max(2000),
  is_shared: z.boolean(),
});

// Review validation schemas
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type InfluencerProfileFormData = z.infer<typeof influencerProfileSchema>;
export type BrandProfileFormData = z.infer<typeof brandProfileSchema>;
export type CreateRequestFormData = z.infer<typeof createRequestSchema>;
export type SubmitDeliverableFormData = z.infer<typeof submitDeliverableSchema>;
export type SendMessageFormData = z.infer<typeof sendMessageSchema>;
export type CreateNoteFormData = z.infer<typeof createNoteSchema>;
export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
