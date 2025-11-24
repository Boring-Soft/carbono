import { z } from "zod";

// Alert severity values
const alertSeverityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

// Alert status values
const alertStatusEnum = z.enum(["NEW", "INVESTIGATING", "RESOLVED", "DISMISSED"]);

// Update alert status schema
export const updateAlertStatusSchema = z.object({
  status: alertStatusEnum,
  notes: z.string().max(1000).optional(),
});

// Alert query filters schema
export const alertQuerySchema = z.object({
  department: z.string().optional(),
  municipality: z.string().optional(),
  severity: alertSeverityEnum.optional(),
  status: alertStatusEnum.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  hasNearProject: z.string().transform((val) => val === "true").optional(),
  page: z.string().transform((val) => parseInt(val, 10)).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional(),
});

// Bulk update alerts schema
export const bulkUpdateAlertsSchema = z.object({
  alertIds: z.array(z.string()).min(1).max(100),
  status: alertStatusEnum,
  notes: z.string().max(1000).optional(),
});

// Create manual alert schema (for future use)
export const createManualAlertSchema = z.object({
  latitude: z.number().min(-23).max(-10),
  longitude: z.number().min(-70).max(-58),
  severity: alertSeverityEnum,
  notes: z.string().max(1000).optional(),
  source: z.string().default("MANUAL"),
});

export type UpdateAlertStatusInput = z.infer<typeof updateAlertStatusSchema>;
export type AlertQueryInput = z.infer<typeof alertQuerySchema>;
export type BulkUpdateAlertsInput = z.infer<typeof bulkUpdateAlertsSchema>;
export type CreateManualAlertInput = z.infer<typeof createManualAlertSchema>;
