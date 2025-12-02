import { NextRequest, NextResponse } from "next/server";
import { queryCommunities, queryWaterways, queryBuildings } from "@/lib/osm/client";
import { estimateTreesSimple } from "@/lib/geo/tree-estimation";
import { calculatePolygonArea, isPolygonInBolivia } from "@/lib/geo/turf-utils";
import { snapPolygonToForest } from "@/lib/gee/client";

export const maxDuration = 60; // 60 seconds for complete analysis

/**
 * Area Analysis API
 *
 * POST /api/analysis/area
 *
 * Analyzes a drawn polygon and returns:
 * - Tree estimation (min/max/average)
 * - Communities within or near the area
 * - Waterways (rivers, streams)
 * - Buildings count
 * - Optional: Snapped polygon to forest boundaries
 *
 * This provides instant feedback when users draw an area on the map.
 */

interface AnalysisRequest {
  geometry: GeoJSON.Polygon;
  snapToForest?: boolean; // Auto-adjust to forest boundaries
  threshold?: number; // Forest cover threshold for snapping (default 70%)
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { geometry, snapToForest = false, threshold = 70 } = body;

    // Validate input
    if (!geometry || geometry.type !== "Polygon") {
      return NextResponse.json(
        { error: "Invalid geometry. Expected GeoJSON Polygon." },
        { status: 400 }
      );
    }

    // Validate polygon is in Bolivia
    const inBolivia = isPolygonInBolivia(geometry);
    if (!inBolivia) {
      return NextResponse.json(
        { error: "El polígono debe estar dentro del territorio boliviano" },
        { status: 400 }
      );
    }

    // Calculate area
    const areaHectares = calculatePolygonArea(geometry);
    if (areaHectares < 1) {
      return NextResponse.json(
        { error: "El área mínima debe ser de 1 hectárea" },
        { status: 400 }
      );
    }

    console.log(`📊 Analyzing area: ${areaHectares.toFixed(2)} ha`);

    // Run analysis in parallel
    const [treeEstimation, communities, waterways, buildings, snappedResult] =
      await Promise.all([
        // 1. Estimate trees
        Promise.resolve(estimateTreesSimple(areaHectares)),

        // 2. Query communities from OSM
        queryCommunities(geometry).catch((err) => {
          console.error("Communities query failed:", err);
          return [];
        }),

        // 3. Query waterways from OSM
        queryWaterways(geometry).catch((err) => {
          console.error("Waterways query failed:", err);
          return [];
        }),

        // 4. Query buildings from OSM
        queryBuildings(geometry).catch((err) => {
          console.error("Buildings query failed:", err);
          return [];
        }),

        // 5. Snap to forest boundaries if requested
        snapToForest
          ? snapPolygonToForest(geometry, { threshold }).catch((err) => {
              console.error("Snap to forest failed:", err);
              return null;
            })
          : Promise.resolve(null),
      ]);

    console.log("✓ Analysis completed:");
    console.log(`  - Trees: ${treeEstimation.minTrees} - ${treeEstimation.maxTrees}`);
    console.log(`  - Communities: ${communities.length}`);
    console.log(`  - Waterways: ${waterways.length}`);
    console.log(`  - Buildings: ${buildings.length}`);

    // Build response
    const response = {
      area: {
        original: areaHectares,
        adjusted: snappedResult?.snappedAreaHectares || areaHectares,
        unit: "hectares",
      },
      trees: {
        min: treeEstimation.minTrees,
        max: treeEstimation.maxTrees,
        average: treeEstimation.averageTrees,
        confidence: treeEstimation.confidence,
        densityLevel: treeEstimation.densityLevel,
        treesPerHectare: treeEstimation.treesPerHectare,
      },
      communities: {
        total: communities.length,
        items: communities.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          population: c.population,
          coordinates: {
            latitude: c.latitude,
            longitude: c.longitude,
          },
        })),
      },
      waterways: {
        total: waterways.length,
        items: waterways.map((w) => ({
          id: w.id,
          name: w.name,
          type: w.type,
        })),
      },
      buildings: {
        total: buildings.length,
      },
      snapped: snappedResult
        ? {
            geometry: snappedResult.snappedGeometry,
            adjustmentMade: snappedResult.adjustmentMade,
            forestCoverage: snappedResult.forestCoveragePercent,
          }
        : null,
      metadata: {
        analyzedAt: new Date().toISOString(),
        processingTimeMs: Date.now(),
        dataSource: {
          trees: "Estimated from forest density",
          communities: "OpenStreetMap",
          waterways: "OpenStreetMap",
          buildings: "OpenStreetMap",
          forest: "Google Earth Engine (Hansen Global Forest Change)",
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Area analysis error:", error);
    return NextResponse.json(
      {
        error: "Error analyzing area",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
