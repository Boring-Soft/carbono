import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { NationalReportData } from "@/types/report";

export async function GET() {
  try {
    // Get all active projects
    const projects = await prisma.project.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        department: true,
        areaHectares: true,
        estimatedCo2TonsYear: true,
      },
    });

    // Calculate summary
    const totalProjects = projects.length;
    const totalHectares = projects.reduce((sum, p) => sum + Number(p.areaHectares), 0);
    const totalCo2Year = projects.reduce(
      (sum, p) => sum + Number(p.estimatedCo2TonsYear || 0),
      0
    );
    const revenuePotential = totalCo2Year * 15; // Realistic scenario

    // Projects by status
    const projectsByStatus = Object.values(ProjectStatus).map((status) => ({
      status,
      count: projects.filter((p) => p.status === status).length,
    }));

    // Projects by type
    const projectsByType = projects.reduce((acc: Record<string, number>, p) => {
      if (!acc[p.type]) {
        acc[p.type] = 0;
      }
      acc[p.type]++;
      return acc;
    }, {});

    interface DepartmentBreakdown {
      department: string;
      projectCount: number;
      hectares: number;
      co2TonsYear: number;
    }

    // Department breakdown
    const departmentBreakdown = projects.reduce((acc: DepartmentBreakdown[], p) => {
      const existing = acc.find((d) => d.department === p.department);
      if (existing) {
        existing.projectCount++;
        existing.hectares += Number(p.areaHectares);
        existing.co2TonsYear += Number(p.estimatedCo2TonsYear || 0);
      } else {
        acc.push({
          department: p.department,
          projectCount: 1,
          hectares: Number(p.areaHectares),
          co2TonsYear: Number(p.estimatedCo2TonsYear || 0),
        });
      }
      return acc;
    }, []);

    departmentBreakdown.sort((a, b) => b.hectares - a.hectares);

    // Top projects by CO2 capture
    const topProjects = projects
      .filter((p) => p.estimatedCo2TonsYear && Number(p.estimatedCo2TonsYear) > 0)
      .sort((a, b) => Number(b.estimatedCo2TonsYear || 0) - Number(a.estimatedCo2TonsYear || 0))
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        department: p.department,
        areaHectares: Number(p.areaHectares),
        estimatedCo2TonsYear: Number(p.estimatedCo2TonsYear || 0),
      }));

    // Recent alerts
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

    const recentAlertsTotal = await prisma.deforestationAlert.count({
      where: {
        detectedAt: {
          gte: twoDaysAgo,
        },
      },
    });

    const recentAlertsHigh = await prisma.deforestationAlert.count({
      where: {
        detectedAt: {
          gte: twoDaysAgo,
        },
        severity: "HIGH",
      },
    });

    const recentAlertsNearProjects = await prisma.deforestationAlert.count({
      where: {
        detectedAt: {
          gte: twoDaysAgo,
        },
        nearProjectId: {
          not: null,
        },
      },
    });

    const reportData: NationalReportData = {
      summary: {
        totalProjects,
        totalHectares,
        totalCo2Year,
        revenuePotential,
        projectsByStatus,
        projectsByType: Object.entries(projectsByType).map(([type, count]) => ({
          type,
          count: count as number,
        })),
      },
      departmentBreakdown,
      topProjects,
      recentAlerts: {
        total: recentAlertsTotal,
        high: recentAlertsHigh,
        nearProjects: recentAlertsNearProjects,
      },
    };

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error("Error fetching national report data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener datos del reporte nacional",
      },
      { status: 500 }
    );
  }
}
