import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Leaf, TrendingUp } from "lucide-react";
import { ORGANIZATION_TYPE_LABELS } from "@/types/organization";
import type { OrganizationType } from "@prisma/client";

interface OrganizationCardProps {
  id: string;
  name: string;
  type: OrganizationType;
  contactEmail: string | null;
  contactPhone: string | null;
  totalProjects: number;
  totalHectares: number;
  totalCo2Year: number;
}

export function OrganizationCard({
  id,
  name,
  type,
  contactEmail,
  contactPhone,
  totalProjects,
  totalHectares,
  totalCo2Year,
}: OrganizationCardProps) {
  return (
    <Card className="hover:border-primary transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="line-clamp-1">{name}</CardTitle>
            <CardDescription>
              {ORGANIZATION_TYPE_LABELS[type]}
            </CardDescription>
          </div>
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Info */}
        {(contactEmail || contactPhone) && (
          <div className="space-y-1 text-sm">
            {contactEmail && (
              <p className="text-muted-foreground truncate">
                📧 {contactEmail}
              </p>
            )}
            {contactPhone && (
              <p className="text-muted-foreground">📞 {contactPhone}</p>
            )}
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <div className="text-xs text-muted-foreground">Proyectos</div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {(totalHectares / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-muted-foreground">Hectareas</div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Leaf className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {(totalCo2Year / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-muted-foreground">tCO₂/año</div>
          </div>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link href={`/organizaciones/${id}`}>Ver Detalles</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
