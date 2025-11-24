import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    // Get active/certified projects
    const activeProjects = await prisma.project.findMany({
      where: {
        active: true,
        status: {
          in: [ProjectStatus.CERTIFIED, ProjectStatus.ACTIVE],
        },
      },
      select: {
        areaHectares: true,
        estimatedCo2TonsYear: true,
      },
    });

    // Calculate totals
    const totalHectares = activeProjects.reduce(
      (sum, p) => sum + p.areaHectares,
      0
    );

    const totalCo2Year = activeProjects.reduce(
      (sum, p) => sum + (p.estimatedCo2TonsYear || 0),
      0
    );

    // Calculate revenue estimates (conservative, realistic, optimistic)
    const revenueEstimates = {
      conservative: totalCo2Year * 5,
      realistic: totalCo2Year * 15,
      optimistic: totalCo2Year * 50,
    };

    // Get recent alerts (last 48 hours)
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

    const recentAlerts = await prisma.deforestationAlert.count({
      where: {
        detectedAt: {
          gte: twoDaysAgo,
        },
      },
    });

    // Get previous period stats for trend calculation
    const fourDaysAgo = new Date();
    fourDaysAgo.setHours(fourDaysAgo.getHours() - 96);

    const previousAlerts = await prisma.deforestationAlert.count({
      where: {
        detectedAt: {
          gte: fourDaysAgo,
          lt: twoDaysAgo,
        },
      },
    });

    // Calculate alert trend
    const alertTrend = previousAlerts > 0
      ? ((recentAlerts - previousAlerts) / previousAlerts) * 100
      : recentAlerts > 0 ? 100 : 0;

    // Get project count by status for trend
    const projectsByStatus = await prisma.project.groupBy({
      by: ["status"],
      where: {
        active: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalHectares,
        totalCo2Year,
        revenueEstimates,
        recentAlerts,
        alertTrend,
        projectCount: activeProjects.length,
        projectsByStatus: projectsByStatus.map((p) => ({
          status: p.status,
          count: p._count.id,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener estadísticas del dashboard",
      },
      { status: 500 }
    );
  }
}
