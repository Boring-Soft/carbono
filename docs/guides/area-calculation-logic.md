# Lógica de Cálculo de Áreas - Guía Técnica

## Introducción

Esta guía documenta las fórmulas matemáticas, conversiones de unidades y metodologías utilizadas para calcular áreas geográficas en el sistema CARBONO. Incluye ejemplos de código y consideraciones sobre proyecciones geográficas.

## Unidades y Conversiones

### Unidades Utilizadas

| Unidad | Símbolo | Uso Principal |
|--------|---------|---------------|
| Metros cuadrados | m² | Cálculos intermedios |
| Hectáreas | ha | Display en UI, base de datos |
| Kilómetros cuadrados | km² | Reporting, comparaciones |
| Acres | ac | Conversión internacional (opcional) |

### Fórmulas de Conversión

```javascript
// Metros cuadrados a Hectáreas
const hectares = squareMeters / 10000;

// Hectáreas a Kilómetros cuadrados
const km2 = hectares / 100;

// Metros cuadrados a Kilómetros cuadrados
const km2 = squareMeters / 1000000;

// Hectáreas a Acres (opcional)
const acres = hectares * 2.47105;
```

### Implementación en CARBONO

**Ubicación:** `src/lib/geo/turf-utils.ts`

```typescript
import * as turf from "@turf/turf";

export function calculatePolygonArea(polygon: GeoJSON.Polygon): number {
  // Turf.js retorna área en metros cuadrados
  const areaSquareMeters = turf.area(polygon);

  // Convertir a hectáreas
  const areaHectares = areaSquareMeters / 10000;

  return areaHectares;
}
```

## Proyecciones Geográficas

### Sistema de Coordenadas

**CARBONO utiliza WGS84 (EPSG:4326)**

- **Latitud:** -23° a -10° (Bolivia bounds)
- **Longitud:** -70° a -58° (Bolivia bounds)
- **Formato:** Decimal degrees (DD)
- **Orden:** [longitude, latitude] (GeoJSON standard)

### ¿Por qué WGS84?

1. **Estándar GeoJSON:** Formato nativo de GeoJSON
2. **Compatibilidad:** Leaflet, Google Maps, OSM usan WGS84
3. **Simplicidad:** No requiere reproyección

### Consideraciones de Distorsión

**Problema:** WGS84 es una proyección esférica, no planar. Las áreas calculadas en grados tienen distorsión.

**Solución:** Turf.js usa la fórmula de área geodésica que compensa la curvatura terrestre.

## Fórmulas Matemáticas

### 1. Fórmula Shoelace (Gauss)

**Uso:** Cálculo rápido de área de polígono en coordenadas planas.

**Limitación:** ⚠️ **No usar directamente en coordenadas geográficas** (distorsión alta)

```javascript
function shoelaceArea(coordinates) {
  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n - 1; i++) {
    area += coordinates[i][0] * coordinates[i + 1][1];
    area -= coordinates[i + 1][0] * coordinates[i][1];
  }

  return Math.abs(area) / 2;
}

// ⚠️ Esto NO es correcto para lat/lon
const wrongArea = shoelaceArea(coordinates);

// ✅ Correcto: Usar Turf.js
const correctArea = turf.area(polygon);
```

### 2. Fórmula Geodésica (Turf.js)

**Turf.js usa:**
- Algoritmo de área geodésica sobre elipsoide WGS84
- Compensa curvatura terrestre
- Preciso para cualquier tamaño de polígono

**Precisión:**
- ±0.5% para polígonos < 10,000 km²
- ±0.1% para polígonos < 1,000 km²

### 3. Haversine Distance

**Uso:** Calcular distancia entre dos puntos en la esfera terrestre.

**Fórmula:**
```
a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
c = 2 * atan2(√a, √(1−a))
d = R * c
```

Donde:
- φ = latitud en radianes
- λ = longitud en radianes
- R = radio de la Tierra (6371 km)

**Implementación:**

```typescript
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en kilómetros
}
```

**Uso en CARBONO:**
- Calcular longitud de ríos
- Distancia entre proyecto y alerta de deforestación
- Validar separación mínima entre proyectos

## Validación de Polígonos

### 1. Validar Bolivia Bounds

```typescript
const BOLIVIA_BOUNDS = {
  minLat: -23,
  maxLat: -10,
  minLon: -70,
  maxLon: -58,
};

export function isPolygonInBolivia(polygon: GeoJSON.Polygon): boolean {
  const coordinates = polygon.coordinates[0];

  return coordinates.every(([lon, lat]) => {
    return (
      lat >= BOLIVIA_BOUNDS.minLat &&
      lat <= BOLIVIA_BOUNDS.maxLat &&
      lon >= BOLIVIA_BOUNDS.minLon &&
      lon <= BOLIVIA_BOUNDS.maxLon
    );
  });
}
```

### 2. Detectar Auto-Intersecciones

**Problema:** Polígonos con lados que se cruzan son inválidos.

```typescript
import * as turf from "@turf/turf";

export function hasS elfIntersections(polygon: GeoJSON.Polygon): boolean {
  try {
    // Turf.js kinks detecta intersecciones
    const kinks = turf.kinks(polygon);
    return kinks.features.length > 0;
  } catch {
    return true; // Asumir inválido si hay error
  }
}
```

### 3. Área Mínima y Máxima

```typescript
export function validateArea(
  polygon: GeoJSON.Polygon
): { valid: boolean; error?: string } {
  const area = calculatePolygonArea(polygon);

  if (area < 1) {
    return {
      valid: false,
      error: "Área mínima: 1 hectárea",
    };
  }

  if (area > 100000) {
    return {
      valid: false,
      error: "Área máxima: 100,000 hectáreas",
    };
  }

  return { valid: true };
}
```

## Cálculos de Carbono

### Constantes IPCC

```typescript
// Biomasa aérea promedio (tons/ha) para bosques tropicales
const AVERAGE_BIOMASS_TONS_PER_HECTARE = 200;

// Fracción de carbono en biomasa
const CARBON_FRACTION = 0.47; // 47%

// Factor de conversión CO2/C (peso molecular)
const CO2_CONVERSION_FACTOR = 3.67; // (44/12)

// Tasa de crecimiento anual
const ANNUAL_GROWTH_RATE = 0.02; // 2% para bosques tropicales
```

### Fórmula de Captura de CO₂

```typescript
export function calculateCO2Sequestration(
  forestAreaHectares: number
): {
  biomass: number;
  carbonStock: number;
  co2TonsPerYear: number;
} {
  // 1. Calcular biomasa total
  const biomass = forestAreaHectares * AVERAGE_BIOMASS_TONS_PER_HECTARE;

  // 2. Calcular stock de carbono
  const carbonStock = biomass * CARBON_FRACTION;

  // 3. Calcular captura anual de CO₂
  const co2TonsPerYear =
    carbonStock * ANNUAL_GROWTH_RATE * CO2_CONVERSION_FACTOR;

  return {
    biomass,
    carbonStock,
    co2TonsPerYear,
  };
}
```

**Ejemplo:**
```typescript
const result = calculateCO2Sequestration(1000); // 1000 hectáreas

console.log(result);
// {
//   biomass: 200000 tons,
//   carbonStock: 94000 tons C,
//   co2TonsPerYear: 6897 tons CO₂/año
// }
```

### Valor Económico

```typescript
// Precio de carbono (USD/ton CO₂)
const CARBON_PRICE_LOW = 5;   // Mercado voluntario bajo
const CARBON_PRICE_MID = 15;  // Mercado voluntario promedio
const CARBON_PRICE_HIGH = 30; // Mercado compliance

export function calculateCarbonValue(
  co2TonsPerYear: number,
  years: number = 10
): {
  totalCO2: number;
  valueLow: number;
  valueMid: number;
  valueHigh: number;
} {
  const totalCO2 = co2TonsPerYear * years;

  return {
    totalCO2,
    valueLow: totalCO2 * CARBON_PRICE_LOW,
    valueMid: totalCO2 * CARBON_PRICE_MID,
    valueHigh: totalCO2 * CARBON_PRICE_HIGH,
  };
}
```

## Ejemplos de Código

### Ejemplo 1: Validación Completa

```typescript
import {
  calculatePolygonArea,
  isPolygonInBolivia,
  hasSelfIntersections
} from "@/lib/geo/turf-utils";

async function validateAndCalculate(polygon: GeoJSON.Polygon) {
  // 1. Validar bounds de Bolivia
  if (!isPolygonInBolivia(polygon)) {
    throw new Error("El polígono debe estar dentro de Bolivia");
  }

  // 2. Detectar auto-intersecciones
  if (hasSelfIntersections(polygon)) {
    throw new Error("El polígono no puede tener auto-intersecciones");
  }

  // 3. Calcular área
  const areaHectares = calculatePolygonArea(polygon);

  // 4. Validar rango
  if (areaHectares < 1) {
    throw new Error("Área mínima: 1 hectárea");
  }

  if (areaHectares > 100000) {
    throw new Error("Área máxima: 100,000 hectáreas");
  }

  // 5. Calcular métricas de carbono
  const carbonMetrics = calculateCO2Sequestration(areaHectares);

  return {
    areaHectares,
    ...carbonMetrics,
  };
}
```

### Ejemplo 2: Cálculo de Centroide

```typescript
import * as turf from "@turf/turf";

export function getPolygonCentroid(
  polygon: GeoJSON.Polygon
): [number, number] {
  const centroid = turf.centroid(polygon);
  return centroid.geometry.coordinates as [number, number];
}

// Uso
const polygon = {
  type: "Polygon",
  coordinates: [[
    [-64.0, -16.0],
    [-64.0, -17.0],
    [-65.0, -17.0],
    [-65.0, -16.0],
    [-64.0, -16.0],
  ]],
};

const [lon, lat] = getPolygonCentroid(polygon);
console.log(`Centroide: ${lat}, ${lon}`);
```

### Ejemplo 3: Buffer (Zona de Amortiguamiento)

```typescript
import * as turf from "@turf/turf";

export function createBuffer(
  polygon: GeoJSON.Polygon,
  radiusKm: number
): GeoJSON.Polygon {
  const buffered = turf.buffer(polygon, radiusKm, { units: "kilometers" });
  return buffered.geometry as GeoJSON.Polygon;
}

// Uso: Crear zona de 5km alrededor del proyecto
const bufferZone = createBuffer(projectPolygon, 5);
```

## Precisión y Errores

### Fuentes de Error

1. **Error de Turf.js:** ±0.1% - 0.5%
2. **Error de usuario (dibujo):** ±1-5%
3. **Error de GPS:** ±10-50 metros
4. **Error de simplificación:** ±0.5% (tolerance 50m)

### Mejores Prácticas

```typescript
// ✅ BUENO: Usar Turf.js para cálculos geodésicos
const area = turf.area(polygon) / 10000;

// ❌ MALO: Calcular área con Shoelace en lat/lon
const area = shoelaceFormula(coordinates);

// ✅ BUENO: Validar antes de calcular
if (isPolygonInBolivia(polygon)) {
  const area = calculatePolygonArea(polygon);
}

// ❌ MALO: Asumir que el polígono es válido
const area = calculatePolygonArea(polygon);

// ✅ BUENO: Manejar errores
try {
  const area = calculatePolygonArea(polygon);
} catch (error) {
  console.error("Error calculando área:", error);
}
```

## Troubleshooting

### Problema: Áreas calculadas son incorrectas

**Posibles causas:**
1. Orden incorrecto de coordenadas (lat, lon vs lon, lat)
2. Polígono no cerrado (primer y último punto diferentes)
3. Auto-intersecciones no detectadas

**Solución:**
```typescript
// Verificar orden: GeoJSON usa [lon, lat]
const coords = polygon.coordinates[0];
console.log("Primer punto:", coords[0]); // Debe ser [lon, lat]

// Verificar cierre
const first = coords[0];
const last = coords[coords.length - 1];
console.log("Cerrado:", first[0] === last[0] && first[1] === last[1]);

// Validar con Turf.js
const kinks = turf.kinks(polygon);
console.log("Intersecciones:", kinks.features.length);
```

### Problema: Performance lenta en polígonos grandes

**Solución:**
```typescript
// Simplificar geometría antes de calcular
import * as turf from "@turf/turf";

const simplified = turf.simplify(polygon, {
  tolerance: 0.001, // ~100 metros
  highQuality: false,
});

const area = calculatePolygonArea(simplified);
```

### Problema: Diferencias con Google Earth

**Causa:** Google Earth usa proyección Mercator Web, CARBONO usa WGS84.

**Solución:** Las diferencias son normales (<1%). Turf.js es más preciso para cálculos científicos.

## Referencias

- **Turf.js Documentation:** https://turfjs.org/
- **GeoJSON Specification:** https://geojson.org/
- **IPCC Guidelines:** https://www.ipcc-nggip.iges.or.jp/
- **Hansen Global Forest Change:** https://earthenginepartners.appspot.com/science-2013-global-forest
- **WGS84 Datum:** https://en.wikipedia.org/wiki/World_Geodetic_System

## Glosario

- **WGS84:** World Geodetic System 1984, sistema de coordenadas global
- **EPSG:4326:** Código EPSG para WGS84
- **Geodésico:** Cálculos que consideran la curvatura terrestre
- **Planar:** Cálculos en superficie plana (2D)
- **Proyección:** Método para representar esfera en plano
- **Hectárea:** 10,000 m² o 100m × 100m
- **Biomasa:** Masa total de organismos vivos en un área
- **Stock de carbono:** Cantidad de carbono almacenado
