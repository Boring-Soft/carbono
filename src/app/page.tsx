import { HeroCarbono } from "@/components/public/hero-carbono";
import { PublicMap } from "@/components/public/public-map";
import { FeaturedProjects } from "@/components/public/featured-projects";
import { DepartmentRanking } from "@/components/public/department-ranking";
import { HowItWorks } from "@/components/public/how-it-works";
import { ContactForm } from "@/components/public/contact-form";
import { ProjectStatus } from "@prisma/client";

export const metadata = {
  title: "CARBONO Bolivia - Plataforma Nacional de Monitoreo de Carbono",
  description:
    "Monitoreo en tiempo real de proyectos de carbono y deforestación en Bolivia. Plataforma oficial para la transparencia y gestión de créditos de carbono.",
};

export const revalidate = 3600; // Revalidate every hour

async function getPublicMetrics() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/metrics`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching public metrics:", error);
    return null;
  }
}

async function getPublicProjects() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/projects?status=${ProjectStatus.CERTIFIED}&status=${ProjectStatus.ACTIVE}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Transform to marker data
    return data.data.map((project: any) => {
      // Extract centroid from geometry
      const coordinates = project.geometry.coordinates[0];
      const lats = coordinates.map((coord: number[]) => coord[1]);
      const lngs = coordinates.map((coord: number[]) => coord[0]);
      const latitude = lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
      const longitude = lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length;

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        type: project.type,
        areaHectares: project.areaHectares,
        estimatedCo2TonsYear: project.estimatedCo2TonsYear,
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
