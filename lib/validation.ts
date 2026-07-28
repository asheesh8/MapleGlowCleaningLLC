import { z } from 'zod';

export const bookingSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.string().trim().email('Please enter a valid email').max(200),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a phone number')
    .max(30)
    .regex(/^[\d\s()+\-.]+$/, 'Phone can only contain digits and () + - .'),

  address: z.string().trim().min(3, 'Please enter the street address').max(200),
  city: z.string().trim().min(2, 'Please enter the town or city').max(100),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),

  serviceType: z.enum([
    'residential',
    'deep',
    'windows',
    'grout',
    'stains',
    'carpet',
    'organizing',
  ]),
  frequency: z.enum(['once', 'weekly', 'biweekly', 'monthly']),
  bedrooms: z.coerce.number().int().min(0).max(12),
  bathrooms: z.coerce.number().int().min(0).max(12),
  sqft: z.coerce.number().int().min(0).max(50000).optional().nullable(),
  addOns: z.array(z.string().max(40)).max(20).default([]),

  preferredDate: z.string().trim().max(40).optional().nullable(),
  preferredTime: z
    .enum(['morning', 'afternoon', 'flexible'])
    .optional()
    .nullable(),

  notes: z.string().trim().max(2000).optional().nullable(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export const statusSchema = z.object({
  status: z.enum(['new', 'contacted', 'scheduled', 'completed', 'archived']),
});

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB per photo
export const MAX_PHOTOS = 6;

export const testimonialSchema = z.object({
  author: z.string().trim().min(2, 'Please enter a name').max(100),
  body: z.string().trim().min(4, 'Please enter the review').max(1000),
  source: z.enum(['facebook', 'direct']).default('direct'),
  featured: z.boolean().default(true),
  order: z.coerce.number().int().min(0).max(999).default(0),
});

export const testimonialPatchSchema = testimonialSchema.partial();
