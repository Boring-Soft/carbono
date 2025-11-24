/**
 * GEE Area Analysis API Route
 * POST /api/gee/analyze-area
 * Analyzes a geographic area using Google Earth Engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeArea } from '@/lib/gee/client';
import { withCache, CacheSource } from '@/lib/cache/api-cache';
import { GEEAreaAnalysisInput } from '@/types/gee';

export const maxDuration = 60; // 60 seconds for GEE computation

export async function POST(request: NextRequest) {
  try {
    const body: GEEAreaAnalysisInput = await request.json();

    // Validate input
    if (!body.geometry) {
      return NextResponse.json(
        { error: 'Missing required field: geometry' },
        { status: 400 }
      );
    }

    // Validate geometry type
    if (
      body.geometry.type !== 'Polygon' &&
      body.geometry.type !== 'MultiPolygon'
    ) {
      return NextResponse.json(
        {
          error: 'Invalid geometry type. Must be Polygon or MultiPolygon',
        },
        { status: 400 }
      );
    }

    // Validate coordinates exist
    if (!body.geometry.coordinates || body.geometry.coordinates.length === 0) {
      return NextResponse.json(
        { error: 'Geometry must have coordinates' },
        { status: 400 }
      );
    }

    console.log(
      `📡 Analyzing area with GEE (Project: ${body.projectId || 'N/A'})...`
    );

    // Use cache to avoid redundant GEE calls
    const result = await withCache(
      CacheSource.GEE_ANALYZE_AREA,
      {
        geometry: body.geometry,
        projectId: body.projectId,
      },
      async () => {
        return await analyzeArea(body.geometry);
      }
    );

    console.log('✓ GEE analysis completed successfully');

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error analyzing area with GEE:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to analyze area',
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method to check API status
export async function GET() {
  return NextResponse.json({
    service: 'GEE Area Analysis',
    status: 'operational',
    method: 'POST',
    description: 'Analyzes forest coverage, biomass, and forest type for a given area',
    example: {
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-65.0, -16.0],
            [-64.0, -16.0],
            [-64.0, -17.0],
            [-65.0, -17.0],
            [-65.0, -16.0],
          ],
        ],
      },
      projectId: 'optional-project-id',
    },
  });
}
