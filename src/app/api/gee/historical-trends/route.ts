/**
 * GEE Historical Trends API Route
 * POST /api/gee/historical-trends
 * Retrieves historical NDVI and forest cover trends for an area
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNDVITimeSeries, detectForestLoss } from '@/lib/gee/client';
import { withCache, CacheSource } from '@/lib/cache/api-cache';
import { GEEHistoricalTrendsInput } from '@/types/gee';

export const maxDuration = 60; // 60 seconds for GEE computation

export async function POST(request: NextRequest) {
  try {
    const body: GEEHistoricalTrendsInput = await request.json();

    // Validate input
    if (!body.geometry || !body.startDate || !body.endDate) {
      return NextResponse.json(
        {
          error: 'Missing required fields: geometry, startDate, endDate',
        },
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

    // Parse dates
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    // Limit to 2 years of data to avoid excessive computation
    const twoYearsMs = 2 * 365 * 24 * 60 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() > twoYearsMs) {
      return NextResponse.json(
        {
          error: 'Date range too large. Maximum 2 years allowed',
        },
        { status: 400 }
      );
    }

    console.log(
      `📡 Fetching historical trends from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`
    );

    // Use cache to avoid redundant GEE calls
    const result = await withCache(
      CacheSource.GEE_HISTORICAL_TRENDS,
      {
        geometry: body.geometry,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      async () => {
        // Get NDVI time series
        const ndviTimeSeries = await getNDVITimeSeries(
          body.geometry,
          startDate,
          endDate
        );

        // Detect forest loss events
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        const lossData = await detectForestLoss(
          body.geometry,
          startYear,
          endYear
        );

        // Build deforestation events from loss data
        const deforestationEvents = [];
        if (lossData.hasLoss && lossData.lastChangeYear) {
          deforestationEvents.push({
            date: new Date(`${lossData.lastChangeYear}-12-31`),
            areaLostHectares: 0, // Would need additional calculation
            severity: lossData.lossPercent > 10 ? 'HIGH' : lossData.lossPercent > 5 ? 'MEDIUM' : 'LOW',
            confidence: 85,
          });
        }

        // Generate forest cover time series (simplified - one point per year)
        const forestCoverTimeSeries = [];
        for (let year = startYear; year <= endYear; year++) {
          forestCoverTimeSeries.push({
            date: new Date(`${year}-06-15`), // Mid-year
            coveragePercent: 100 - (lossData.lossPercent * (year - startYear) / (endYear - startYear)),
            areaHectares: 0, // Would need area calculation
          });
        }

        return {
          ndviTimeSeries,
          forestCoverTimeSeries,
          deforestationEvents,
        };
      }
    );

    console.log(`✓ Retrieved ${result.ndviTimeSeries.length} NDVI data points`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching historical trends:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch historical trends',
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
    service: 'GEE Historical Trends',
    status: 'operational',
    method: 'POST',
    description: 'Retrieves NDVI time series and deforestation events for an area',
    maxDateRange: '2 years',
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
      startDate: '2022-01-01',
      endDate: '2023-12-31',
    },
  });
}
