/**
 * Project Validation Schemas
 * Zod schemas for validating project inputs
 */

import { z } from 'zod';
import { ProjectType, ProjectStatus } from '@prisma/client';

/**
 * GeoJSON Polygon schema
 */
const geoJsonPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(
    z.array(
      z.tuple([z.number(), z.number()]) // [longitude, latitude]
    )
  ).min(1),
});

/**
 * GeoJSON MultiPolygon schema
 */
const geoJsonMultiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(
    z.array(
      z.array(
        z.tuple([z.number(), z.number()])
      )
    )
  ).min(1),
});

/**
 * GeoJSON geometry schema (Polygon or MultiPolygon)
 */
export const geometrySchema = z.union([geoJsonPolygonSchema, geoJsonMultiPolygonSchema]);

/**
 * Schema for creating a new project
 */
export const createProjectSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .trim(),

  type: z.nativeEnum(ProjectType, {
    errorMap: () => ({ message: 'Tipo de proyecto inválido' }),
  }),

  description: z.string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional()
    .nullable()
    .or(z.literal("")),

  geometry: geometrySchema,

  department: z.string()
    .min(1, 'El departamento es requerido')
    .trim(),

  municipality: z.string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),

  organizationId: z.string()
    .cuid('ID de organización inválido'),

  communities: z.string()
    .max(500, 'Las comunidades no pueden exceder 500 caracteres')
    .optional()
    .nullable()
    .or(z.literal("")),

  coBenefits: z.array(z.string())
    .max(10, 'Máximo 10 co-beneficios')
    .optional()
    .nullable(),

  startDate: z.coerce.date()
    .optional()
    .nullable(),

  durationYears: z.number()
    .int('La duración debe ser un número entero')
    .min(1, 'La duración mínima es 1 año')
    .max(100, 'La duración máxima es 100 años')
    .optional()
    .nullable(),

  createdBy: z.string()
    .optional()
    .nullable(),
});

/**
 * Schema for updating an existing project
 */
export const updateProjectSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .trim()
    .optional(),

  type: z.nativeEnum(ProjectType, {
    errorMap: () => ({ message: 'Tipo de proyecto inválido' }),
  }).optional(),

  description: z.string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional()
    .nullable(),

  geometry: geometrySchema.optional(),

  department: z.string()
    .min(1, 'El departamento es requerido')
    .trim()
    .optional(),

  municipality: z.string()
    .trim()
    .optional()
    .nullable(),

  organizationId: z.string()
    .cuid('ID de organización inválido')
    .optional(),

  communities: z.string()
    .max(500, 'Las comunidades no pueden exceder 500 caracteres')
    .optional()
    .nullable(),

  coBenefits: z.array(z.string())
    .max(10, 'Máximo 10 co-beneficios')
    .optional()
    .nullable(),

  startDate: z.coerce.date()
    .optional()
    .nullable(),

  durationYears: z.number()
    .int('La duración debe ser un número entero')
    .min(1, 'La duración mínima es 1 año')
    .max(100, 'La duración máxima es 100 años')
    .optional()
    .nullable(),
});

/**
 * Schema for project query filters
 */
export const projectQuerySchema = z.object({
  department: z.string().optional(),
  type: z.nativeEnum(ProjectType).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  organizationId: z.string().cuid().optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  geeVerified: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'areaHectares', 'estimatedCo2TonsYear']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

/**
 * Schema for updating project status
 */
export const updateProjectStatusSchema = z.object({
  status: z.nativeEnum(ProjectStatus, {
    errorMap: () => ({ message: 'Estado de proyecto inválido' }),
  }),
  notes: z.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
  changedBy: z.string().optional(),
});

/**
 * Schema for uploading project documents
 */
export const uploadDocumentSchema = z.object({
  fileName: z.string()
    .min(1, 'El nombre del archivo es requerido')
    .max(255, 'El nombre del archivo no puede exceder 255 caracteres'),

  fileType: z.enum(['PDF', 'JPG', 'PNG', 'JPEG'], {
    errorMap: () => ({ message: 'Tipo de archivo inválido. Solo se permiten PDF, JPG, PNG' }),
  }),

  fileSize: z.number()
    .int('El tamaño del archivo debe ser un número entero')
    .min(1, 'El archivo está vacío')
    .max(5 * 1024 * 1024, 'El archivo no puede exceder 5MB'),

  fileUrl: z.string()
    .url('URL del archivo inválida'),

  uploadedBy: z.string().optional(),
});

/**
 * Type inference helpers
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
