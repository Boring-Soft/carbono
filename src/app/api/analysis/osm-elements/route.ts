import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { analyzeArea } from "@/lib/geo/area-analyzer";

/**
 * OSM Elements Analysis API
 *
 * This endpoint analyzes a given polygon geometry using real OpenStreetMap data:
 * - Trees (via OSM tags + estimation)
 * - Rivers and water bodies (Overpass API)
 * - Houses and buildings (Overpass API)
 * - Communities and settlements (Overpass API)
 *
 * Uses Overpass API for real data collection
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { geometry } = body;

    if (!geometry || geometry.type !== "Polygon") {
      return NextResponse.json({ error: "Invalid geometry provided" }, { status: 400 });
    }

    // Run comprehensive area analysis with Overpass API
    const analysisResult = await analyzeArea(geometry, {
      includeOSM: true,
      includeForest: false, // Only OSM for this endpoint
      includeTrees: true,
    });

    // Return OSM-specific data
    return NextResponse.json({
      success: true,
      data: {
        areaHectares: analysisResult.areaHectares,
        trees: analysisResult.trees.estimate,
        rivers: analysisResult.waterways.total,
        houses: analysisResult.buildings.total,
        communities: analysisResult.communities.total,
        details: {
          waterways: analysisResult.waterways,
          buildings: analysisResult.buildings,
          communities: analysisResult.communities,
          treeEstimation: analysisResult.trees,
        },
        note: "Data sourced from OpenStreetMap via Overpass API",
      },
    });
  } catch (error) {
    console.error("OSM elements analysis error:", error);
    return NextResponse.json(
      {
        error: "Error analyzing OSM elements",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
