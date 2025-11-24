import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const department = searchParams.get("department");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause
    const where: any = {};

    if (department) {
      where.department = department;
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.detectedAt = {};
      if (dateFrom) {
        where.detectedAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.detectedAt.lte = new Date(dateTo);
      }
    }

    // Fetch alerts with pagination
    const [alerts, total] = await Promise.all([
      prisma.deforestationAlert.findMany({
        where,
        orderBy: {
          detectedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          nearProject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.deforestationAlert.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener alertas",
      },
      { status: 500 }
    );
  }
}
