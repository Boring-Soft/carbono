import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * National Forest Stats API
 *
 * Returns comprehensive forest statistics for Bolivia:
 * - Total forest area in hectares
 * - Forest coverage percentage
 * - Annual forest loss
 * - Stats by department
 * - Historical trends (2000-2023)
 *
 * Results are cached for 24 hours to optimize performance
 * and reduce Google Earth Engine API calls.
 */

// Bolivia departments
const BOLIVIA_DEPARTMENTS = [
  "La Paz",
  "Cochabamba",
  "Santa Cruz",
  "Oruro",
  "Potosí",
  "Chuquisaca",
  "Tarija",
  "Beni",
  "Pando",
];

// Cache configuration
const CACHE_KEY = "national-forest-stats";
const CACHE_DURATION_HOURS = 24;

interface DepartmentStats {
  department: string;
  forestAreaHectares: number;
  coveragePercent: number;
  lossLastYear: number;
}

interface HistoricalDataPoint {
  year: number;
  forestAreaHectares: number;
  lossHectares: number;
}

interface NationalForestStats {
  totalForestHectares: number;
  totalCoveragePercent: number;
  annualLossHectares: number;
  leadingDepartment: string;
  departmentStats: DepartmentStats[];
  historicalTrend: HistoricalDataPoint[];
  lastUpdated: Date;
}

/**
 * Generate mock forest stats for Bolivia
 * TODO: Replace with real Google Earth Engine integration
 */
function generateMockForestStats(): NationalForestStats {
  // Mock data based on approximate real statistics
  // Bolivia has approximately 50M hectares of forest
  const totalForestHectares = 50000000 + Math.random() * 1000000;
  const totalAreaBolivia = 109858000; // hectares
  const totalCoveragePercent = (totalForestHectares / totalAreaBolivia) * 100;

  // Annual loss approximately 150,000-200,000 hectares per year
  const annualLossHectares = 150000 + Math.random() * 50000;

  // Department stats (Santa Cruz has the most forest)
  const departmentStats: DepartmentStats[] = BOLIVIA_DEPARTMENTS.map((dept) => {
    let baseForest = 0;
    switch (dept) {
      case "Santa Cruz":
        baseForest = 15000000;
        break;
      case "Beni":
        baseForest = 12000000;
        break;
      case "Pando":
        baseForest = 8000000;
        break;
      case "La Paz":
        baseForest = 6000000;
        break;
      case "Cochabamba":
        baseForest = 3500000;
        break;
      case "Tarija":
        baseForest = 2000000;
        break;
      case "Chuquisaca":
        baseForest = 1800000;
        break;
      case "Potosí":
        baseForest = 800000;
        break;
      case "Oruro":
        baseForest = 400000;
        break;
      default:
        baseForest = 1000000;
    }

    return {
      department: dept,
      forestAreaHectares: baseForest + Math.random() * 100000,
      coveragePercent: 30 + Math.random() * 40, // Varies by department
      lossLastYear: 5000 + Math.random() * 10000,
    };
  });

  // Historical trend (2000-2023)
  const historicalTrend: HistoricalDataPoint[] = [];
  let currentForest = totalForestHectares + 5000000; // Start with more in 2000

  for (let year = 2000; year <= 2023; year++) {
    const yearlyLoss = 100000 + Math.random() * 100000;
    historicalTrend.push({
      year,
      forestAreaHectares: Math.round(currentForest),
      lossHectares: Math.round(yearlyLoss),
    });
    currentForest -= yearlyLoss;
  }

  return {
    totalForestHectares: Math.round(totalForestHectares),
    totalCoveragePercent: Number(totalCoveragePercent.toFixed(2)),
    annualLossHectares: Math.round(annualLossHectares),
    leadingDepartment: "Santa Cruz",
    departmentStats: departmentStats.sort((a, b) => b.forestAreaHectares - a.forestAreaHectares),
    historicalTrend,
    lastUpdated: new Date(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for force refresh parameter (admin only)
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    // Try to get from cache first
    if (!forceRefresh) {
      const cached = await prisma.apiCache.findUnique({
        where: { cacheKey: CACHE_KEY },
      });

      if (cached && cached.expiresAt > new Date()) {
        return NextResponse.json({
          success: true,
          data: cached.data,
          cached: true,
        });
      }
    }

    // Generate fresh stats
    // TODO: Replace with real GEE integration
    const stats = generateMockForestStats();

    // Update cache
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

    await prisma.apiCache.upsert({
      where: { cacheKey: CACHE_KEY },
      create: {
        cacheKey: CACHE_KEY,
        data: stats as any,
        expiresAt,
      },
      update: {
        data: stats as any,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: stats,
      cached: false,
    });
  } catch (error) {
    console.error("National forest stats error:", error);
    return NextResponse.json(
      {
        error: "Error fetching national forest statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
