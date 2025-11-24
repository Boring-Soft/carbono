import L from "leaflet";

type AlertSeverity = "LOW" | "MEDIUM" | "HIGH";

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  LOW: "#eab308", // yellow
  MEDIUM: "#f97316", // orange
  HIGH: "#ef4444", // red
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

export interface AlertMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  severity: AlertSeverity;
  detectedAt: Date;
  confidence: number | null;
  brightness: number | null;
  nearProjectDistance?: number | null;
}

export function createAlertMarker(
  alert: AlertMarkerData,
  onClick?: (alert: AlertMarkerData) => void
): L.Marker {
  const color = SEVERITY_COLORS[alert.severity];

  const icon = L.divIcon({
    className: "custom-alert-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .7;
          }
        }
      </style>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

  const marker = L.marker([alert.latitude, alert.longitude], { icon });

  // Add popup
  const detectedDate = new Date(alert.detectedAt);
  const popupContent = `
    <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="${color}"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <h3 style="margin: 0; font-size: 14px; font-weight: 600;">Alerta de Deforestación</h3>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Severidad:</span>
          <span style="
            background-color: ${color};
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          ">${SEVERITY_LABELS[alert.severity]}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Detectada:</span>
          <span style="font-weight: 500;">${detectedDate.toLocaleDateString("es-BO")}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Ubicación:</span>
          <span style="font-weight: 500; font-family: monospace; font-size: 10px;">
            ${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}
          </span>
        </div>
        ${
          alert.confidence
            ? `
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Confianza:</span>
          <span style="font-weight: 500;">${alert.confidence}%</span>
        </div>
        `
            : ""
        }
        ${
          alert.nearProjectDistance !== null && alert.nearProjectDistance !== undefined
            ? `
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280;">Proyecto cercano:</span>
          <span style="font-weight: 500; color: #ef4444;">${alert.nearProjectDistance.toFixed(2)} km</span>
        </div>
        `
            : ""
        }
        <a
          href="/alertas/${alert.id}"
          style="
            display: block;
            text-align: center;
            margin-top: 8px;
            padding: 4px 8px;
            background-color: ${color};
            color: white;
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
    marker.on("click", () => onClick(alert));
  }

  return marker;
}
