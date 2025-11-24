import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import {
  generateNationalReport,
} from "./pdf-generator";
import {
  generateNationalExcel,
} from "./excel-generator";
import { ReportMetadata, ReportType, ReportFormat } from "@/types/report";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AsyncReportJob {
  id: string;
  type: ReportType;
  format: ReportFormat;
  parameters: Record<string, unknown>;
  userId?: string;
}

/**
 * Generate a report asynchronously and store it
 * This function can be called from a background job queue (e.g., BullMQ, Inngest)
 */
export async function generateReportAsync(job: AsyncReportJob): Promise<void> {
  const { id, type, format, parameters } = job;

  try {
    // Update status to processing
    await prisma.generatedReport.update({
      where: { id },
      data: { status: "processing" },
    });

    // Generate the report buffer
    const buffer = await generateReportBuffer(type, format, parameters);

    // Create filename
    const timestamp = Date.now();
    const extension = format === "PDF" ? "pdf" : "xlsx";
    const fileName = `reporte-${type.toLowerCase()}-${timestamp}.${extension}`;

    // Upload to Supabase Storage
    const filePath = `reports/${fileName}`;
    const contentType =
      format === "PDF"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const { error: uploadError } = await supabase.storage
      .from("carbono-files")
      .upload(filePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("carbono-files")
      .getPublicUrl(filePath);

    // Update database with completed status
    await prisma.generatedReport.update({
      where: { id },
      data: {
        status: "completed",
        fileName,
        fileUrl: urlData.publicUrl,
        fileSizeKb: Math.round(buffer.length / 1024),
      },
    });

    // TODO: Send notification to user that report is ready
    console.log(`Report ${id} generated successfully`);
  } catch (error) {
    console.error(`Error generating report ${id}:`, error);

    // Update status to failed
    await prisma.generatedReport.update({
      where: { id },
      data: {
        status: "failed",
      },
    });

    throw error;
  }
}

/**
 * Generate the report buffer based on type and format
 */
async function generateReportBuffer(
  type: ReportType,
  format: ReportFormat,
  parameters: Record<string, unknown>
): Promise<Buffer> {
  const metadata: ReportMetadata = {
    generatedAt: new Date(),
    reportType: type,
    parameters: {
      type,
      format,
      ...parameters,
    },
  };

  // Fetch data based on report type
  if (type === "NATIONAL") {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/reports/data/national`
    );
    const { data } = await response.json();

    if (format === "PDF") {
      return await generateNationalReport(data, metadata);
    } else {
      return await generateNationalExcel(data);
    }
  } else if (type === "DEPARTMENT") {
    // TODO: Implement department report generation
    throw new Error("Department reports not yet implemented");
  } else if (type === "PROJECT") {
    // TODO: Implement project report generation
    throw new Error("Project reports not yet implemented");
  } else if (type === "MONTHLY") {
    // TODO: Implement monthly report generation
    throw new Error("Monthly reports not yet implemented");
  } else {
    throw new Error(`Unknown report type: ${type}`);
  }
}

/**
 * Queue a report for async generation
 * Creates a database record with "processing" status
 */
export async function queueReportGeneration(
  type: ReportType,
  format: ReportFormat,
  parameters: Record<string, unknown>,
  userId?: string
): Promise<string> {
  const title = getReportTitle(type, parameters);

  // Create database record
  const report = await prisma.generatedReport.create({
    data: {
      reportType: type,
      format,
      title,
      fileName: "",
      fileUrl: "",
      status: "processing",
      generatedBy: userId || null,
      parameters: JSON.parse(JSON.stringify(parameters)),
    },
  });

  // In a production app, you would queue this job to a job queue
  // For now, we'll just generate it immediately in the background
  // Example with a hypothetical job queue:
  // await jobQueue.add('generate-report', { id: report.id, type, format, parameters, userId });

  // For this demo, trigger generation asynchronously without blocking
  generateReportAsync({
    id: report.id,
    type,
    format,
    parameters,
    userId,
  }).catch((error) => {
    console.error("Background report generation failed:", error);
  });

  return report.id;
}

function getReportTitle(type: ReportType, parameters: Record<string, unknown>): string {
  switch (type) {
    case "NATIONAL":
      return "Reporte Nacional";
    case "DEPARTMENT":
      return `Reporte Departamental - ${parameters.department}`;
    case "PROJECT":
      return `Reporte de Proyecto - ${parameters.projectId}`;
    case "MONTHLY":
      return `Reporte Mensual - ${parameters.month}/${parameters.year}`;
    default:
      return "Reporte";
  }
}
