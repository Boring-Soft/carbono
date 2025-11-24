"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Leaf, DollarSign, Building2, ChevronDown } from "lucide-react";
import { formatUSDCompact } from "@/lib/carbon/market-prices";

interface HeroCarbonoProps {
  metrics: {
    summary: {
      totalProjects: number;
      totalHectares: number;
      totalCo2Year: number;
      revenuePotential: number;
    };
  } | null;
  isLoading?: boolean;
}

export function HeroCarbono({ metrics, isLoading }: HeroCarbonoProps) {
  const scrollToProjects = () => {
    document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative bg-gradient-to-b from-green-50 to-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Proyectos protegen{" "}
            <span className="text-green-600">
              {isLoading || !metrics
                ? "..."
                : `${(metrics.summary.totalHectares / 1000).toLocaleString("es-BO", {
                    maximumFractionDigits: 0,
                  })}K`}
            </span>
            <br />
            hectáreas de bosque
          </h1>
          <p className="text-sm text-muted-foreground">
            De un total de 109.8 millones de hectáreas en Bolivia
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plataforma Nacional de Monitoreo de Proyectos de Carbono y
            Deforestación en tiempo real
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" onClick={scrollToProjects}>
              Ver Proyectos
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/dashboard/carbono">Acceder al Sistema</a>
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        {!isLoading && metrics && (
          <div className="grid gap-6 md:grid-cols-4 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      {metrics.summary.totalProjects}
                    </div>
                    <div className="text-sm text-muted-foreground">Proyectos</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Certificados y activos
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      {(metrics.summary.totalHectares / 1000).toLocaleString("es-BO", {
                        maximumFractionDigits: 0,
                      })}
                      K
                    </div>
                    <div className="text-sm text-muted-foreground">Hectáreas</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Protegidas</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Leaf className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-700">
                      {(metrics.summary.totalCo2Year / 1000).toLocaleString("es-BO", {
                        maximumFractionDigits: 0,
                      })}
                      K
                    </div>
                    <div className="text-sm text-muted-foreground">tCO₂/año</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Captura anual</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-700">
                      {formatUSDCompact(metrics.summary.revenuePotential)}
                    </div>
                    <div className="text-sm text-muted-foreground">USD/año</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Potencial de ingresos</p>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-4 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-2">
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-12 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
