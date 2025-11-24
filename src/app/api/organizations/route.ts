import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const type = searchParams.get("type");

    // Build where clause
    const where: Prisma.OrganizationWhereInput = {};
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }
    if (type) {
      where.type = type;
    }

    const organizations = await prisma.organization.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            areaHectares: true,
            estimatedCo2TonsYear: true,
            status: true,
          },
        },
      },
    });

    // Calculate aggregated metrics
    const organizationsWithMetrics = organizations.map((org) => ({
      ...org,
      metrics: {
        totalProjects: org.projects.length,
        totalHectares: org.projects.reduce(
          (sum, p) => sum + Number(p.areaHectares),
          0
        ),
        totalCo2Year: org.projects.reduce(
          (sum, p) => sum + Number(p.estimatedCo2TonsYear || 0),
          0
        ),
      },
    }));

    return NextResponse.json({
      success: true,
      data: organizationsWithMetrics,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener organizaciones",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, contactEmail, contactPhone, address } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        {
          success: false,
          message: "Nombre y tipo son requeridos",
        },
        { status: 400 }
      );
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        type,
        contactEmail,
        contactPhone,
        address,
      },
    });

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear organización",
      },
      { status: 500 }
    );
  }
}
