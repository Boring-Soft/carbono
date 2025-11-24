/**
 * Organization Validation Schemas
 * Zod schemas for validating organization inputs
 */

import { z } from 'zod';
import { OrganizationType } from '@prisma/client';

/**
 * Schema for creating a new organization
 */
export const createOrganizationSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .trim(),

  type: z.nativeEnum(OrganizationType, {
    errorMap: () => ({ message: 'Tipo de organizacion invalido' }),
  }),

  contactEmail: z.string()
    .email('Email invalido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .optional()
    .nullable()
    .or(z.literal("")),

  contactPhone: z.string()
    .max(50, 'El telefono no puede exceder 50 caracteres')
    .optional()
    .nullable()
    .or(z.literal("")),

  address: z.string()
    .max(500, 'La direccion no puede exceder 500 caracteres')
    .optional()
    .nullable()
    .or(z.literal("")),
});

/**
 * Schema for updating an existing organization
 */
export const updateOrganizationSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .trim()
    .optional(),

  type: z.nativeEnum(OrganizationType, {
    errorMap: () => ({ message: 'Tipo de organizacion invalido' }),
  }).optional(),

  contactEmail: z.string()
    .email('Email invalido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .optional()
    .nullable(),

  contactPhone: z.string()
    .max(50, 'El telefono no puede exceder 50 caracteres')
    .optional()
    .nullable(),

  address: z.string()
    .max(500, 'La direccion no puede exceder 500 caracteres')
    .optional()
    .nullable(),
});

/**
 * Schema for organization query filters
 */
export const organizationQuerySchema = z.object({
  search: z.string().max(200).optional(),
  type: z.nativeEnum(OrganizationType).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  sortBy: z.enum(['name', 'createdAt', 'totalProjects', 'totalHectares']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

/**
 * Type inference helpers
 */
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type OrganizationQueryInput = z.infer<typeof organizationQuerySchema>;
