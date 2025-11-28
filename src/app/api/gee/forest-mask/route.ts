import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getForestMask } from "@/lib/gee/client";
import { calculatePolygonArea } from "@/lib/geo/turf-utils";

/**
 * Forest Mask API
 *
 * Extracts forest-only polygons from a given area using GEE forest coverage data.
 * Can return multiple polygon fragments if the forest is fragmented within the area.
 *
 * Query params:
 * - threshold: Forest density threshold 0-100 (default: 70%)
 * - simplify: Simplification tolerance in meters (default: 50m)
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
    const { geometry, threshold = 70, simplify = 50 } = body;

    if (!geometry || geometry.type !== "Polygon") {
      return NextResponse.json({ error: "Invalid geometry provided" }, { status: 400 });
    }

    // Validate threshold
    if (threshold < 10 || threshold > 100) {
      return NextResponse.json(
        { error: "Threshold must be between 10 and 100" },
        { status: 400 }
      );
    }

    // Calculate original area
    const originalAreaHectares = calculatePolygonArea(geometry);

    // Get forest mask from GEE
    const forestMask = await getForestMask(geometry, {
      threshold,
      simplifyTolerance: simplify,
    });

    // Extract forest polygons
    const forestPolygons: GeoJSON.Polygon[] = [];
    let totalForestAreaHectares = 0;

    forestMask.features.forEach((feature) => {
      if (feature.geometry.type === "Polygon") {
        forestPolygons.push(feature.geometry as GeoJSON.Polygon);
        totalForestAreaHectares += calculatePolygonArea(
          feature.geometry as GeoJSON.Polygon
        );
      } else if (feature.geometry.type === "MultiPolygon") {
        // Handle multiple forest fragments
        const multiPoly = feature.geometry as GeoJSON.MultiPolygon;
        multiPoly.coordinates.forEach((polyCoords) => {
          const poly: GeoJSON.Polygon = {
            type: "Polygon",
            coordinates: polyCoords,
          };
          forestPolygons.push(poly);
          totalForestAreaHectares += calculatePolygonArea(poly);
        });
      }
    });

    const excludedAreaHectares = originalAreaHectares - totalForestAreaHectares;
    const reductionPercent = (excludedAreaHectares / originalAreaHectares) * 100;

    return NextResponse.json({
      success: true,
      data: {
        originalAreaHectares,
        forestAreaHectares: totalForestAreaHectares,
        excludedAreaHectares,
        reductionPercent: Number(reductionPercent.toFixed(2)),
        fragmentCount: forestPolygons.length,
        forestPolygons,
        metadata: {
          threshold,
          simplifyTolerance: simplify,
          processedAt: new Date().toISOString(),
          source: "Google Earth Engine - Hansen Global Forest Change",
        },
      },
    });
  } catch (error) {
    console.error("Forest mask API error:", error);
    return NextResponse.json(
      {
        error: "Error generating forest mask",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
