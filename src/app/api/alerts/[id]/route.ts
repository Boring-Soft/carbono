import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAlertStatusSchema } from "@/lib/validations/alert";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alert = await prisma.deforestationAlert.findUnique({
      where: {
        id: params.id,
      },
      include: {
        nearProject: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            areaHectares: true,
            estimatedCo2TonsYear: true,
          },
        },
      },
    });

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
      data: alert,
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
  { params }: { params: { id: string } }
) {
  try {
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
      where: { id: params.id },
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
        id: params.id,
      },
      data: {
        status,
        notes: notes || existingAlert.notes,
        updatedAt: new Date(),
      },
      include: {
        nearProject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // TODO: Create notification if status changed to RESOLVED
    // This could notify stakeholders that the alert has been addressed

    return NextResponse.json({
      success: true,
      data: updatedAlert,
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
