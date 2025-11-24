import {
  Home,
  Leaf,
  TreePine,
  AlertTriangle,
  Building2,
  FileText,
  Command,
  Map,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "Usuario CARBONO",
    email: "usuario@carbono.bo",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "CARBONO Bolivia",
      logo: Leaf,
      plan: "Nacional",
    },
  ],
  navGroups: [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/carbono",
          icon: Home,
        },
        {
          title: "Proyectos",
          url: "/proyectos",
          icon: TreePine,
        },
        {
          title: "Alertas",
          url: "/alertas",
          icon: AlertTriangle,
        },
        {
          title: "Organizaciones",
          url: "/organizaciones",
          icon: Building2,
        },
        {
          title: "Reportes",
          url: "/reportes",
          icon: FileText,
        },
        {
          title: "Mapa",
          url: "/dashboard/carbono#mapa",
          icon: Map,
        },
      ],
    },
  ],
};
