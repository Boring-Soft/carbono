import { z } from "zod";

// Report type enum
const reportTypeEnum = z.enum([
  "NATIONAL",
  "DEPARTMENT",
  "PROJECT",
  "MONTHLY",
  "ANNUAL",
]);

// Report format enum
const reportFormatEnum = z.enum(["PDF", "EXCEL"]);

// Generate report schema
export const generateReportSchema = z
  .object({
    type: reportTypeEnum,
    format: reportFormatEnum,
    department: z.string().optional(),
    projectId: z.string().optional(),
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2020).max(2100).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      // If type is DEPARTMENT, department must be provided
      if (data.type === "DEPARTMENT") {
        return !!data.department;
      }
      return true;
    },
    {
      message: "Department is required for DEPARTMENT reports",
      path: ["department"],
    }
  )
  .refine(
    (data) => {
      // If type is PROJECT, projectId must be provided
      if (data.type === "PROJECT") {
        return !!data.projectId;
      }
      return true;
    },
    {
      message: "Project ID is required for PROJECT reports",
      path: ["projectId"],
    }
  )
  .refine(
    (data) => {
      // If type is MONTHLY, month and year must be provided
      if (data.type === "MONTHLY") {
        return !!data.month && !!data.year;
      }
      return true;
    },
    {
      message: "Month and year are required for MONTHLY reports",
      path: ["month"],
    }
  )
  .refine(
    (data) => {
      // If type is ANNUAL, year must be provided
      if (data.type === "ANNUAL") {
        return !!data.year;
      }
      return true;
    },
    {
      message: "Year is required for ANNUAL reports",
      path: ["year"],
    }
  );

// Download report schema (for API)
export const downloadReportSchema = z.object({
  reportId: z.string().uuid().optional(),
  type: reportTypeEnum,
  format: reportFormatEnum,
  department: z.string().optional(),
  projectId: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type DownloadReportInput = z.infer<typeof downloadReportSchema>;
