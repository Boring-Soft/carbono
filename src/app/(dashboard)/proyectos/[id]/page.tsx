import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProjectDetailView } from "@/components/proyectos/project-detail-view";
import { prisma } from "@/lib/prisma";

async function getProject(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
        carbonCredits: true,
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    // Get recent alerts within 5km (skip if PostGIS not available)
    let recentAlerts: Awaited<ReturnType<typeof prisma.deforestationAlert.findMany>> = [];
    try {
      recentAlerts = await prisma.deforestationAlert.findMany({
        where: {
          detectedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        orderBy: {
          detectedAt: "desc",
        },
        take: 10,
      });
    } catch (error) {
      console.error("Error fetching alerts:", error);
      // Continue without alerts if query fails
    }

    // Serialize Decimal fields to Number for Client Components
    return {
      ...project,
      areaHectares: Number(project.areaHectares),
      estimatedCo2TonsYear: project.estimatedCo2TonsYear ? Number(project.estimatedCo2TonsYear) : null,
      forestCoveragePercent: project.forestCoveragePercent ? Number(project.forestCoveragePercent) : null,
      carbonCredits: project.carbonCredits.map((credit) => ({
        ...credit,
        tonsCo2: Number(credit.tonsCo2),
        pricePerTon: credit.pricePerTon ? Number(credit.pricePerTon) : null,
      })),
      recentAlerts: recentAlerts.map((alert) => ({
        ...alert,
        latitude: Number(alert.latitude),
        longitude: Number(alert.longitude),
        brightness: alert.brightness ? Number(alert.brightness) : null,
        nearProjectDistance: alert.nearProjectDistance ? Number(alert.nearProjectDistance) : undefined,
        estimatedHectaresLost: alert.estimatedHectaresLost ? Number(alert.estimatedHectaresLost) : null,
      })),
    };
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export default async function ProyectoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/proyectos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground mt-1">
            {project.organization.name} • {project.department}
          </p>
        </div>
      </div>

      <ProjectDetailView project={project} />
    </div>
  );
}
