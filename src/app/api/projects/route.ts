/**
 * Projects API Route
 * GET /api/projects - List projects with filters and pagination
 * POST /api/projects - Create a new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createProjectSchema, projectQuerySchema } from '@/lib/validations/project';
import { calculatePolygonArea, validatePolygon } from '@/lib/geo/turf-utils';
import { calculateCarbonCapture } from '@/lib/carbon/calculator';
import { analyzeForestCoverage } from '@/lib/gee/client';
import { ForestType } from '@/types/gee';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const maxDuration = 60; // 60 seconds for GEE analysis

/**
 * GET /api/projects
 * List projects with filters, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const queryParams = Object.fromEntries(searchParams.entries());
    const query = projectQuerySchema.parse(queryParams);

    // Build where clause
    const where: Prisma.ProjectWhereInput = {
      active: true,
    };

    if (query.department) {
      where.department = query.department;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.geeVerified !== undefined) {
      where.geeVerified = query.geeVerified;
    }

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = query.dateFrom;
      }
      if (query.dateTo) {
        where.createdAt.lte = query.dateTo;
      }
    }

    // Calculate pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // Build orderBy
    const orderBy: Prisma.ProjectOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Fetch projects and total count
    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to fetch projects',
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
 * POST /api/projects
 * Create a new project with GEE analysis and carbon calculation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const input = createProjectSchema.parse(body);

    console.log(`📝 Creating new project: ${input.name}`);

    // 1. Validate geometry
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

    // 2. Calculate area
    const areaHectares = calculatePolygonArea(input.geometry);
    console.log(`📐 Calculated area: ${areaHectares} ha`);

    // 3. Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: input.organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // 4. Analyze area with Google Earth Engine
    console.log('🛰️ Analyzing area with GEE...');
    let forestCoverage;
    try {
      forestCoverage = await analyzeForestCoverage(input.geometry);
      console.log('✓ GEE analysis completed');
    } catch (geeError) {
      console.error('GEE analysis failed:', geeError);
      // Continue without GEE data (will use IPCC factors as fallback)
      forestCoverage = null;
    }

    // 5. Calculate carbon capture
    const forestType: ForestType = ForestType.TROPICAL; // Default for Bolivia
    const biomassPerHectare = forestCoverage
      ? (forestCoverage.treeCoverDensity / 100) * 200 // Estimate based on tree cover
      : undefined;

    const carbonCalc = calculateCarbonCapture({
      areaHectares,
      projectType: input.type,
      forestType,
      biomassPerHectare,
      durationYears: input.durationYears || undefined,
    });

    console.log(`🌳 Estimated CO₂: ${carbonCalc.estimatedCo2TonsYear} tCO₂/year`);

    // 6. Create project in database
    const project = await prisma.project.create({
      data: {
        name: input.name,
        type: input.type,
        description: input.description,
        geometry: input.geometry as Prisma.InputJsonValue,
        areaHectares,
        estimatedCo2TonsYear: carbonCalc.estimatedCo2TonsYear,
        department: input.department,
        municipality: input.municipality,
        organizationId: input.organizationId,
        communities: input.communities,
        coBenefits: input.coBenefits ? JSON.stringify(input.coBenefits) : null,
        startDate: input.startDate,
        durationYears: input.durationYears,
        geeVerified: forestCoverage !== null,
        geeLastCheck: forestCoverage ? new Date() : null,
        forestCoveragePercent: forestCoverage?.forestCoveragePercent || null,
        createdBy: input.createdBy,
      },
      include: {
        organization: true,
      },
    });

    console.log(`✓ Project created: ${project.id}`);

    // 7. Create initial status history entry
    await prisma.projectStatusHistory.create({
      data: {
        projectId: project.id,
        toStatus: 'PENDING',
        changedBy: input.createdBy,
        notes: 'Proyecto creado',
      },
    });

    // Return project with analysis data
    return NextResponse.json(
      {
        success: true,
        data: {
          project,
          geeAnalysis: forestCoverage
            ? {
                totalAreaHectares: forestCoverage.totalAreaHectares,
                forestAreaHectares: forestCoverage.forestAreaHectares,
                forestCoveragePercent: forestCoverage.forestCoveragePercent,
                treeCoverDensity: forestCoverage.treeCoverDensity,
              }
            : null,
          carbonEstimate: {
            estimatedCo2TonsYear: carbonCalc.estimatedCo2TonsYear,
            methodology: carbonCalc.methodology,
            revenueEstimate: carbonCalc.revenueEstimate,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        {
          error: 'Validation error',
          message: firstError.message,
          field: firstError.path.join('.'),
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to create project',
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
