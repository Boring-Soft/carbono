import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: organizations,
      count: organizations.length,
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener organizaciones",
      },
      { status: 500 }
    );
  }
}
