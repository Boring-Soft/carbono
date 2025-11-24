"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { ProjectMarkerData } from "@/components/maps/project-marker";

// Dynamic import to avoid SSR issues
const CarbonMap = dynamic(
  () =>
    import("@/components/dashboard/carbono/carbon-map").then(
      (mod) => mod.CarbonMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface PublicMapProps {
  projects: ProjectMarkerData[];
}

export function PublicMap({ projects }: PublicMapProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mapa de Proyectos
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explora la ubicación de todos los proyectos certificados en Bolivia
          </p>
        </div>

        <div className="rounded-lg overflow-hidden shadow-lg border">
          <CarbonMap
            projects={projects}
            alerts={[]}
            showProjects={true}
            showAlerts={false}
            className="w-full h-[600px]"
          />
        </div>
      </div>
    </section>
  );
}
