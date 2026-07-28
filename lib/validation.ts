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

  serviceType: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'Please choose a valid service'),
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

export const catalogServiceSchema = z.object({
  name: z.string().trim().min(2, 'Please enter a service name').max(120),
  short: z.string().trim().min(2, 'Please enter a short label').max(120),
  description: z.string().trim().min(10, 'Please enter a description').max(1200),
  includes: z.array(z.string().trim().min(1).max(160)).max(12).default([]),
  base: z.coerce.number().int().min(0).max(100000),
  icon: z
    .enum(['home', 'sparkles', 'window', 'grid', 'droplet', 'layers', 'box'])
    .default('sparkles'),
  order: z.coerce.number().int().min(0).max(999).default(0),
  active: z.boolean().default(true),
});

export const catalogServicePatchSchema = catalogServiceSchema.partial();

export const catalogAddOnSchema = z.object({
  name: z.string().trim().min(2, 'Please enter an add-on name').max(120),
  price: z.coerce.number().int().min(0).max(100000),
  order: z.coerce.number().int().min(0).max(999).default(0),
  active: z.boolean().default(true),
});

export const catalogAddOnPatchSchema = catalogAddOnSchema.partial();

export const chatMessageSchema = z.object({
  conversationId: z.string().trim().min(8).max(80).optional().nullable(),
  message: z.string().trim().min(1, 'Please enter a message').max(1500),
  visitorName: z.string().trim().max(100).optional().nullable(),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email')
    .max(200)
    .optional()
    .or(z.literal(''))
    .nullable(),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[\d\s()+\-.]*$/, 'Phone can only contain digits and () + - .')
    .optional()
    .nullable(),
});

export const chatConversationPatchSchema = z.object({
  status: z.enum(['new', 'open', 'closed', 'archived']),
});
