import L from "leaflet";
import { ProjectStatus } from "@prisma/client";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  PENDING: "#eab308", // yellow
  APPROVED: "#3b82f6", // blue
  CERTIFIED: "#22c55e", // green
  ACTIVE: "#15803d", // dark green
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  CERTIFIED: "Certificado",
  ACTIVE: "Activo",
};

export interface ProjectMarkerData {
  id: string;
  name: string;
  status: ProjectStatus;
  type: string;
  areaHectares: number;
  estimatedCo2TonsYear: number | null;
  latitude: number;
  longitude: number;
}

export function createProjectMarker(
  project: ProjectMarkerData,
  onClick?: (project: ProjectMarkerData) => void
): L.Marker {
  const color = STATUS_COLORS[project.status];

  const icon = L.divIcon({
    className: "custom-project-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const marker = L.marker([project.latitude, project.longitude], { icon });

  // Add popup
  const popupContent = `
    <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${project.name}</h3>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Estado:</span>
          <span style="
            background-color: ${color};
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          ">${STATUS_LABELS[project.status]}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Área:</span>
          <span style="font-weight: 500;">${project.areaHectares.toLocaleString("es-BO")} ha</span>
        </div>
        ${
          project.estimatedCo2TonsYear
            ? `
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">CO₂/año:</span>
          <span style="font-weight: 500; color: #22c55e;">${project.estimatedCo2TonsYear.toLocaleString("es-BO")} t</span>
        </div>
        `
            : ""
        }
        <a
          href="/proyectos/${project.id}"
          style="
            display: block;
            text-align: center;
            margin-top: 8px;
            padding: 4px 8px;
            background-color: #f3f4f6;
            color: #374151;
            text-decoration: none;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          "
        >
          Ver Detalle →
        </a>
      </div>
    </div>
  `;

  marker.bindPopup(popupContent);

  // Add click handler
  if (onClick) {
    marker.on("click", () => onClick(project));
  }

  return marker;
}
