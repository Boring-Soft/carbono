import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateCarbonCaptureByDepartment } from "@/lib/carbon/calculator";
import { ProjectType } from "@prisma/client";

/**
 * Admin endpoint to recalculate CO2 estimates for all projects
 *
 * Este endpoint debe ejecutarse después de actualizar los factores IPCC
 * para corregir los valores de CO2 en proyectos existentes.
 *
 * IMPORTANTE: Solo para uso administrativo
 *
 * GET /api/admin/recalculate-carbon
 */

export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 Iniciando recalculación de estimaciones de CO2...");

    // Obtener todos los proyectos activos
    const projects = await prisma.project.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        department: true,
        areaHectares: true,
        estimatedCo2TonsYear: true,
        durationYears: true,
      },
    });

    console.log(`📊 Encontrados ${projects.length} proyectos para recalcular`);

    const updates = [];
    const errors = [];

    for (const project of projects) {
      try {
        // Recalcular CO2 usando los factores IPCC actualizados
        const carbonCalc = calculateCarbonCaptureByDepartment(
          project.areaHectares,
          project.type as ProjectType,
          project.department,
          project.durationYears || undefined
        );

        const oldCo2 = project.estimatedCo2TonsYear;
        const newCo2 = carbonCalc.estimatedCo2TonsYear;

        // Actualizar proyecto
        await prisma.project.update({
          where: { id: project.id },
          data: {
            estimatedCo2TonsYear: newCo2,
          },
        });

        updates.push({
          id: project.id,
          name: project.name,
          department: project.department,
          areaHectares: project.areaHectares,
          oldCo2,
          newCo2,
          change: ((newCo2 - oldCo2) / oldCo2) * 100,
        });

        console.log(
          `  ✓ ${project.name}: ${oldCo2.toFixed(2)} → ${newCo2.toFixed(2)} tCO2/año (${((newCo2 - oldCo2) / oldCo2 * 100).toFixed(1)}%)`
        );
      } catch (error) {
        console.error(`  ✗ Error en proyecto ${project.id}:`, error);
        errors.push({
          id: project.id,
          name: project.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const summary = {
      totalProjects: projects.length,
      successfulUpdates: updates.length,
      failedUpdates: errors.length,
      updates: updates.map((u) => ({
        project: `${u.name} (${u.department})`,
        area: `${u.areaHectares} ha`,
        before: `${u.oldCo2.toFixed(2)} tCO2/año`,
        after: `${u.newCo2.toFixed(2)} tCO2/año`,
        change: `${u.change.toFixed(1)}%`,
      })),
      errors,
    };

    console.log(`\n✅ Recalculación completada:`);
    console.log(`   - Proyectos actualizados: ${updates.length}`);
    console.log(`   - Errores: ${errors.length}`);

    return NextResponse.json({
      success: true,
      message: `Recalculados ${updates.length} de ${projects.length} proyectos`,
      summary,
    });
  } catch (error) {
    console.error("❌ Error en recalculación:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al recalcular proyectos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
