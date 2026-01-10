/**
 * Audit Logging Utilities
 * Provides functions to log user actions for security and compliance
 */

import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
export type AuditEntity = 'PROJECT' | 'ORGANIZATION' | 'USER' | 'DOCUMENT' | 'ALERT' | 'REPORT';

interface AuditLogData {
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityName?: string;
  changes?: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Extract IP address from request headers
 */
export function getClientIp(request: NextRequest): string {
  // Try different headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (forwarded) {
    // x-forwarded-for can be a comma-separated list, take the first one
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(request: NextRequest): string | null {
  return request.headers.get('user-agent');
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  request: NextRequest,
  data: AuditLogData
): Promise<void> {
  try {
    const user = await getCurrentUser();
    const ipAddress = getClientIp(request);
    const userAgent = getUserAgent(request);

    await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        entityName: data.entityName,
        userId: user?.id,
        userEmail: user?.email,
        ipAddress,
        userAgent,
        changes: data.changes,
        metadata: data.metadata,
      },
    });

    console.log(
      `📝 Audit: ${data.action} ${data.entity} [${data.entityId}] by ${user?.email || 'anonymous'} from ${ipAddress}`
    );
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Create audit log for project deletion
 */
export async function auditProjectDelete(
  request: NextRequest,
  project: { id: string; name: string }
): Promise<void> {
  await createAuditLog(request, {
    action: 'DELETE',
    entity: 'PROJECT',
    entityId: project.id,
    entityName: project.name,
    metadata: {
      softDelete: true,
    } as Prisma.InputJsonValue,
  });
}

/**
 * Create audit log for project update
 */
export async function auditProjectUpdate(
  request: NextRequest,
  projectId: string,
  projectName: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Promise<void> {
  const changes: Record<string, unknown> = {};

  // Track what changed
  for (const key in newData) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = {
        before: oldData[key],
        after: newData[key],
      };
    }
  }

  await createAuditLog(request, {
    action: 'UPDATE',
    entity: 'PROJECT',
    entityId: projectId,
    entityName: projectName,
    changes: changes as Prisma.InputJsonValue,
  });
}

/**
 * Create audit log for project creation
 */
export async function auditProjectCreate(
  request: NextRequest,
  project: { id: string; name: string }
): Promise<void> {
  await createAuditLog(request, {
    action: 'CREATE',
    entity: 'PROJECT',
    entityId: project.id,
    entityName: project.name,
  });
}

/**
 * Create audit log for project status change
 */
export async function auditProjectStatusChange(
  request: NextRequest,
  projectId: string,
  projectName: string,
  fromStatus: string | null,
  toStatus: string,
  notes?: string
): Promise<void> {
  await createAuditLog(request, {
    action: 'STATUS_CHANGE',
    entity: 'PROJECT',
    entityId: projectId,
    entityName: projectName,
    changes: {
      status: {
        before: fromStatus,
        after: toStatus,
      },
    } as Prisma.InputJsonValue,
    metadata: notes ? ({ notes } as Prisma.InputJsonValue) : undefined,
  });
}
