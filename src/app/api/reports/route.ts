import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const type = searchParams.get("type");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.GeneratedReportWhereInput = {};
    if (type) {
      where.reportType = type;
    }

    // Get total count
    const total = await prisma.generatedReport.count({ where });

    // Get paginated reports
    const reports = await prisma.generatedReport.findMany({
      where,
      orderBy: {
        generatedAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener reportes",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          message: "Report ID is required",
        },
        { status: 400 }
      );
    }

    // Delete from database
    await prisma.generatedReport.delete({
      where: { id: reportId },
    });

    return NextResponse.json({
      success: true,
      message: "Reporte eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al eliminar reporte",
      },
      { status: 500 }
    );
  }
}
