# Arquitectura del Sistema de Análisis de Áreas

## Descripción General

El sistema de análisis de áreas de CARBONO es un conjunto de módulos integrados que permiten analizar, validar y procesar áreas geográficas para proyectos de carbono en Bolivia. Combina datos de Google Earth Engine (GEE), OpenStreetMap (OSM) y cálculos geoespaciales locales.

## Diagrama de Flujo del Sistema

```
┌─────────────────┐
│   Usuario Web   │
└────────┬────────┘
         │
         │ 1. Dibuja polígono
         ▼
┌─────────────────────┐
│ ProjectMapDrawer    │
│ - Leaflet + Draw    │
│ - Validación local  │
└────────┬────────────┘
         │
         │ 2. Geometría GeoJSON.Polygon
         ▼
┌──────────────────────────────┐
│   useAreaAnalysis Hook       │
│   - Gestión de estados       │
│   - Progress tracking        │
│   - Retry logic              │
└────────┬─────────────────────┘
         │
         │ 3. API Requests (paralelos)
         ▼
    ┌────┴──────────────────────┐
    │                            │
    ▼                            ▼
┌──────────────┐        ┌──────────────────┐
│ /api/analysis│        │ /api/analysis/   │
│ /forest      │        │ osm-elements     │
└──────┬───────┘        └────────┬─────────┘
       │                         │
       │ 4. Server-side          │
       │ Processing              │
       ▼                         ▼
┌──────────────┐        ┌──────────────────┐
│ GEE Client   │        │ Area Analyzer    │
│ - Forest     │        │ - OSM Client     │
│ - Coverage   │        │ - Parser         │
│ - Biomass    │        │ - Calculations   │
└──────┬───────┘        └────────┬─────────┘
       │                         │
       │ 5. External APIs        │
       ▼                         ▼
┌──────────────┐        ┌──────────────────┐
│ Google Earth │        │ Overpass API     │
│ Engine       │        │ (OpenStreetMap)  │
└──────┬───────┘        └────────┬─────────┘
       │                         │
       └────────┬────────────────┘
                │
                │ 6. Resultados combinados
                ▼
        ┌───────────────────┐
        │ AreaAnalysisResult│
        │ - Forest metrics  │
        │ - Trees           │
        │ - Waterways       │
        │ - Buildings       │
        │ - Communities     │
        └─────────┬─────────┘
                  │
                  │ 7. UI Display
                  ▼
        ┌──────────────────────┐
        │ AreaAnalysisLoader   │
        │ - Progress bar       │
        │ - Stage indicators   │
        │ - Educational tips   │
        └──────────────────────┘
```

## Componentes Principales

### 1. Frontend Layer

#### `useAreaAnalysis` Hook
**Ubicación:** `src/hooks/use-area-analysis.ts`

**Responsabilidades:**
- Gestión de estados del análisis (idle, analyzing, success, error)
- Ejecución de llamadas API en paralelo
- Progress tracking con 5 etapas
- Retry logic con exponential backoff
- Cancelación de análisis en progreso

**Estados:**
```typescript
type AnalysisStage =
  | "idle"
  | "connecting"
  | "analyzing-forest"
  | "counting-elements"
  | "calculating-metrics"
  | "finalizing"
  | "success"
  | "error";
```

#### `AreaAnalysisLoader` Component
**Ubicación:** `src/components/maps/area-analysis-loader.tsx`

**Características:**
- Progress bar animado (0-100%)
- 5 stage indicators
- Estimación de tiempo restante
- Educational tips por etapa
- Botones Cancel/Retry

### 2. API Layer

#### `/api/analysis/forest` Route
**Ubicación:** `src/app/api/analysis/forest/route.ts`

**Función:** Análisis de cobertura forestal usando GEE

**Input:**
```json
{
  "geometry": { "type": "Polygon", "coordinates": [...] }
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "totalAreaHectares": 1500,
    "forestAreaHectares": 1200,
    "forestCoveragePercent": 80,
    "biomass": 240000,
    "carbonStock": 112800,
    "estimatedCo2TonsYear": 8285
  }
}
```

#### `/api/analysis/osm-elements` Route
**Ubicación:** `src/app/api/analysis/osm-elements/route.ts`

**Función:** Conteo de elementos OSM (árboles, ríos, casas, comunidades)

**Output:**
```json
{
  "success": true,
  "data": {
    "areaHectares": 1500,
    "trees": 42000,
    "rivers": 3,
    "houses": 125,
    "communities": 2,
    "details": {
      "waterways": {...},
      "buildings": {...},
      "communities": {...},
      "treeEstimation": {...}
    }
  }
}
```

### 3. Service Layer

#### Area Analyzer
**Ubicación:** `src/lib/geo/area-analyzer.ts`

**Función:** Orquestador principal que ejecuta análisis en paralelo

**Flujo:**
1. Valida geometría (Bolivia bounds, área min/max)
2. Ejecuta análisis forestal (GEE)
3. Ejecuta análisis OSM (Overpass API) en paralelo
4. Combina resultados
5. Calcula prioridad de conservación

**Uso:**
```typescript
import { analyzeArea } from "@/lib/geo/area-analyzer";

const result = await analyzeArea(geometry, {
  includeOSM: true,
  includeForest: true,
  includeTrees: true,
  timeout: 60
});
```

#### Overpass Client
**Ubicación:** `src/lib/osm/overpass-client.ts`

**Función:** Cliente para consultas a Overpass API

**Métodos:**
- `fetchWaterways(geometry)`: Ríos, arroyos, canales
- `fetchBuildings(geometry)`: Edificios y construcciones
- `fetchCommunities(geometry)`: Pueblos, aldeas, asentamientos
- `fetchTrees(geometry)`: Árboles individuales y áreas forestales

**Overpass QL Example:**
```javascript
const query = `
  [out:json][timeout:60];
  (
    way["waterway"~"river|stream|canal"](poly:"${coordinates}");
    relation["waterway"~"river|stream"](poly:"${coordinates}");
  );
  out geom;
`;
```

#### GEE Client
**Ubicación:** `src/lib/gee/client.ts`

**Función:** Cliente para Google Earth Engine

**Métodos:**
- `snapPolygonToForest()`: Ajusta polígono a límites forestales
- `getForestMask()`: Extrae máscara forestal vectorizada
- `analyzeForestCoverage()`: Calcula métricas forestales

**Configuración:**
```typescript
interface ForestMaskOptions {
  threshold?: number;        // 0-100% (default: 70%)
  scale?: number;           // meters (default: 30m)
  maxPixels?: number;       // default: 1e10
  simplifyTolerance?: number; // meters (default: 50m)
}
```

### 4. Data Types

**Ubicación:** `src/types/analysis.ts`

**Tipos principales:**
- `AreaAnalysisResult`: Resultado completo del análisis
- `TreeEstimation`: Estimación de árboles con confianza
- `WaterwayData`: Información de cuerpos de agua
- `BuildingData`: Información de edificaciones
- `CommunityData`: Información de comunidades
- `ForestMetrics`: Métricas forestales y carbono

## Flujo de Datos Detallado

### Análisis Completo (Happy Path)

1. **Usuario dibuja polígono** → `ProjectMapDrawer`
2. **Validación local** → `turf-utils.ts`
   - Bolivia bounds check
   - Área mínima (1 ha)
   - No auto-intersecciones
3. **Click "Analizar"** → `useAreaAnalysis.analyze()`
4. **Stage 1: Connecting** (0-10%)
   - Preparación de requests
5. **Stage 2: Analyzing Forest** (10-40%)
   - POST `/api/analysis/forest`
   - GEE procesa Hansen dataset
   - Calcula biomasa y CO₂
6. **Stage 3: Counting Elements** (40-70%)
   - POST `/api/analysis/osm-elements`
   - Overpass queries paralelas
   - Parse de resultados OSM
7. **Stage 4: Calculating Metrics** (70-90%)
   - Combinación de datos
   - Cálculo de prioridad de conservación
   - Validación de resultados
8. **Stage 5: Finalizing** (90-100%)
   - Preparación de reporte
   - Metadata timestamp
9. **Success** → Display en UI

### Manejo de Errores

**Errores comunes:**
- `Polygon outside Bolivia`: Validación de bounds falla
- `Area too large`: > 100,000 ha
- `GEE timeout`: > 60 segundos
- `Overpass API rate limit`: Demasiados requests

**Estrategia de retry:**
- Max 3 intentos
- Exponential backoff: 1s, 2s, 4s
- Cancelable por usuario

## Performance Considerations

### Caching Strategy

**ApiCache Model:**
- Duration: 24 horas
- Key: Hash de geometría + parámetros
- Usado en: National forest stats

### Parallel Processing

**Promise.allSettled() en Area Analyzer:**
```typescript
const [forestResult, osmResult] = await Promise.allSettled([
  analyzeForest(geometry),
  Promise.all([
    fetchWaterways(geometry),
    fetchBuildings(geometry),
    fetchCommunities(geometry),
    fetchTrees(geometry),
  ])
]);
```

**Ventajas:**
- Reducción de tiempo total (análisis independientes)
- Manejo individual de errores
- Un error no bloquea otros análisis

### Optimizaciones

1. **Debounce en Forest Mask:** 500ms para evitar requests excesivos
2. **Geometría simplificada:** 50m tolerance reduce vértices
3. **Abort Controller:** Cancela requests obsoletos
4. **Progress streaming:** Feedback inmediato al usuario

## Integraciones Externas

### Google Earth Engine

**Datasets utilizados:**
- Hansen Global Forest Change (forest cover)
- MODIS Terra Vegetation Indices (biomass estimation)

**Autenticación:**
```env
GEE_SERVICE_ACCOUNT_EMAIL=carbono@project.iam.gserviceaccount.com
GEE_PRIVATE_KEY={"type":"service_account",...}
```

**Rate Limits:**
- 10,000 requests/day (free tier)
- Timeout: 60 segundos por request

### OpenStreetMap Overpass API

**Endpoint:** `https://overpass-api.de/api/interpreter`

**Rate Limits:**
- 10,000 queries/day
- Max timeout: 180 segundos
- Recommended: 60 segundos

**Best Practices:**
- Usar bbox cuando sea posible
- Filtrar por tags específicos
- Limitar geometrías con `out geom` solo cuando necesario

## Seguridad

### Validaciones

**Server-side:**
- Autenticación requerida (Supabase)
- Validación de geometría
- Sanitización de inputs
- Rate limiting por usuario

**Client-side:**
- Validación de polígono antes de enviar
- Timeout configurado (120s default)
- Abort en unmount de componentes

## Monitoreo y Logging

**Console Logs:**
```typescript
console.error("Forest analysis error:", error);
console.log("OSM elements analysis:", result);
```

**Recomendaciones para producción:**
- Implementar Sentry para error tracking
- Logs estructurados con Winston
- Métricas de performance con New Relic

## Próximos Pasos

1. **Integración real GEE:** Reemplazar mocks con GEE API
2. **Cache distribuido:** Redis para resultados de análisis
3. **WebSocket para progress:** Real-time streaming
4. **Batch processing:** Análisis de múltiples polígonos
5. **Export PDF:** Reportes descargables
