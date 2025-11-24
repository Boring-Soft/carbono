/**
 * Project Status Change API Route
 * PATCH /api/projects/[id]/status
 * Changes project status, logs history, and creates notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateProjectStatusSchema } from '@/lib/validations/project';
import { ProjectStatus } from '@prisma/client';

/**
 * PATCH /api/projects/[id]/status
 * Change project status with history tracking and notifications
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const input = updateProjectStatusSchema.parse(body);

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.active) {
      return NextResponse.json(
        { error: 'Cannot change status of inactive project' },
        { status: 400 }
      );
    }

    // Check if status is actually changing
    if (project.status === input.status) {
      return NextResponse.json(
        { error: 'Project already has this status' },
        { status: 400 }
      );
    }

    const oldStatus = project.status;
    const newStatus = input.status;

    console.log(`🔄 Changing project ${id} status: ${oldStatus} → ${newStatus}`);

    // Validate status transition
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      PENDING: ['APPROVED'],
      APPROVED: ['CERTIFIED', 'ACTIVE', 'PENDING'],
      CERTIFIED: ['ACTIVE'],
      ACTIVE: ['CERTIFIED'],
    };

    if (!validTransitions[oldStatus]?.includes(newStatus)) {
      return NextResponse.json(
        {
          error: 'Invalid status transition',
          message: `Cannot change from ${oldStatus} to ${newStatus}`,
        },
        { status: 400 }
      );
    }

    // Perform update in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update project status
      const updatedProject = await tx.project.update({
        where: { id },
        data: { status: newStatus },
        include: {
          organization: true,
        },
      });

      // 2. Create status history entry
      await tx.projectStatusHistory.create({
        data: {
          projectId: id,
          fromStatus: oldStatus,
          toStatus: newStatus,
          changedBy: input.changedBy,
          notes: input.notes,
        },
      });

      // 3. Create notification if status is CERTIFIED
      if (newStatus === 'CERTIFIED') {
        console.log('🎉 Project certified! Creating notification...');

        // Get all SUPERADMIN users
        const superadmins = await tx.profile.findMany({
          where: {
            role: 'SUPERADMIN',
            active: true,
          },
          select: {
            userId: true,
          },
        });

        if (superadmins.length > 0) {
          await tx.notification.createMany({
            data: superadmins.map((admin) => ({
              userId: admin.userId,
              type: 'project_certified',
              title: '🎉 Proyecto Certificado',
              message: `El proyecto "${project.name}" ha sido certificado exitosamente.`,
              link: `/proyectos/${id}`,
            })),
          });

          console.log(`✓ Created ${superadmins.length} notification(s)`);
        }
      }

      return updatedProject;
    });

    console.log(`✓ Status changed successfully`);

    return NextResponse.json({
      success: true,
      data: result,
      statusChange: {
        from: oldStatus,
        to: newStatus,
      },
    });
  } catch (error) {
    console.error('Error changing project status:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to change project status',
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
 * GET /api/projects/[id]/status
 * Get project status history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get status history
    const history = await prisma.projectStatusHistory.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        project,
        history,
      },
    });
  } catch (error) {
    console.error('Error fetching status history:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
