/**
 * NASA FIRMS Cron Job
 * GET /api/cron/fetch-nasa-firms
 * Fetches active fires from NASA FIRMS and creates deforestation alerts
 * Runs every 3 hours via Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNASAFIRMSClient } from '@/lib/nasa-firms/client';
import { parseNASAFIRMSData, calculateSeverity, deduplicateAlerts } from '@/lib/nasa-firms/parser';
import { prisma } from '@/lib/prisma';
import { distance, point } from '@turf/turf';
import { AlertSeverity } from '@prisma/client';

export const maxDuration = 60; // 60 seconds for fetching and processing

/**
 * Find nearest project to an alert location
 */
async function findNearestProject(
  latitude: number,
  longitude: number,
  maxDistanceKm: number = 5
): Promise<{ projectId: string; distance: number } | null> {
  // Get all active and certified projects
  const projects = await prisma.project.findMany({
    where: {
      active: true,
      status: {
        in: ['ACTIVE', 'CERTIFIED', 'APPROVED'],
      },
    },
    select: {
      id: true,
      geometry: true,
    },
  });

  let nearestProject: { projectId: string; distance: number } | null = null;
  let minDistance = Infinity;

  const alertPoint = point([longitude, latitude]);

  for (const project of projects) {
    try {
      // Extract a representative point from project geometry (centroid or first coordinate)
      const geometry = project.geometry as { type: string; coordinates: number[][][] | number[][][][] };
      let projectPoint;

      if (geometry.type === 'Polygon') {
        const coords = geometry.coordinates[0][0] as number[];
        projectPoint = point([coords[0], coords[1]]);
      } else if (geometry.type === 'MultiPolygon') {
        const coords = geometry.coordinates[0][0][0] as number[];
        projectPoint = point([coords[0], coords[1]]);
      } else {
        continue;
      }

      const dist = distance(alertPoint, projectPoint, { units: 'kilometers' });

      if (dist < maxDistanceKm && dist < minDistance) {
        minDistance = dist;
        nearestProject = {
          projectId: project.id,
          distance: dist,
        };
      }
    } catch (error) {
      console.error(`Error calculating distance for project ${project.id}:`, error);
    }
  }

  return nearestProject;
}

/**
 * Create notification for high severity alert
 */
async function createNotificationForAlert(
  alertId: string,
  department: string | null,
  projectId: string | null
) {
  try {
    // Get all SUPERADMIN users
    const superadmins = await prisma.profile.findMany({
      where: {
        role: 'SUPERADMIN',
        active: true,
      },
      select: {
        userId: true,
      },
    });

    if (superadmins.length === 0) {
      console.log('No SUPERADMIN users found for notifications');
      return;
    }

    const title = projectId
      ? '⚠️ Alerta de deforestación cerca de proyecto'
      : '⚠️ Nueva alerta de deforestación';

    const message = projectId
      ? `Se detectó una alerta de alta severidad cerca de un proyecto activo en ${department || 'ubicación desconocida'}.`
      : `Se detectó una alerta de alta severidad en ${department || 'ubicación desconocida'}.`;

    // Create notifications for all superadmins
    await prisma.notification.createMany({
      data: superadmins.map((admin) => ({
        userId: admin.userId,
        type: 'deforestation_alert',
        title,
        message,
        link: `/alertas/${alertId}`,
      })),
    });

    console.log(`✓ Created ${superadmins.length} notification(s) for alert ${alertId}`);
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('🔥 Starting NASA FIRMS cron job...');

    // Fetch data from NASA FIRMS
    const client = getNASAFIRMSClient();
    const csvData = await client.fetchBoliviaFires(1); // Last 24 hours

    console.log(`📡 Received CSV data (${csvData.length} bytes)`);

    // Parse CSV data
    const alerts = parseNASAFIRMSData(csvData);
    console.log(`📊 Parsed ${alerts.length} fire alerts`);

    if (alerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new alerts found',
        alertsProcessed: 0,
        alertsCreated: 0,
      });
    }

    // Deduplicate alerts
    const uniqueAlerts = deduplicateAlerts(alerts);
    console.log(`🔍 After deduplication: ${uniqueAlerts.length} unique alerts`);

    // Filter alerts that already exist in DB
    const newAlerts = [];
    for (const alert of uniqueAlerts) {
      const exists = await prisma.deforestationAlert.findFirst({
        where: {
          latitude: alert.latitude,
          longitude: alert.longitude,
          detectedAt: {
            gte: new Date(alert.acquisitionDate.getTime() - 3600000), // Within 1 hour
            lte: new Date(alert.acquisitionDate.getTime() + 3600000),
          },
        },
      });

      if (!exists) {
        newAlerts.push(alert);
      }
    }

    console.log(`✨ Found ${newAlerts.length} new alerts to insert`);

    // Process and insert new alerts
    let alertsCreated = 0;
    let highSeverityCount = 0;

    for (const alert of newAlerts) {
      try {
        const severity = calculateSeverity(alert);

        // Find nearest project
        const nearestProject = await findNearestProject(
          alert.latitude,
          alert.longitude,
          5 // 5km radius
        );

        // Create alert in database
        const createdAlert = await prisma.deforestationAlert.create({
          data: {
            latitude: alert.latitude,
            longitude: alert.longitude,
            confidence: alert.confidence,
            brightness: alert.brightness,
            detectedAt: alert.acquisitionDate,
            department: alert.department || null,
            severity: severity as AlertSeverity,
            nearProjectId: nearestProject?.projectId || null,
            nearProjectDistance: nearestProject?.distance || null,
          },
        });

        alertsCreated++;

        // Create notification for high severity alerts
        if (severity === 'HIGH') {
          highSeverityCount++;
          await createNotificationForAlert(
            createdAlert.id,
            alert.department || null,
            nearestProject?.projectId || null
          );
        }
      } catch (error) {
        console.error('Error creating alert:', error);
      }
    }

    console.log(`✓ Created ${alertsCreated} new alerts`);
    console.log(`⚠️ ${highSeverityCount} high severity alerts`);

    return NextResponse.json({
      success: true,
      message: 'NASA FIRMS cron job completed successfully',
      alertsProcessed: uniqueAlerts.length,
      alertsCreated,
      highSeverityCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in NASA FIRMS cron job:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Cron job failed',
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
