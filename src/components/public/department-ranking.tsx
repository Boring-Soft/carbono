"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, MapPin } from "lucide-react";

interface DepartmentRank {
  department: string;
  projectCount: number;
  hectares: number;
  co2TonsYear: number;
}

interface DepartmentRankingProps {
  ranking: DepartmentRank[];
}

export function DepartmentRanking({ ranking }: DepartmentRankingProps) {
  const maxHectares = ranking[0]?.hectares || 1;

  return (
    <section id="departamentos" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ranking por Departamento
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Los departamentos con mayor área de conservación
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Top 5 Departamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ranking.map((dept, index) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-white ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-600"
                          : "bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{dept.department}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dept.projectCount} proyecto{dept.projectCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {dept.hectares.toLocaleString("es-BO", {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">hectáreas</div>
                  </div>
                </div>
                <Progress value={(dept.hectares / maxHectares) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {dept.co2TonsYear.toLocaleString("es-BO", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    tCO₂/año
                  </span>
                  <span>{((dept.hectares / maxHectares) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
