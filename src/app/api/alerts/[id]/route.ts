import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAlertStatusSchema } from "@/lib/validations/alert";
import { AlertStatus } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alert = await prisma.deforestationAlert.findUnique({
      where: {
        id,
      },
    });

    // Fetch near project separately if it exists
    let nearProject = null;
    if (alert?.nearProjectId) {
      nearProject = await prisma.project.findUnique({
        where: { id: alert.nearProjectId },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          areaHectares: true,
          estimatedCo2TonsYear: true,
        },
      });
    }

    if (!alert) {
      return NextResponse.json(
        {
          success: false,
          message: "Alerta no encontrada",
        },
        { status: 404 }
      );
    }

    // TODO: Add GEE analysis for forest loss estimation
    // This would call the GEE API to analyze the area around the alert
    // and estimate forest loss

    return NextResponse.json({
      success: true,
      data: {
        ...alert,
        latitude: Number(alert.latitude),
        longitude: Number(alert.longitude),
        brightness: alert.brightness ? Number(alert.brightness) : null,
        nearProjectDistance: alert.nearProjectDistance ? Number(alert.nearProjectDistance) : null,
        estimatedHectaresLost: alert.estimatedHectaresLost ? Number(alert.estimatedHectaresLost) : null,
        nearProject,
      },
    });
  } catch (error) {
    console.error("Error fetching alert detail:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener detalle de alerta",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateAlertStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos inválidos",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status, notes } = validation.data;

    // Check if alert exists
    const existingAlert = await prisma.deforestationAlert.findUnique({
      where: { id },
    });

    if (!existingAlert) {
      return NextResponse.json(
        {
          success: false,
          message: "Alerta no encontrada",
        },
        { status: 404 }
      );
    }

    // Update alert
    const updatedAlert = await prisma.deforestationAlert.update({
      where: {
        id,
      },
      data: {
        status: status as AlertStatus,
        notes: notes || existingAlert.notes,
        updatedAt: new Date(),
      },
    });

    // Fetch near project separately if it exists
    let nearProject = null;
    if (updatedAlert.nearProjectId) {
      nearProject = await prisma.project.findUnique({
        where: { id: updatedAlert.nearProjectId },
        select: {
          id: true,
          name: true,
        },
      });
    }

    // TODO: Create notification if status changed to RESOLVED
    // This could notify stakeholders that the alert has been addressed

    return NextResponse.json({
      success: true,
      data: {
        ...updatedAlert,
        nearProject,
      },
      message: "Estado de alerta actualizado correctamente",
    });
  } catch (error) {
    console.error("Error updating alert status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al actualizar estado de alerta",
      },
      { status: 500 }
    );
  }
}
