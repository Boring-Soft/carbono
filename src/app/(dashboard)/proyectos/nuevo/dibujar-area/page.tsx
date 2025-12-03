"use client";

import dynamic from "next/dynamic";

// Dynamically import the component with Leaflet dependencies with SSR disabled
const DibujarAreaClient = dynamic(
  () => import("./dibujar-area-client"),
  {
    ssr: false,
    loading: () => (
      <div className="container mx-auto py-6">
        <div className="text-center py-20 text-muted-foreground">
          Cargando mapa...
        </div>
      </div>
    ),
  }
);

export default function DibujarAreaPage() {
  return <DibujarAreaClient />;
}
