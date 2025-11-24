import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";

export const revalidate = 3600; // Cache for 1 hour

interface MonthlyDeforestationItem {
  month: string;
  count: number;
  high: number;
}

export async function GET() {
  try {
    // 1. Monthly deforestation alerts (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const alerts = await prisma.deforestationAlert.findMany({
      where: {
        detectedAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        detectedAt: true,
        severity: true,
      },
      orderBy: {
        detectedAt: "asc",
      },
    });

    // Group by month
    const monthlyDeforestation = alerts.reduce((acc: MonthlyDeforestationItem[], alert) => {
      const month = alert.detectedAt.toISOString().substring(0, 7); // YYYY-MM
      const existing = acc.find((item) => item.month === month);
      if (existing) {
        existing.count++;
        if (alert.severity === "HIGH") existing.high++;
      } else {
        acc.push({
          month,
          count: 1,
          high: alert.severity === "HIGH" ? 1 : 0,
        });
      }
      return acc;
    }, []);

    // 2. CO₂ capture by department
    const projectsByDepartment = await prisma.project.groupBy({
      by: ["department"],
      where: {
        active: true,
        status: {
          in: [ProjectStatus.CERTIFIED, ProjectStatus.ACTIVE],
        },
      },
      _sum: {
        estimatedCo2TonsYear: true,
        areaHectares: true,
      },
      _count: {
        id: true,
      },
    });

    const co2ByDepartment = projectsByDepartment.map((dept) => ({
      department: dept.department,
      co2TonsYear: Number(dept._sum.estimatedCo2TonsYear || 0),
      hectares: Number(dept._sum.areaHectares || 0),
      projectCount: dept._count.id,
    }));

    // 3. Project distribution by type
    const projectsByType = await prisma.project.groupBy({
      by: ["type"],
      where: {
        active: true,
      },
      _count: {
        id: true,
      },
    });

    const projectDistribution = projectsByType.map((type) => ({
      type: type.type,
      count: type._count.id,
    }));

    // 4. Forest coverage evolution (placeholder - would need historical GEE data)
    // For now, we'll return recent GEE checks
    const recentGeeChecks = await prisma.project.findMany({
      where: {
        active: true,
        geeVerified: true,
        geeLastCheck: {
          not: null,
        },
      },
      select: {
        geeLastCheck: true,
        forestCoveragePercent: true,
      },
      orderBy: {
        geeLastCheck: "desc",
      },
      take: 50,
    });

    const forestCoverageData = recentGeeChecks.map((check) => ({
      date: check.geeLastCheck?.toISOString().substring(0, 10),
      coverage: check.forestCoveragePercent,
    }));

    return NextResponse.json({
      success: true,
      data: {
        monthlyDeforestation,
        co2ByDepartment,
        projectDistribution,
        forestCoverageData,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard trends:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener tendencias del dashboard",
      },
      { status: 500 }
    );
  }
}
