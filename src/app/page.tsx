import { HeroCarbono } from "@/components/public/hero-carbono";
import { PublicMap } from "@/components/public/public-map";
import { FeaturedProjects } from "@/components/public/featured-projects";
import { DepartmentRanking } from "@/components/public/department-ranking";
import { HowItWorks } from "@/components/public/how-it-works";
import { ContactForm } from "@/components/public/contact-form";
import { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "CARBONO Bolivia - Plataforma Nacional de Monitoreo de Carbono",
  description:
    "Monitoreo en tiempo real de proyectos de carbono y deforestación en Bolivia. Plataforma oficial para la transparencia y gestión de créditos de carbono.",
};

export const revalidate = 3600; // Revalidate every hour

async function getPublicMetrics() {
  try {
    // Fetch data directly from database instead of API
    const [
      activeProjects,
      totalAreaAndCO2,
      recentAlerts,
      departmentStats,
    ] = await Promise.all([
      prisma.project.findMany({
        where: {
          active: true,
          status: { in: [ProjectStatus.ACTIVE, ProjectStatus.CERTIFIED] },
        },
        select: {
          id: true,
          name: true,
          type: true,
          department: true,
          areaHectares: true,
          estimatedCo2TonsYear: true,
        },
      }),
      prisma.project.aggregate({
        where: {
          active: true,
          status: { in: [ProjectStatus.ACTIVE, ProjectStatus.CERTIFIED] },
        },
        _sum: {
          areaHectares: true,
          estimatedCo2TonsYear: true,
        },
      }),
      prisma.deforestationAlert.count({
        where: {
          detectedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.project.groupBy({
        by: ['department'],
        where: {
          active: true,
          status: { in: [ProjectStatus.ACTIVE, ProjectStatus.CERTIFIED] },
        },
        _sum: {
          estimatedCo2TonsYear: true,
          areaHectares: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const departmentRanking = departmentStats
      .map((stat) => ({
        department: stat.department,
        co2TonsYear: stat._sum.estimatedCo2TonsYear?.toNumber() || 0,
        hectares: stat._sum.areaHectares?.toNumber() || 0,
        projectCount: stat._count.id,
      }))
      .sort((a, b) => b.co2TonsYear - a.co2TonsYear)
      .slice(0, 5);

    const totalCO2Year = totalAreaAndCO2._sum.estimatedCo2TonsYear?.toNumber() || 0;
    const totalHectares = totalAreaAndCO2._sum.areaHectares?.toNumber() || 0;

    return {
      summary: {
        totalProjects: activeProjects.length,
        totalHectares,
        totalCo2Year: totalCO2Year,
        revenuePotential: totalCO2Year * 15, // Estimate at $15/ton
      },
      recentAlerts,
      featuredProjects: activeProjects.slice(0, 6).map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        department: p.department,
        areaHectares: p.areaHectares.toNumber(),
        estimatedCo2TonsYear: p.estimatedCo2TonsYear?.toNumber() || 0,
      })),
      departmentRanking,
    };
  } catch (error) {
    console.error("Error fetching public metrics:", error);
    return null;
  }
}

async function getPublicProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        active: true,
        status: { in: [ProjectStatus.CERTIFIED, ProjectStatus.ACTIVE] },
      },
      select: {
        id: true,
        name: true,
        status: true,
        type: true,
        areaHectares: true,
        estimatedCo2TonsYear: true,
        geometry: true,
      },
    });

    // Transform to marker data
    return projects.map((project) => {
      // Extract centroid from geometry
      const geometry = project.geometry as { type: string; coordinates: number[][][] };
      const coordinates = geometry.coordinates[0];
      const lats = coordinates.map((coord: number[]) => coord[1]);
      const lngs = coordinates.map((coord: number[]) => coord[0]);
      const latitude = lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
      const longitude = lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length;

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        type: project.type,
        areaHectares: project.areaHectares.toNumber(),
        estimatedCo2TonsYear: project.estimatedCo2TonsYear?.toNumber() || 0,
        latitude,
        longitude,
      };
    });
  } catch (error) {
    console.error("Error fetching public projects:", error);
    return [];
  }
}

export default async function Home() {
  const [metrics, projects] = await Promise.all([
    getPublicMetrics(),
    getPublicProjects(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroCarbono metrics={metrics} />
      <PublicMap projects={projects} />
      {metrics && <FeaturedProjects projects={metrics.featuredProjects || []} />}
      {metrics && <DepartmentRanking ranking={metrics.departmentRanking || []} />}
      <HowItWorks />
      <ContactForm />
    </div>
  );
}
