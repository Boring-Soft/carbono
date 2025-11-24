/**
 * Latest Alerts API Route
 * GET /api/alerts/latest
 * Public endpoint to retrieve recent deforestation alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Query parameters
    const hoursParam = searchParams.get('hours');
    const departmentParam = searchParams.get('department');
    const severityParam = searchParams.get('severity');
    const limitParam = searchParams.get('limit');

    // Parse parameters with defaults
    const hours = hoursParam ? parseInt(hoursParam) : 48;
    const limit = limitParam ? parseInt(limitParam) : 100;

    // Validate hours (max 7 days)
    if (hours < 1 || hours > 168) {
      return NextResponse.json(
        { error: 'Hours parameter must be between 1 and 168 (7 days)' },
        { status: 400 }
      );
    }

    // Validate limit (max 500)
    if (limit < 1 || limit > 500) {
      return NextResponse.json(
        { error: 'Limit parameter must be between 1 and 500' },
        { status: 400 }
      );
    }

    // Calculate cutoff time
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Build where clause
    const where: any = {
      detectedAt: {
        gte: cutoffTime,
      },
    };

    if (departmentParam) {
      where.department = departmentParam;
    }

    if (severityParam) {
      const severity = severityParam.toUpperCase();
      if (!['LOW', 'MEDIUM', 'HIGH'].includes(severity)) {
        return NextResponse.json(
          { error: 'Invalid severity. Must be LOW, MEDIUM, or HIGH' },
          { status: 400 }
        );
      }
      where.severity = severity;
    }

    // Fetch alerts
    const alerts = await prisma.deforestationAlert.findMany({
      where,
      select: {
        id: true,
        latitude: true,
        longitude: true,
        confidence: true,
        brightness: true,
        detectedAt: true,
        department: true,
        severity: true,
        status: true,
        nearProjectId: true,
        nearProjectDistance: true,
        estimatedHectaresLost: true,
      },
      orderBy: {
        detectedAt: 'desc',
      },
      take: limit,
    });

    // Calculate statistics
    const stats = {
      total: alerts.length,
      byDepartment: alerts.reduce((acc: Record<string, number>, alert) => {
        const dept = alert.department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: alerts.reduce(
        (acc, alert) => {
          acc[alert.severity]++;
          return acc;
        },
        { LOW: 0, MEDIUM: 0, HIGH: 0 }
      ),
      nearProjects: alerts.filter((a) => a.nearProjectId !== null).length,
      avgConfidence: alerts.length > 0
        ? Math.round(alerts.reduce((sum, a) => sum + a.confidence, 0) / alerts.length)
        : 0,
    };

    return NextResponse.json({
      success: true,
      timeRange: {
        hours,
        from: cutoffTime.toISOString(),
        to: new Date().toISOString(),
      },
      stats,
      alerts,
    });
  } catch (error) {
    console.error('Error fetching latest alerts:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch alerts',
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
