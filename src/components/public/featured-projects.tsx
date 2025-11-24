"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Leaf } from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  REDD_PLUS: "REDD+",
  REFORESTATION: "Reforestación",
  RENEWABLE_ENERGY: "Energía Renovable",
  REGENERATIVE_AGRICULTURE: "Agricultura Regenerativa",
  COMMUNITY_CONSERVATION: "Conservación Comunitaria",
};

interface FeaturedProject {
  id: string;
  name: string;
  type: string;
  department: string;
  areaHectares: number;
  estimatedCo2TonsYear: number;
}

interface FeaturedProjectsProps {
  projects: FeaturedProject[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  return (
    <section id="proyectos" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Proyectos Destacados
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Los proyectos con mayor captura de CO₂ en Bolivia
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                    <Badge variant="outline">{TYPE_LABELS[project.type]}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {project.department}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <div className="text-2xl font-bold">
                      {project.areaHectares.toLocaleString("es-BO", {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">hectáreas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                      <Leaf className="h-5 w-5" />
                      {(project.estimatedCo2TonsYear / 1000).toLocaleString("es-BO", {
                        maximumFractionDigits: 1,
                      })}
                      K
                    </div>
                    <div className="text-xs text-muted-foreground">tCO₂/año</div>
                  </div>
                </div>

                <Link href={`/proyectos/${project.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    Ver Detalles
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/dashboard/proyectos">
            <Button size="lg" variant="outline">
              Ver Todos los Proyectos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
