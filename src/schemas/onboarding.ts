/**
 * Zod validation schema for POST /api/onboarding.
 * Extracted from the inline schema that was previously defined in the route handler.
 * Import this in onboarding.ts to keep schemas co-located in src/schemas/.
 */
import { z } from 'zod';

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be under 100 characters'),
  role: z.enum(['reader', 'writer']).default('reader'),
  occupation: z
    .string()
    .min(1, 'Occupation is required')
    .max(100, 'Occupation must be under 100 characters'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
