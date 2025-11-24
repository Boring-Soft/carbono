/**
 * Organization Detail API Route
 * GET: Get organization by ID with projects and metrics
 * PATCH: Update organization
 * DELETE: Soft delete organization (only if no active projects)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { updateOrganizationSchema } from '@/lib/validations/organization';
import { ProjectStatus } from '@prisma/client';

/**
 * GET /api/organizations/[id]
 * Get organization details with projects and aggregated metrics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get organization with projects
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        projects: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            areaHectares: true,
            estimatedCo2TonsYear: true,
            department: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, message: 'Organizacion no encontrada' },
        { status: 404 }
      );
    }

    // Calculate metrics
    const metrics = {
      totalProjects: organization.projects.length,
      totalHectares: organization.projects.reduce((sum, p) => sum + Number(p.areaHectares), 0),
      totalCo2Year: organization.projects.reduce(
        (sum, p) => sum + Number(p.estimatedCo2TonsYear || 0),
        0
      ),
      activeProjects: organization.projects.filter(
        (p) => p.status === ProjectStatus.ACTIVE
      ).length,
      certifiedProjects: organization.projects.filter(
        (p) => p.status === ProjectStatus.CERTIFIED
      ).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...organization,
        metrics,
      },
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener organizacion',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizations/[id]
 * Update organization
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateOrganizationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos invalidos',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Check if organization exists
    const existing = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Organizacion no encontrada' },
        { status: 404 }
      );
    }

    // Prepare update data (handle empty strings as null)
    const updateData: Record<string, unknown> = {};
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.type !== undefined) updateData.type = validation.data.type;
    if (validation.data.contactEmail !== undefined) {
      updateData.contactEmail = validation.data.contactEmail || null;
    }
    if (validation.data.contactPhone !== undefined) {
      updateData.contactPhone = validation.data.contactPhone || null;
    }
    if (validation.data.address !== undefined) {
      updateData.address = validation.data.address || null;
    }

    // Update organization
    const updated = await prisma.organization.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { projects: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Organizacion actualizada exitosamente',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar organizacion',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/[id]
 * Soft delete organization (only if no active or certified projects)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if organization exists and get project count
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        projects: {
          where: {
            active: true,
            status: {
              in: [ProjectStatus.ACTIVE, ProjectStatus.CERTIFIED],
            },
          },
          select: { id: true, name: true, status: true },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, message: 'Organizacion no encontrada' },
        { status: 404 }
      );
    }

    // Prevent deletion if has active or certified projects
    if (organization.projects.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No se puede eliminar una organizacion con proyectos activos o certificados',
          activeProjects: organization.projects.length,
          projectNames: organization.projects.map((p) => p.name),
        },
        { status: 400 }
      );
    }

    // Delete organization (cascade will handle related records)
    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Organizacion eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al eliminar organizacion',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
