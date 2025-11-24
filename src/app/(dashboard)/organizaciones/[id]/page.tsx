import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Mail, Phone, MapPin, Leaf, Users } from "lucide-react";
import { ORGANIZATION_TYPE_LABELS } from "@/types/organization";
import { DeleteOrganizationButton } from "@/components/organizaciones/delete-organization-button";

async function getOrganization(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/organizations/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching organization:", error);
    return null;
  }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  CERTIFIED: "Certificado",
  ACTIVE: "Activo",
};

const TYPE_LABELS: Record<string, string> = {
  REDD_PLUS: "REDD+",
  REFORESTATION: "Reforestacion",
  RENEWABLE_ENERGY: "Energia Renovable",
  REGENERATIVE_AGRICULTURE: "Agricultura Regenerativa",
  COMMUNITY_CONSERVATION: "Conservacion Comunitaria",
};

export default async function OrganizacionDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const organization = await getOrganization(params.id);

  if (!organization) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/organizaciones">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
          <p className="text-muted-foreground mt-1">
            {ORGANIZATION_TYPE_LABELS[organization.type as keyof typeof ORGANIZATION_TYPE_LABELS]}
          </p>
        </div>
        <DeleteOrganizationButton
          organizationId={organization.id}
          organizationName={organization.name}
          hasActiveProjects={organization.metrics.activeProjects > 0 || organization.metrics.certifiedProjects > 0}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.metrics.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {organization.metrics.activeProjects} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hectareas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(organization.metrics.totalHectares / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Protegidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">tCO₂/año</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(organization.metrics.totalCo2Year / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Captura anual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization.metrics.certifiedProjects}
            </div>
            <p className="text-xs text-muted-foreground">Proyectos</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      {(organization.contactEmail || organization.contactPhone || organization.address) && (
        <Card>
          <CardHeader>
            <CardTitle>Informacion de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {organization.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${organization.contactEmail}`}
                  className="text-sm hover:underline"
                >
                  {organization.contactEmail}
                </a>
              </div>
            )}
            {organization.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${organization.contactPhone}`}
                  className="text-sm hover:underline"
                >
                  {organization.contactPhone}
                </a>
              </div>
            )}
            {organization.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{organization.address}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos</CardTitle>
          <CardDescription>
            Lista de todos los proyectos de esta organizacion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organization.projects.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No hay proyectos</p>
              <p className="text-muted-foreground mb-4">
                Esta organizacion aun no tiene proyectos registrados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {organization.projects.map((project: typeof organization.projects[0]) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{project.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {STATUS_LABELS[project.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {TYPE_LABELS[project.type]} • {project.department}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-medium">
                      {project.areaHectares.toLocaleString("es-BO", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      ha
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {project.estimatedCo2TonsYear
                        ? `${(project.estimatedCo2TonsYear / 1000).toFixed(1)}K tCO₂/año`
                        : "-"}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/proyectos/${project.id}`}>Ver Detalle</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
