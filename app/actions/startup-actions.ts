'use server';

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Zod Schema for Startup Submission Validation
const StartupSubmissionSchema = z.object({
  name: z.string().min(2, 'Startup name must be at least 2 characters'),
  oneLiner: z.string().min(10, 'One-liner pitch must be at least 10 characters').max(160, 'One-liner must not exceed 160 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  websiteUrl: z.string().url('Must be a valid URL (e.g. https://example.com)'),
  industry: z.string().min(2, 'Select or enter an industry category'),
  stage: z.enum(['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth', 'IPO', 'Acquired']),
  fundingTotal: z.number().min(0, 'Funding total cannot be negative').default(0),
  employeeCount: z.number().min(1, 'Employee count must be at least 1').default(1),
  location: z.string().min(2, 'Location is required (e.g. San Francisco, CA)'),
  logoUrl: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
});

export type StartupSubmissionInput = z.infer<typeof StartupSubmissionSchema>;

export interface SubmissionResponse {
  success: boolean;
  message: string;
  startup?: any;
  errors?: Record<string, string[]>;
}

export async function submitStartup(prevState: any, formData: FormData): Promise<SubmissionResponse> {
  try {
    const rawData = {
      name: formData.get('name') as string,
      oneLiner: formData.get('oneLiner') as string,
      description: formData.get('description') as string,
      websiteUrl: formData.get('websiteUrl') as string,
      industry: formData.get('industry') as string,
      stage: formData.get('stage') as string,
      fundingTotal: Number(formData.get('fundingTotal') || 0),
      employeeCount: Number(formData.get('employeeCount') || 1),
      location: formData.get('location') as string,
      logoUrl: formData.get('logoUrl') as string || '',
    };

    // Validate Input with Zod
    const validated = StartupSubmissionSchema.safeParse(rawData);

    if (!validated.success) {
      return {
        success: false,
        message: 'Validation failed. Please check the form fields.',
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { data } = validated;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Supabase Insert if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: inserted, error } = await supabase.from('startups').insert({
        slug,
        name: data.name,
        one_liner: data.oneLiner,
        description: data.description,
        website_url: data.websiteUrl,
        industry: data.industry,
        stage: data.stage,
        funding_total: data.fundingTotal,
        employee_count: data.employeeCount,
        location: data.location,
        logo_url: data.logoUrl || null,
        verified: false,
      }).select().single();

      if (error) {
        console.error('Supabase error submitting startup:', error);
        return {
          success: false,
          message: `Database error: ${error.message}`,
        };
      }

      return {
        success: true,
        message: 'Startup successfully submitted to the directory! Pending verification.',
        startup: inserted,
      };
    }

    // Mock Response fallback for local testing
    return {
      success: true,
      message: 'Startup successfully submitted! (Dev Mock Mode)',
      startup: {
        id: `s-${Date.now()}`,
        slug,
        ...data,
        verified: false,
      },
    };
  } catch (err: any) {
    console.error('Unhandled error in submitStartup:', err);
    return {
      success: false,
      message: 'An unexpected error occurred during submission.',
    };
  }
}
