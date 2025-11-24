import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    // Only show certified and active projects to public
    const publicProjects = await prisma.project.findMany({
      where: {
        active: true,
        status: {
          in: [ProjectStatus.CERTIFIED, ProjectStatus.ACTIVE],
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        department: true,
        areaHectares: true,
        estimatedCo2TonsYear: true,
      },
    });

    // Calculate totals
    const totalHectares = publicProjects.reduce(
      (sum, p) => sum + p.areaHectares,
      0
    );

    const totalCo2Year = publicProjects.reduce(
      (sum, p) => sum + (p.estimatedCo2TonsYear || 0),
      0
    );

    // Calculate revenue potential (conservative estimate for public)
    const revenuePotential = totalCo2Year * 15; // $15 per ton (realistic scenario)

    // Count by department
    const byDepartment = publicProjects.reduce((acc: any, p) => {
      if (!acc[p.department]) {
        acc[p.department] = {
          department: p.department,
          projectCount: 0,
          hectares: 0,
          co2TonsYear: 0,
        };
      }
      acc[p.department].projectCount++;
      acc[p.department].hectares += p.areaHectares;
      acc[p.department].co2TonsYear += p.estimatedCo2TonsYear || 0;
      return acc;
    }, {});

    const departmentRanking = Object.values(byDepartment)
      .sort((a: any, b: any) => b.hectares - a.hectares)
      .slice(0, 5); // Top 5

    // Count by type
    const byType = publicProjects.reduce((acc: any, p) => {
      if (!acc[p.type]) {
        acc[p.type] = 0;
      }
      acc[p.type]++;
      return acc;
    }, {});

    // Get featured projects (top 6 by CO2 capture)
    const featuredProjects = publicProjects
      .filter((p) => p.estimatedCo2TonsYear && p.estimatedCo2TonsYear > 0)
      .sort((a, b) => (b.estimatedCo2TonsYear || 0) - (a.estimatedCo2TonsYear || 0))
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        department: p.department,
        areaHectares: p.areaHectares,
        estimatedCo2TonsYear: p.estimatedCo2TonsYear,
      }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalProjects: publicProjects.length,
          totalHectares,
          totalCo2Year,
          revenuePotential,
        },
        departmentRanking,
        projectsByType: byType,
        featuredProjects,
      },
    });
  } catch (error) {
    console.error("Error fetching public metrics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener métricas públicas",
      },
      { status: 500 }
    );
  }
}
