/**
 * Individual Project API Route
 * GET /api/projects/[id] - Get project details with relations
 * PATCH /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Soft delete project
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateProjectSchema } from '@/lib/validations/project';
import { calculatePolygonArea, validatePolygon } from '@/lib/geo/turf-utils';
import { calculateCarbonCapture } from '@/lib/carbon/calculator';
import { analyzeArea } from '@/lib/gee/client';
import { ForestType } from '@/types/gee';
import { Prisma } from '@prisma/client';

export const maxDuration = 60;

/**
 * GET /api/projects/[id]
 * Get project details with all relations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        organization: true,
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        carbonCredits: {
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get recent alerts near this project
    const recentAlerts = await prisma.deforestationAlert.findMany({
      where: {
        nearProjectId: id,
        detectedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        severity: true,
        detectedAt: true,
        nearProjectDistance: true,
      },
      orderBy: { detectedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        recentAlerts,
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update project and recalculate CO₂ if needed
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const input = updateProjectSchema.parse(body);

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if active
    if (!existingProject.active) {
      return NextResponse.json(
        { error: 'Cannot update inactive project' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Prisma.ProjectUpdateInput = {};

    // Simple field updates
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.department !== undefined) updateData.department = input.department;
    if (input.municipality !== undefined) updateData.municipality = input.municipality;
    if (input.communities !== undefined) updateData.communities = input.communities;
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.durationYears !== undefined) updateData.durationYears = input.durationYears;

    if (input.coBenefits !== undefined) {
      updateData.coBenefits = input.coBenefits ? JSON.stringify(input.coBenefits) : null;
    }

    if (input.organizationId !== undefined) {
      // Verify organization exists
      const org = await prisma.organization.findUnique({
        where: { id: input.organizationId },
      });
      if (!org) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      updateData.organization = {
        connect: { id: input.organizationId },
      };
    }

    // Check if geometry or type changed (requires CO₂ recalculation)
    let needsRecalculation = false;
    let newAreaHectares = Number(existingProject.areaHectares);

    if (input.geometry) {
      // Validate new geometry
      const validation = validatePolygon(input.geometry);
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: 'Invalid geometry',
            details: validation.errors,
          },
          { status: 400 }
        );
      }

      // Calculate new area
      newAreaHectares = calculatePolygonArea(input.geometry);
      updateData.geometry = input.geometry as Prisma.InputJsonValue;
      updateData.areaHectares = newAreaHectares;
      needsRecalculation = true;
    }

    if (input.type) {
      updateData.type = input.type;
      needsRecalculation = true;
    }

    // Recalculate CO₂ if needed
    if (needsRecalculation) {
      console.log(`🔄 Recalculating CO₂ for project ${id}...`);

      const projectType = input.type || existingProject.type;

      // Analyze with GEE if geometry changed
      let geeAnalysis = null;
      if (input.geometry) {
        try {
          geeAnalysis = await analyzeArea(input.geometry);
          updateData.geeVerified = true;
          updateData.geeLastCheck = new Date();
          updateData.forestCoveragePercent = geeAnalysis.forestCoveragePercent;
        } catch (error) {
          console.error('GEE analysis failed during update:', error);
        }
      }

      // Calculate carbon
      const forestType: ForestType = geeAnalysis?.forestType || ForestType.UNKNOWN;
      const carbonCalc = calculateCarbonCapture({
        areaHectares: newAreaHectares,
        projectType,
        forestType,
        biomassPerHectare: geeAnalysis?.biomassPerHectare,
        durationYears: input.durationYears || existingProject.durationYears || undefined,
      });

      updateData.estimatedCo2TonsYear = carbonCalc.estimatedCo2TonsYear;
      console.log(`✓ New CO₂ estimate: ${carbonCalc.estimatedCo2TonsYear} tCO₂/year`);
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        organization: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProject,
      recalculated: needsRecalculation,
    });
  } catch (error) {
    console.error('Error updating project:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to update project',
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

/**
 * DELETE /api/projects/[id]
 * Soft delete project (mark as inactive)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.active) {
      return NextResponse.json(
        { error: 'Project already inactive' },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.project.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting project:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
