import { NextRequest, NextResponse } from "next/server";
import { generateReportSchema } from "@/lib/validations/report";
import {
  generateNationalReport,
} from "@/lib/reports/pdf-generator";
import {
  generateNationalExcel,
} from "@/lib/reports/excel-generator";
import { ReportMetadata } from "@/types/report";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { queueReportGeneration } from "@/lib/reports/async-generator";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = generateReportSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos inválidos",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { type, format, department, projectId, month, year } = validation.data;
    const asyncMode = body.async === true; // Support async generation

    // If async mode, queue the report generation
    if (asyncMode) {
      const reportId = await queueReportGeneration(
        type,
        format,
        validation.data
      );

      return NextResponse.json({
        success: true,
        message: "Reporte en proceso de generación",
        reportId,
        async: true,
      });
    }

    // Create metadata with proper date conversions
    const metadata: ReportMetadata = {
      generatedAt: new Date(),
      reportType: type,
      parameters: {
        ...validation.data,
        dateFrom: validation.data.dateFrom ? new Date(validation.data.dateFrom) : undefined,
        dateTo: validation.data.dateTo ? new Date(validation.data.dateTo) : undefined,
      },
    };
    let buffer: Buffer;
    let fileName: string;
    let contentType: string;
    let title: string;

    // Generate report based on type and format
    if (type === "NATIONAL") {
      title = "Reporte Nacional";
      // Fetch national data
      const dataResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/reports/data/national`
      );
      const { data } = await dataResponse.json();

      if (format === "PDF") {
        buffer = await generateNationalReport(data, metadata);
        fileName = `reporte-nacional-${Date.now()}.pdf`;
        contentType = "application/pdf";
      } else {
        buffer = await generateNationalExcel(data);
        fileName = `reporte-nacional-${Date.now()}.xlsx`;
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      }
    } else if (type === "DEPARTMENT" && department) {
      // TODO: Fetch department data
      return NextResponse.json(
        {
          success: false,
          message: "Department reports not yet implemented",
        },
        { status: 501 }
      );
    } else if (type === "PROJECT" && projectId) {
      // TODO: Fetch project data
      return NextResponse.json(
        {
          success: false,
          message: "Project reports not yet implemented",
        },
        { status: 501 }
      );
    } else if (type === "MONTHLY" && month && year) {
      // TODO: Fetch monthly data
      return NextResponse.json(
        {
          success: false,
          message: "Monthly reports not yet implemented",
        },
        { status: 501 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid report type or missing parameters",
        },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const filePath = `reports/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("carbono-files")
      .upload(filePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading to Supabase:", uploadError);
      // Continue anyway - return file directly
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("carbono-files")
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Save to database
    try {
      await prisma.generatedReport.create({
        data: {
          reportType: type,
          format,
          title,
          fileName,
          fileUrl,
          fileSizeKb: Math.round(buffer.length / 1024),
          generatedBy: null, // TODO: Get from session
          parameters: validation.data,
          status: "completed",
        },
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Continue anyway - report was generated
    }

    // Return file directly for download
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al generar el reporte",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
