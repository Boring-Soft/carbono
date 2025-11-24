"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus, Search, Users, Leaf } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { OrganizationCard } from "@/components/organizaciones/organization-card";

interface Project {
  id: string;
  name: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  createdAt: Date;
  projects: Project[];
  metrics: {
    totalProjects: number;
    totalHectares: number;
    totalCo2Year: number;
  };
}

async function fetchOrganizations(search?: string, type?: string): Promise<Organization[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (type && type !== "all") params.append("type", type);

  const response = await fetch(`/api/organizations?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Error al cargar organizaciones");
  }

  const data = await response.json();
  return data.data || [];
}

export default function OrganizacionesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    data: organizations = [],
    isLoading,
  } = useQuery({
    queryKey: ["organizations", search, typeFilter],
    queryFn: () => fetchOrganizations(search, typeFilter),
  });

  const stats = {
    total: organizations.length,
    community: organizations.filter((o) => o.type === "Community").length,
    ngo: organizations.filter((o) => o.type === "NGO").length,
    government: organizations.filter((o) => o.type === "Government").length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizaciones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las organizaciones responsables de proyectos de carbono
          </p>
        </div>
        <Button asChild>
          <Link href="/organizaciones/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Organización
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Organizaciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comunidades</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.community}</div>
            <p className="text-xs text-muted-foreground">Comunidades indígenas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ONGs</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ngo}</div>
            <p className="text-xs text-muted-foreground">Organizaciones no gubernamentales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gobierno</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.government}</div>
            <p className="text-xs text-muted-foreground">Entidades gubernamentales</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar organizaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="Community">Comunidad</SelectItem>
            <SelectItem value="NGO">ONG</SelectItem>
            <SelectItem value="Government">Gobierno</SelectItem>
            <SelectItem value="Private">Privado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Organizations List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando organizaciones...</p>
        </div>
      ) : organizations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay organizaciones</p>
            <p className="text-muted-foreground mb-4">
              Crea tu primera organización para comenzar
            </p>
            <Button asChild>
              <Link href="/organizaciones/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Organización
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              id={org.id}
              name={org.name}
              type={org.type as "Community" | "NGO" | "Government" | "Private"}
              contactEmail={org.contactEmail}
              contactPhone={org.contactPhone}
              totalProjects={org.metrics.totalProjects}
              totalHectares={org.metrics.totalHectares}
              totalCo2Year={org.metrics.totalCo2Year}
            />
          ))}
        </div>
      )}
    </div>
  );
}
