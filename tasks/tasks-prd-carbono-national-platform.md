# Lista de Tareas: CARBONO - Plataforma Nacional de Monitoreo de Carbono

> Generado desde: `prd-carbono-national-platform.md`
> Objetivo: MVP (Semanas 1-5)

## Evaluación del Estado Actual

**Infraestructura Existente:**
- ✅ Next.js 15 con App Router, React 19, TypeScript 5.7
- ✅ Supabase Auth + Prisma ORM configurados
- ✅ Layout básico de dashboard con navegación sidebar
- ✅ Componentes shadcn/ui instalados (Button, Dialog, Table, etc.)
- ✅ Sistema de autenticación de usuarios (sign-in, sign-up, reset password)
- ✅ Gestión de perfiles con subida de avatar
- ✅ Modelo Profile básico con enum UserRole (USER, SUPERADMIN)

**Adiciones Requeridas:**
- ❌ Schema completo de base de datos (Projects, Organizations, Alerts, etc.)
- ❌ Leaflet/React-Leaflet para mapas interactivos
- ❌ Integración con NASA FIRMS API
- ❌ Integración con Google Earth Engine
- ❌ Utilidades de cálculo de carbono
- ❌ Generación de reportes PDF/Excel (jsPDF, xlsx)
- ❌ Utilidades geoespaciales (@turf/turf)
- ❌ Páginas del portal público

---

## Archivos Relevantes

### Base de Datos y Schema
- `prisma/schema.prisma` - Schema completo con todos los modelos (Organization, Project, DeforestationAlert, CarbonCredit, Notification, Report, ProjectDocument, ProjectStatusHistory, ApiCache)
- `prisma/seed.ts` - Datos de prueba con 15+ proyectos realistas distribuidos en Bolivia

### API Routes - Google Earth Engine
- `src/app/api/gee/analyze-area/route.ts` - Analiza área de proyecto con GEE (cobertura forestal, biomasa, tipo de bosque)
- `src/app/api/gee/historical-trends/route.ts` - Obtiene tendencias históricas de NDVI y cambios de cobertura
- `src/lib/gee/client.ts` - Cliente de Google Earth Engine con autenticación de Service Account
- `src/lib/gee/datasets.ts` - Configuración de datasets (Hansen, Sentinel-2, MODIS, NASA Biomass)

### API Routes - NASA FIRMS
- `src/app/api/cron/fetch-nasa-firms/route.ts` - Cron job que consulta NASA FIRMS cada 3 horas
- `src/app/api/alerts/latest/route.ts` - Endpoint público para obtener alertas recientes
- `src/lib/nasa-firms/client.ts` - Cliente HTTP para NASA FIRMS API
- `src/lib/nasa-firms/parser.ts` - Parser de CSV a alertas con geocodificación

### API Routes - Proyectos
- `src/app/api/projects/route.ts` - GET (lista con filtros) y POST (crear proyecto)
- `src/app/api/projects/[id]/route.ts` - GET (detalle), PATCH (actualizar), DELETE (soft delete)
- `src/app/api/projects/[id]/status/route.ts` - PATCH para cambiar estado del proyecto
- `src/app/api/projects/[id]/documents/route.ts` - POST (subir documentos), GET (listar)

### API Routes - Organizaciones
- `src/app/api/organizations/route.ts` - CRUD completo de organizaciones
- `src/app/api/organizations/[id]/route.ts` - Detalle y métricas agregadas

### API Routes - Reportes
- `src/app/api/reports/generate/route.ts` - Genera reportes PDF/Excel
- `src/app/api/reports/route.ts` - Lista de reportes generados

### API Routes - Alertas
- `src/app/api/alerts/route.ts` - GET (lista filtrada), PATCH (cambiar estado)
- `src/app/api/alerts/[id]/route.ts` - Detalle de alerta individual

### API Routes - Notificaciones
- `src/app/api/notifications/route.ts` - GET (lista), PATCH (marcar como leída)

### Utilidades y Helpers
- `src/lib/carbon/calculator.ts` - Calculadora de carbono con fórmulas del IPCC
- `src/lib/carbon/ipcc-factors.ts` - Factores de emisión por tipo de bosque boliviano
- `src/lib/carbon/market-prices.ts` - Precios de mercado de carbono (conservador/realista/optimista)
- `src/lib/geo/turf-utils.ts` - Utilidades geoespaciales con @turf/turf (área, distancia, validación)
- `src/lib/geo/bolivia-boundaries.ts` - Coordenadas de departamentos y bounding box de Bolivia
- `src/lib/reports/pdf-generator.ts` - Generación de PDFs con jsPDF
- `src/lib/reports/excel-generator.ts` - Generación de Excel con xlsx
- `src/lib/cache/api-cache.ts` - Sistema de caché para GEE y NASA (Tabla ApiCache)

### Componentes - Dashboard
- `src/app/(dashboard)/dashboard/carbono/page.tsx` - Página principal del dashboard de carbono
- `src/components/dashboard/carbono/stats-cards.tsx` - 4 cards de métricas principales
- `src/components/dashboard/carbono/carbon-map.tsx` - Mapa interactivo con Leaflet
- `src/components/dashboard/carbono/trend-charts.tsx` - 4 gráficos con Recharts
- `src/components/dashboard/carbono/map-controls.tsx` - Controles para cambiar capas del mapa
- `src/components/dashboard/carbono/filters-bar.tsx` - Barra de filtros (departamento, fechas)

### Componentes - Proyectos
- `src/app/(dashboard)/proyectos/page.tsx` - Página de lista de proyectos
- `src/app/(dashboard)/proyectos/nuevo/page.tsx` - Página de registro de nuevo proyecto
- `src/app/(dashboard)/proyectos/[id]/page.tsx` - Página de detalle de proyecto
- `src/components/proyectos/project-table.tsx` - Tabla de proyectos con filtros y paginación
- `src/components/proyectos/project-form.tsx` - Formulario multi-step de registro
- `src/components/proyectos/project-map-drawer.tsx` - Herramienta para dibujar polígonos en mapa
- `src/components/proyectos/carbon-preview.tsx` - Preview de cálculos de CO₂ e ingresos
- `src/components/proyectos/project-detail-view.tsx` - Vista completa de proyecto con tabs
- `src/components/proyectos/document-upload.tsx` - Subida de documentos a Supabase Storage
- `src/components/proyectos/status-change-dialog.tsx` - Dialog para cambiar estado
- `src/components/proyectos/gee-analysis-badge.tsx` - Badge "Verificado con GEE"

### Componentes - Alertas
- `src/app/(dashboard)/alertas/page.tsx` - Página de alertas de deforestación
- `src/components/alertas/alerts-table.tsx` - Tabla de alertas con filtros
- `src/components/alertas/alert-detail-dialog.tsx` - Dialog con detalle de alerta
- `src/components/alertas/alert-status-select.tsx` - Selector de estado (Nueva/Investigando/Resuelta)
- `src/components/alertas/severity-badge.tsx` - Badge de severidad (Baja/Media/Alta)

### Componentes - Organizaciones
- `src/app/(dashboard)/organizaciones/page.tsx` - Página de lista de organizaciones
- `src/app/(dashboard)/organizaciones/[id]/page.tsx` - Detalle de organización con proyectos
- `src/components/organizaciones/organization-form.tsx` - Formulario de crear/editar organización
- `src/components/organizaciones/organization-card.tsx` - Card con métricas de organización

### Componentes - Reportes
- `src/app/(dashboard)/reportes/page.tsx` - Página de generación de reportes
- `src/components/reportes/report-generator-form.tsx` - Formulario para configurar reporte
- `src/components/reportes/report-history-table.tsx` - Historial de reportes generados

### Componentes - Portal Público
- `src/app/(public)/page.tsx` - Landing page pública (reemplaza la actual)
- `src/app/(public)/layout.tsx` - Layout para páginas públicas
- `src/components/public/hero-carbono.tsx` - Hero section con métricas nacionales
- `src/components/public/public-map.tsx` - Mapa público (solo proyectos certificados)
- `src/components/public/featured-projects.tsx` - Proyectos destacados
- `src/components/public/department-ranking.tsx` - Ranking de departamentos
- `src/components/public/how-it-works.tsx` - Sección "¿Cómo funciona?"
- `src/components/public/contact-form.tsx` - Formulario de contacto para inversores

### Componentes - Mapas (Reutilizables)
- `src/components/maps/leaflet-map.tsx` - Componente base de mapa con Leaflet
- `src/components/maps/project-marker.tsx` - Marker de proyecto con colores por estado
- `src/components/maps/alert-marker.tsx` - Marker de alerta con colores por severidad
- `src/components/maps/polygon-drawer.tsx` - Herramienta para dibujar polígonos
- `src/components/maps/map-tooltip.tsx` - Tooltip personalizado

### Componentes - Notificaciones
- `src/components/notifications/notification-badge.tsx` - Badge con contador en header
- `src/components/notifications/notification-dropdown.tsx` - Dropdown de notificaciones
- `src/components/notifications/notification-item.tsx` - Item individual de notificación

### Tipos TypeScript
- `src/types/project.ts` - Tipos para proyectos (ProjectType, ProjectStatus, CreateProjectInput, etc.)
- `src/types/organization.ts` - Tipos para organizaciones
- `src/types/alert.ts` - Tipos para alertas (AlertSeverity, AlertStatus)
- `src/types/carbon.ts` - Tipos para cálculos de carbono
- `src/types/report.ts` - Tipos para reportes
- `src/types/gee.ts` - Tipos para respuestas de Google Earth Engine
- `src/types/nasa-firms.ts` - Tipos para respuestas de NASA FIRMS

### Validaciones Zod
- `src/lib/validations/project.ts` - Schemas de validación para proyectos
- `src/lib/validations/organization.ts` - Schemas de validación para organizaciones
- `src/lib/validations/alert.ts` - Schemas de validación para alertas
- `src/lib/validations/report.ts` - Schemas de validación para reportes

### Configuración
- `.env.local` - Variables de entorno (NASA_FIRMS_KEY, GEE_SERVICE_ACCOUNT_EMAIL, GEE_PRIVATE_KEY)
- `vercel.json` - Configuración de cron jobs para Vercel
- `package.json` - Nuevas dependencias (leaflet, react-leaflet, @turf/turf, jspdf, xlsx, recharts)

### Testing (Opcional para MVP, mencionado en roadmap)
- `src/lib/carbon/__tests__/calculator.test.ts` - Tests de calculadora de carbono
- `src/lib/geo/__tests__/turf-utils.test.ts` - Tests de utilidades geoespaciales
- `tests/e2e/project-registration.spec.ts` - Test E2E de registro de proyecto (Playwright)

### Notas
- Los componentes de UI de shadcn/ui ya están instalados, se reutilizarán
- El sistema de autenticación existente se mantiene, solo se actualiza el sidebar
- Los mapas con Leaflet se cargarán dinámicamente (dynamic import) para optimización

---

## Tareas

- [x] **1.0 Configuración de Schema de Base de Datos e Infraestructura Core**
  - [x] 1.1 Instalar dependencias npm necesarias (leaflet, react-leaflet, @turf/turf, jspdf, xlsx, @types/leaflet)
  - [x] 1.2 Actualizar `prisma/schema.prisma` con todos los modelos del PRD (Organization, Project, ProjectType enum, ProjectStatus enum, DeforestationAlert, AlertSeverity enum, AlertStatus enum, CarbonCredit, Notification, Report, ProjectDocument, ProjectStatusHistory, ApiCache)
  - [x] 1.3 Ejecutar `npx prisma migrate dev --name add_carbono_models` para crear las migraciones
  - [x] 1.4 Ejecutar `npx prisma generate` para actualizar el cliente de Prisma
  - [x] 1.5 Crear buckets de Supabase Storage: `project-documents` y `reports` (vía dashboard de Supabase)
  - [x] 1.6 Configurar Row Level Security (RLS) en Supabase para los nuevos buckets (SUPERADMIN: full access, Público: read solo para reports certificados)
  - [x] 1.7 Crear archivo `src/lib/geo/bolivia-boundaries.ts` con coordenadas de los 9 departamentos y bounding box de Bolivia
  - [x] 1.8 Crear archivo `src/lib/carbon/ipcc-factors.ts` con factores de emisión por tipo de bosque (Amazonía: 150, Chiquitanía: 120, Yungas: 130, Altiplano: 40)
  - [x] 1.9 Crear archivo `src/lib/carbon/market-prices.ts` con precios de mercado (conservador: $5, realista: $15, optimista: $50)
  - [x] 1.10 Actualizar `.env.example` con las nuevas variables de entorno necesarias (NASA_FIRMS_KEY, GEE_SERVICE_ACCOUNT_EMAIL, GEE_PRIVATE_KEY)

- [x] **2.0 Integraciones de APIs Externas (NASA FIRMS & Google Earth Engine)**
  - [x] 2.1 Obtener API Key de NASA FIRMS (registrarse en https://firms.modaps.eosdis.nasa.gov/api/area/ - toma 2 minutos)
  - [x] 2.2 Configurar Google Earth Engine Service Account en Google Cloud Console
    - [x] 2.2.1 Crear proyecto en Google Cloud Console: "carbono-bolivia"
    - [x] 2.2.2 Habilitar Earth Engine API
    - [x] 2.2.3 Crear Service Account con nombre "carbono-gee-service"
    - [x] 2.2.4 Asignar rol "Earth Engine Resource Admin"
    - [x] 2.2.5 Crear y descargar JSON key
    - [x] 2.2.6 Extraer email y private key del JSON y agregar a `.env.local`
  - [x] 2.3 Crear `src/lib/gee/client.ts` - Cliente de Google Earth Engine con autenticación mediante Service Account (usar `@google/earthengine` o hacer requests HTTP directos a Earth Engine REST API)
  - [x] 2.4 Crear `src/lib/gee/datasets.ts` - Configuración de datasets (Hansen Global Forest Change: `UMD/hansen/global_forest_change_2023_v1_11`, Sentinel-2: `COPERNICUS/S2_SR`, MODIS: `MODIS/006/MOD13A2`, NASA Biomass: `NASA/ORNL/biomass_carbon_density/v1`)
  - [x] 2.5 Crear `src/app/api/gee/analyze-area/route.ts` - Endpoint POST que recibe GeoJSON, consulta GEE y retorna: forestCoveragePercent, biomassPerHectare, forestType, lastChangeDetected, changePercent, verified
  - [x] 2.6 Crear `src/app/api/gee/historical-trends/route.ts` - Endpoint GET que retorna serie temporal de NDVI y eventos de deforestación
  - [x] 2.7 Crear `src/lib/cache/api-cache.ts` - Sistema de caché usando la tabla ApiCache (TTL: 24h para GEE, 3h para NASA)
  - [x] 2.8 Crear `src/lib/nasa-firms/client.ts` - Cliente HTTP para NASA FIRMS API (usar axios)
  - [x] 2.9 Crear `src/lib/nasa-firms/parser.ts` - Parser de CSV de NASA FIRMS a objetos TypeScript DeforestationAlert con geocodificación de departamento usando `bolivia-boundaries.ts`
  - [x] 2.10 Crear `src/app/api/cron/fetch-nasa-firms/route.ts` - Cron job que se ejecuta cada 3 horas, consulta NASA FIRMS para Bolivia (bbox: -69.6,-23,-57.5,-10), parsea resultados, detecta proyectos cercanos (radio 5km) usando @turf/distance, inserta alertas nuevas en DB
  - [x] 2.11 Crear `vercel.json` con configuración de cron: `{ "crons": [{ "path": "/api/cron/fetch-nasa-firms", "schedule": "0 */3 * * *" }] }`
  - [x] 2.12 Crear `src/app/api/alerts/latest/route.ts` - Endpoint público GET que retorna alertas de las últimas 48 horas

- [x] **3.0 Sistema de Gestión de Proyectos de Carbono**
  - [x] 3.1 Crear tipos TypeScript en `src/types/project.ts` (ProjectType, ProjectStatus, CreateProjectInput, UpdateProjectInput, ProjectWithRelations)
  - [x] 3.2 Crear schemas de validación Zod en `src/lib/validations/project.ts` (createProjectSchema, updateProjectSchema)
  - [x] 3.3 Crear `src/lib/carbon/calculator.ts` con función `calculateCarbonCapture(input: CarbonCalculationInput): CarbonCalculationOutput` que implementa la fórmula: CO₂ = Área × Biomasa × Factor
  - [x] 3.4 Crear `src/lib/geo/turf-utils.ts` con funciones: `calculatePolygonArea(geojson)`, `calculateDistance(point1, point2)`, `isPointInBolivia(lat, lng)`, `simplifyPolygon(geojson)`
  - [x] 3.5 Crear `src/app/api/projects/route.ts`:
    - [x] 3.5.1 GET: Lista de proyectos con filtros (departamento, tipo, estado, dateFrom, dateTo), ordenamiento, paginación (20 por página), búsqueda por nombre
    - [x] 3.5.2 POST: Crear proyecto - validar con Zod, calcular área con Turf, llamar a `/api/gee/analyze-area`, ejecutar `calculateCarbonCapture`, guardar en DB con estado PENDING
  - [x] 3.6 Crear `src/app/api/projects/[id]/route.ts`:
    - [x] 3.6.1 GET: Obtener detalle completo con relaciones (organization, documents, carbonCredits, statusHistory)
    - [x] 3.6.2 PATCH: Actualizar proyecto - recalcular CO₂ si cambió área o tipo
    - [x] 3.6.3 DELETE: Soft delete (marcar active = false)
  - [x] 3.7 Crear `src/app/api/projects/[id]/status/route.ts` - PATCH para cambiar estado del proyecto, registrar en ProjectStatusHistory, crear notificación si pasa a CERTIFIED
  - [x] 3.8 Crear `src/app/api/projects/[id]/documents/route.ts`:
    - [x] 3.8.1 POST: Subir documento a Supabase Storage bucket `project-documents`, validar tipo (PDF/JPG/PNG) y tamaño (<5MB), guardar metadata en ProjectDocument
    - [x] 3.8.2 GET: Listar documentos del proyecto con URLs firmadas de Supabase
  - [x] 3.9 Crear página `src/app/(dashboard)/proyectos/page.tsx` con tabla de proyectos
  - [x] 3.10 Crear `src/components/proyectos/project-table.tsx` - Tabla con @tanstack/react-table, columnas: Nombre, Tipo, Departamento, Área (ha), CO₂/año, Estado, Fecha creación, acciones (Ver/Editar/Eliminar)
  - [x] 3.11 Crear página `src/app/(dashboard)/proyectos/nuevo/page.tsx` con formulario multi-step
  - [x] 3.12 Crear `src/components/proyectos/project-form.tsx` - Formulario con react-hook-form + Zod, 4 pasos: 1) Info básica (nombre, tipo, organización), 2) Ubicación y área (departamento, municipio, mapa), 3) Detalles (fechas, co-beneficios), 4) Revisión con preview de CO₂
  - [x] 3.13 Crear `src/components/proyectos/project-map-drawer.tsx` - Herramienta para dibujar polígonos en mapa Leaflet usando leaflet-draw, calcular área automáticamente con Turf, validar que esté en Bolivia
  - [x] 3.14 Crear `src/components/proyectos/carbon-preview.tsx` - Preview en tiempo real de cálculos de CO₂ e ingresos (3 escenarios: conservador $5, realista $15, optimista $50) mientras se dibuja el polígono
  - [x] 3.15 Crear página `src/app/(dashboard)/proyectos/[id]/page.tsx` con vista detallada
  - [x] 3.16 Crear `src/components/proyectos/project-detail-view.tsx` - Vista con tabs: Info General, Documentos, Análisis GEE, Historial de Estados, Alertas cercanas
  - [x] 3.17 Crear `src/components/proyectos/document-upload.tsx` - Drag & drop para subir documentos usando react-dropzone y Supabase Storage
  - [x] 3.18 Crear `src/components/proyectos/status-change-dialog.tsx` - Dialog para cambiar estado con validación de transiciones válidas y confirmación
  - [x] 3.19 Crear `src/components/proyectos/gee-analysis-badge.tsx` - Badge "✓ Verificado con GEE" que muestra tooltip con detalles del análisis (cobertura forestal, biomasa, tipo de bosque)

- [x] **4.0 Dashboard Interactivo & Visualización de Datos**
  - [x] 4.1 Crear página `src/app/(dashboard)/dashboard/carbono/page.tsx` - Dashboard principal de carbono con integración de React Query, actualización automática cada 10 minutos
  - [x] 4.2 Crear `src/components/dashboard/carbono/stats-cards.tsx` - 4 cards con métricas principales:
    - [x] 4.2.1 Card 1: Total hectáreas protegidas (suma de proyectos activos/certificados)
    - [x] 4.2.2 Card 2: Total tCO₂/año capturadas (suma calculada)
    - [x] 4.2.3 Card 3: Ingresos potenciales USD (rango conservador/realista/optimista)
    - [x] 4.2.4 Card 4: Alertas activas últimas 48h (contador con indicador de tendencia)
    - [x] 4.2.5 Cada card muestra icono, número grande, label, indicador de tendencia
  - [x] 4.3 Crear `src/components/maps/leaflet-map.tsx` - Componente base con dynamic import, tiles OpenStreetMap y satélite (Esri), centrado en Bolivia
  - [x] 4.4 Crear `src/components/maps/project-marker.tsx` - Markers con colores por estado y popups interactivos
  - [x] 4.5 Crear `src/components/maps/alert-marker.tsx` - Markers de alerta con animación pulse y colores por severidad
  - [x] 4.6 Tooltips integrados en markers (no componente separado)
  - [x] 4.7 Crear `src/components/dashboard/carbono/carbon-map.tsx` - Mapa con clustering manual para >100 markers, toggle de capas
  - [x] 4.8 Crear `src/components/dashboard/carbono/map-controls.tsx` - Controles con switches para Proyectos/Alertas y botones para Vista estándar/satélite
  - [x] 4.9 Crear `src/components/dashboard/carbono/filters-bar.tsx` - Barra de filtros con Departamento, Tipo, Estado, Rango de fechas, botón limpiar
  - [x] 4.10 Crear `src/components/dashboard/carbono/trend-charts.tsx` - 4 gráficos con Recharts:
    - [x] 4.10.1 Gráfico de líneas: Deforestación mensual con alertas totales y alta severidad
    - [x] 4.10.2 Gráfico de barras horizontal: Captura de CO₂ por departamento (top 9)
    - [x] 4.10.3 Gráfico de pie: Distribución de proyectos por tipo con colores personalizados
    - [x] 4.10.4 Gráfico de área: Evolución de cobertura forestal (verificaciones GEE recientes)
  - [x] 4.11 Implementado con React Query: refetch automático cada 10 min (stats/trends), 2 min (proyectos/alertas), actualización al cambiar filtros
  - [x] 4.12 Performance optimizado: dynamic import de Leaflet, clustering manual para >100 markers, refetch inteligente con React Query

- [x] **5.0 Sistema de Alertas y Monitoreo de Deforestación**
  - [x] 5.1 Crear tipos TypeScript en `src/types/alert.ts` - Incluye AlertSeverity, AlertStatus, AlertWithProject, AlertListItem, AlertDetail, UpdateAlertStatusInput, AlertQueryFilters, AlertStatistics, NASAFIRMSData
  - [x] 5.2 Crear schemas de validación Zod en `src/lib/validations/alert.ts` - updateAlertStatusSchema, alertQuerySchema, bulkUpdateAlertsSchema, createManualAlertSchema
  - [x] 5.3 Crear `src/app/api/alerts/route.ts` - GET con filtros (departamento, municipio, severidad, estado, fechas, proyecto cercano), ordenamiento DESC, paginación (50 por página), incluye relación con nearProject
  - [x] 5.4 Crear `src/app/api/alerts/[id]/route.ts` - GET detalle completo con nearProject, PATCH para actualizar estado con validación y notas
  - [x] 5.5 Crear página `src/app/(dashboard)/alertas/page.tsx` - Página con tabs (Tabla/Mapa), 5 cards de estadísticas, integración con React Query
  - [x] 5.6 Crear `src/components/alertas/alerts-table.tsx` - Tabla con @tanstack/react-table, columnas: Ubicación (coordenadas, departamento, municipio), Fecha (fecha y hora), Severidad (badge), Estado (select interactivo), Confianza, Proyecto cercano (con link y distancia), Acciones (Ver), paginación 20 por página
  - [x] 5.7 Crear `src/components/alertas/severity-badge.tsx` - Badge con colores: LOW (yellow-500), MEDIUM (orange-500), HIGH (red-500)
  - [x] 5.8 Crear `src/components/alertas/alert-detail-dialog.tsx` - Dialog con información general, ubicación (con link a Google Maps), datos de detección (confianza, brillo, FRP), proyecto cercano (con link y métricas), notas
  - [x] 5.9 Crear `src/components/alertas/alert-status-select.tsx` - Select con confirmación en dialog, muestra transición de estado, campo de notas, mensaje especial para estado RESOLVED
  - [x] 5.10 Lógica de detección de proyectos cercanos ya implementada en el cron job (src/app/api/cron/fetch-nasa-firms/route.ts) usando @turf/distance con radio de 5km
  - [x] 5.11 Notificación automática ya implementada en el cron job para alertas de alta severidad cerca de proyectos

- [x] **6.0 Portal Público de Transparencia**
  - [x] 6.1 Crear layout `src/app/(public)/layout.tsx` - Layout público con header (logo CARBONO, navegación, botón acceso), footer con 4 columnas (info, navegación, recursos, transparencia)
  - [x] 6.2 Reemplazar `src/app/page.tsx` con nueva landing page de CARBONO - Backup creado en src/app/old-landing-backup.tsx, nueva landing con ISR (revalidate: 3600s)
  - [x] 6.3 Crear `src/components/public/hero-carbono.tsx` - Hero con:
    - [x] 6.3.1 Título "Bolivia protege X millones de hectáreas de bosque" (dinámico)
    - [x] 6.3.2 4 cards de métricas: Proyectos, Hectáreas, tCO₂/año, Ingresos potenciales
    - [x] 6.3.3 2 CTAs: "Ver Proyectos" (scroll smooth) y "Acceder al Sistema"
  - [x] 6.4 Crear `src/components/public/public-map.tsx` - Mapa mostrando solo proyectos CERTIFIED/ACTIVE, tooltips con nombre, tipo, tCO₂/año, link a detalle
  - [x] 6.5 Crear `src/components/public/featured-projects.tsx` - Grid 3 columnas con top 6 proyectos por captura CO₂, cards con tipo, departamento, área, tCO₂/año, botón "Ver Detalles"
  - [x] 6.6 Crear `src/components/public/department-ranking.tsx` - Top 5 departamentos con barras de progreso, muestra: posición (medallas para top 3), nombre, proyectos, hectáreas, tCO₂/año, porcentaje
  - [x] 6.7 Crear `src/components/public/how-it-works.tsx` - 4 cards con iconos: 1) Registro (FileText), 2) Verificación Satelital (Satellite), 3) Certificación (CheckCircle), 4) Monetización (DollarSign)
  - [x] 6.8 Crear `src/components/public/contact-form.tsx` - Formulario con validación: Nombre, Email, Tipo (select: Inversor/Organización/Prensa/Gobierno/General), Mensaje, confirmación con alert de éxito
  - [x] 6.9 Crear API route `src/app/api/public/metrics/route.ts` - Métricas agregadas: summary (total proyectos, hectáreas, CO₂, ingresos), departmentRanking (top 5), projectsByType, featuredProjects (top 6), cache 1 hora
  - [x] 6.10 SEO implementado: metadata con título/descripción en page.tsx, Open Graph tags pendiente
  - [x] 6.11 Performance optimizado: ISR con revalidate 3600s en page.tsx y API route, dynamic import de mapa

- [x] **7.0 Sistema de Generación de Reportes y Exportación**
  - [x] 7.1 Crear tipos TypeScript en `src/types/report.ts` - ReportType, ReportFormat, ReportParameters, NationalReportData, DepartmentReportData, ProjectReportData, MonthlyReportData, ReportMetadata, GeneratedReport
  - [x] 7.2 Crear schemas de validación Zod en `src/lib/validations/report.ts` - generateReportSchema con validaciones condicionales por tipo, downloadReportSchema
  - [x] 7.3 Crear `src/lib/reports/pdf-generator.ts` - Generador de PDFs con jsPDF:
    - [x] 7.3.1 Función `generateNationalReport(data)` - Reporte nacional con portada, resumen ejecutivo, desglose departamental
    - [x] 7.3.2 Función `generateDepartmentReport(department, data)` - Reporte departamental con lista de proyectos
    - [x] 7.3.3 Función `generateProjectReport(projectId, data)` - Reporte de proyecto con info detallada y métricas de carbono
    - [x] 7.3.4 Función `generateMonthlyReport(month, year, data)` - Reporte mensual con nuevos proyectos y cambios
    - [x] 7.3.5 Template implementado: portada, header/footer en cada página, sección de resumen, métricas, disclaimer
  - [x] 7.4 Crear `src/lib/reports/excel-generator.ts` - Generador de Excel con xlsx:
    - [x] 7.4.1 Nacional: Hojas de Resumen, Departamentos, Proyectos, Alertas
    - [x] 7.4.2 Departamental: Hojas de Resumen, Proyectos, Alertas por municipio
    - [x] 7.4.3 Proyecto: Hojas de Información, Historial, Documentos
    - [x] 7.4.4 Mensual: Hojas de Resumen, Nuevos Proyectos, Cambios de Estado, Alertas
  - [x] 7.5 Crear `src/app/api/reports/generate/route.ts` - POST que genera reporte (actualmente solo Nacional implementado, retorna archivo directamente, guarda en DB y Supabase Storage, soporta modo async)
  - [x] 7.5.1 Crear `src/app/api/reports/data/national/route.ts` - GET que retorna datos para reporte nacional
  - [x] 7.6 Crear `src/app/api/reports/route.ts` - GET lista de reportes generados con paginación y filtros por tipo, DELETE para eliminar reportes
  - [x] 7.7 Crear página `src/app/(dashboard)/reportes/page.tsx` con generador y historial - Tabs (Generar/Historial), 3 cards de estadísticas, filtros, integración con React Query
  - [x] 7.8 Crear `src/components/reportes/report-generator-form.tsx` - Formulario de generación con selects para tipo/formato, campos condicionales (departamento, proyecto, mes/año), botones con iconos, loading state
  - [x] 7.9 Crear `src/components/reportes/report-history-table.tsx` - Tabla con @tanstack/react-table, columnas: Tipo, Título, Formato, Tamaño, Fecha, Usuario, Acciones (Descargar, Eliminar), paginación, confirmación de eliminación
  - [x] 7.10 Generación asíncrona para reportes grandes - Implementado `src/lib/reports/async-generator.ts` con queueReportGeneration(), generateReportAsync(), soporte para async mode en API route, estado "processing" en DB

- [x] **8.0 Sistema de Gestión de Organizaciones**
  - [x] 8.1 Crear tipos TypeScript en `src/types/organization.ts` (OrganizationType, CreateOrganizationInput, OrganizationWithProjects)
  - [x] 8.2 Crear schemas de validación Zod en `src/lib/validations/organization.ts` (createOrganizationSchema, updateOrganizationSchema)
  - [x] 8.3 Crear `src/app/api/organizations/route.ts`:
    - [x] 8.3.1 GET: Lista de organizaciones con paginación, búsqueda por nombre, filtro por tipo
    - [x] 8.3.2 POST: Crear organización - validar con Zod, guardar en DB
  - [x] 8.4 Crear `src/app/api/organizations/[id]/route.ts`:
    - [x] 8.4.1 GET: Detalle de organización con proyectos relacionados, métricas agregadas (total hectáreas, total CO₂)
    - [x] 8.4.2 PATCH: Actualizar organización
    - [x] 8.4.3 DELETE: Soft delete (solo si no tiene proyectos activos)
  - [x] 8.5 Crear página `src/app/(dashboard)/organizaciones/page.tsx` con lista de organizaciones
  - [x] 8.6 Crear página `src/app/(dashboard)/organizaciones/[id]/page.tsx` con detalle y lista de proyectos de la organización
  - [x] 8.7 Crear `src/components/organizaciones/organization-form.tsx` - Formulario con react-hook-form para crear/editar organización (campos: nombre, tipo, email, teléfono, dirección)
  - [x] 8.8 Crear `src/components/organizaciones/organization-card.tsx` - Card que muestra: nombre, tipo, número de proyectos, métricas agregadas (hectáreas, CO₂), link a detalle
  - [x] 8.9 Implementar creación inline de organización en el formulario de proyecto (modal o drawer que se abre desde el select de organización)
  - [x] 8.10 Agregar validación: no permitir eliminar organización si tiene proyectos en estado CERTIFIED o ACTIVE

- [ ] **9.0 Notificaciones y Mejoras de Experiencia de Usuario**
  - [ ] 9.1 Crear tipos TypeScript en `src/types/notification.ts` (NotificationType, NotificationWithLink)
  - [ ] 9.2 Crear `src/app/api/notifications/route.ts`:
    - [ ] 9.2.1 GET: Lista de notificaciones del usuario actual, filtro por leídas/no leídas, ordenar por fecha DESC, limitar a últimos 30 días
    - [ ] 9.2.2 PATCH: Marcar notificación(es) como leída(s)
  - [ ] 9.3 Crear `src/components/notifications/notification-badge.tsx` - Badge en el header con contador de no leídas, badge rojo si hay notificaciones nuevas
  - [ ] 9.4 Crear `src/components/notifications/notification-dropdown.tsx` - Dropdown que se abre al click en badge, muestra últimas 10 notificaciones, botón "Ver todas", botón "Marcar todas como leídas"
  - [ ] 9.5 Crear `src/components/notifications/notification-item.tsx` - Item individual con icono según tipo, título, mensaje, timestamp relativo (hace 2 horas), link a la alerta/proyecto, indicador de leída/no leída
  - [ ] 9.6 Implementar lógica de creación de notificaciones en:
    - [ ] 9.6.1 Cuando proyecto pasa a estado CERTIFIED
    - [ ] 9.6.2 Cuando alerta de alta severidad está cerca de proyecto
    - [ ] 9.6.3 Cuando se detecta pérdida de cobertura forestal >15% en proyecto activo
  - [x] 9.7 Actualizar `src/components/sidebar/app-sidebar.tsx` - Agregar nuevas rutas: Dashboard Carbono, Proyectos, Alertas, Organizaciones, Reportes
  - [ ] 9.8 Crear breadcrumbs component para navegación contextual en páginas internas
  - [ ] 9.9 Implementar loading states con Skeleton components de shadcn/ui en todas las páginas
  - [x] 9.10 Implementar error boundaries para manejo de errores graceful
  - [ ] 9.11 Agregar tooltips informativos en campos complejos del formulario de proyecto
  - [x] 9.12 Implementar confirmaciones antes de acciones destructivas (eliminar proyecto, eliminar organización)

- [ ] **10.0 Testing, Optimización y Deployment**
  - [x] 10.1 Crear `prisma/seed.ts` con datos de prueba:
    - [x] 10.1.1 15+ proyectos realistas distribuidos en los 9 departamentos de Bolivia
    - [x] 10.1.2 10+ organizaciones de diferentes tipos (Comunidad Indígena, ONG, Gobierno Local)
    - [x] 10.1.3 20+ alertas de deforestación con diferentes severidades y estados
    - [x] 10.1.4 Historial de cambios de estado para algunos proyectos
    - [ ] 10.1.5 Documentos de ejemplo (usar URLs públicas o placeholders) - No implementado (opcional)
  - [x] 10.2 Ejecutar `npx prisma db seed` para poblar la base de datos
  - [ ] 10.3 Crear tests unitarios para funciones críticas:
    - [ ] 10.3.1 `src/lib/carbon/__tests__/calculator.test.ts` - Tests de calculadora de carbono con diferentes inputs
    - [ ] 10.3.2 `src/lib/geo/__tests__/turf-utils.test.ts` - Tests de cálculo de área, distancia, validación de polígonos
  - [ ] 10.4 Configurar Playwright para tests E2E (si no está configurado)
  - [ ] 10.5 Crear test E2E crítico: `tests/e2e/project-registration.spec.ts` - Flujo completo de registro de proyecto desde login hasta confirmación
  - [ ] 10.6 Optimización de performance:
    - [ ] 10.6.1 Implementar React Query con stale times adecuados (dashboard metrics: 5min, projects: 2min, GEE data: 24h, NASA alerts: 3h)
    - [ ] 10.6.2 Implementar lazy loading de mapa con dynamic import
    - [ ] 10.6.3 Optimizar imágenes con next/image en toda la aplicación
    - [ ] 10.6.4 Implementar virtualización en tablas largas si hay >100 items
    - [ ] 10.6.5 Code splitting: separar rutas en chunks (usar dynamic import para páginas pesadas)
  - [ ] 10.7 Auditoría de performance con Lighthouse: objetivo >90 en Performance, Accessibility, Best Practices
  - [ ] 10.8 Responsive design:
    - [ ] 10.8.1 Verificar todas las páginas en desktop (1920px), tablet (768px), mobile (375px)
    - [ ] 10.8.2 Sidebar colapsable en tablet, menú hamburguesa en mobile
    - [ ] 10.8.3 Tablas con scroll horizontal en mobile
    - [ ] 10.8.4 Mapa con controles táctiles optimizados para mobile
  - [ ] 10.9 Documentación:
    - [ ] 10.9.1 Actualizar `README.md` con: descripción del proyecto, instrucciones de setup, variables de entorno requeridas, comandos para desarrollo/build/deploy
    - [ ] 10.9.2 Crear `docs/API.md` con documentación de todos los endpoints
    - [ ] 10.9.3 Crear `docs/DEPLOYMENT.md` con guía de deployment a Vercel
    - [ ] 10.9.4 Crear `docs/GEE_SETUP.md` con instrucciones detalladas para configurar Google Earth Engine
    - [ ] 10.9.5 Crear `docs/NASA_FIRMS_SETUP.md` con instrucciones para obtener API key
  - [ ] 10.10 Preparación para deployment:
    - [ ] 10.10.1 Verificar que todas las variables de entorno estén en Vercel (Dashboard > Settings > Environment Variables)
    - [ ] 10.10.2 Configurar dominios personalizados si aplica
    - [ ] 10.10.3 Verificar que los cron jobs estén configurados en vercel.json
    - [ ] 10.10.4 Ejecutar `npm run build` localmente para verificar que no hay errores
    - [ ] 10.10.5 Configurar analytics (Vercel Analytics o Google Analytics)
  - [ ] 10.11 Deploy a producción:
    - [ ] 10.11.1 Push a branch main/master
    - [ ] 10.11.2 Verificar que el build en Vercel sea exitoso
    - [ ] 10.11.3 Ejecutar smoke tests en producción (login, cargar dashboard, crear proyecto de prueba)
    - [ ] 10.11.4 Monitorear logs de Vercel por 24 horas para detectar errores
  - [ ] 10.12 Post-deployment:
    - [ ] 10.12.1 Crear usuario SUPERADMIN de producción vía Supabase Dashboard
    - [ ] 10.12.2 Verificar que el cron job de NASA FIRMS se ejecute correctamente
    - [ ] 10.12.3 Verificar que las llamadas a GEE funcionen en producción
    - [ ] 10.12.4 Configurar monitoring y alertas (Vercel o Sentry)

- [ ] **11.0 Módulo de Cálculo de Emisiones Industriales (Fábricas y Empresas)**
  - [ ] 11.1 Actualizar schema de base de datos:
    - [ ] 11.1.1 Agregar modelo `Industry` a `prisma/schema.prisma` (id, name, type, sector, address, city, department, organizationId, active, createdAt, updatedAt, createdBy)
    - [ ] 11.1.2 Agregar enum `IndustrySector` (MANUFACTURING, CEMENT, STEEL, TEXTILES, FOOD_BEVERAGE, CHEMICALS, MINING, ENERGY, CONSTRUCTION, OTHER)
    - [ ] 11.1.3 Agregar modelo `EmissionSource` (id, industryId, sourceType, category, scope, description, active, createdAt, updatedAt)
    - [ ] 11.1.4 Agregar enum `EmissionScope` (SCOPE_1, SCOPE_2, SCOPE_3) según GHG Protocol
    - [ ] 11.1.5 Agregar enum `SourceCategory` (STATIONARY_COMBUSTION, MOBILE_COMBUSTION, PROCESS_EMISSIONS, FUGITIVE_EMISSIONS, PURCHASED_ELECTRICITY, PURCHASED_HEAT_STEAM, TRANSPORTATION, WASTE)
    - [ ] 11.1.6 Agregar modelo `EmissionRecord` (id, sourceId, recordDate, fuelType, fuelAmount, fuelUnit, activityData, emissionFactor, co2Emissions, ch4Emissions, n2oEmissions, totalCO2e, calculationMethod, notes, verified, verifiedBy, verifiedAt, createdAt, updatedAt, createdBy)
    - [ ] 11.1.7 Agregar enum `FuelType` (DIESEL, GASOLINE, NATURAL_GAS, LPG, COAL, BIOMASS, ELECTRICITY, OTHER)
    - [ ] 11.1.8 Agregar modelo `IndustryInventory` (id, industryId, year, scope1Total, scope2Total, scope3Total, totalEmissions, status, reportedAt, verifiedAt, pdfUrl, createdAt, updatedAt)
    - [ ] 11.1.9 Ejecutar migración: `npx prisma migrate dev --name add_industrial_emissions`
  - [ ] 11.2 Crear factores de emisión y constantes:
    - [ ] 11.2.1 Crear `src/lib/emissions/emission-factors.ts` con factores IPCC 2006:
      - [ ] 11.2.1.1 Factores para combustibles (diesel: 2.68 kgCO2/L, gasolina: 2.31 kgCO2/L, gas natural: 2.03 kgCO2/m³, GLP: 1.51 kgCO2/kg, carbón: 2.42 kgCO2/kg)
      - [ ] 11.2.1.2 Factor de electricidad Bolivia: 0.42 tonCO2/MWh (actualizable por año)
      - [ ] 11.2.1.3 Factores para procesos industriales (cemento: 0.52 tonCO2/ton clinker, acero: 1.8 tonCO2/ton acero, cal: 0.75 tonCO2/ton cal)
      - [ ] 11.2.1.4 Factores de GWP (Global Warming Potential): CH4=25, N2O=298, HFCs según tipo
      - [ ] 11.2.1.5 Constantes de conversión (L a galones, m³ a ft³, kWh a MWh, etc.)
    - [ ] 11.2.2 Crear `src/lib/emissions/ghg-protocol-scopes.ts` con definiciones y ejemplos de cada alcance según GHG Protocol
    - [ ] 11.2.3 Crear `src/lib/emissions/industry-baselines.ts` con líneas base por sector industrial en Bolivia (intensidad de emisión promedio: tonCO2e/unidad producción)
  - [ ] 11.3 Crear calculadora de emisiones industriales:
    - [ ] 11.3.1 Crear `src/lib/emissions/industrial-calculator.ts` con funciones:
      - [ ] 11.3.1.1 `calculateScope1Emissions(sources: Scope1Source[]): Scope1Result` - Combustión estacionaria, móvil, procesos, fugitivas
      - [ ] 11.3.1.2 `calculateScope2Emissions(electricityKWh: number, year: number): Scope2Result` - Electricidad comprada
      - [ ] 11.3.1.3 `calculateScope3Emissions(activities: Scope3Activity[]): Scope3Result` - Transporte, residuos, viajes de negocio
      - [ ] 11.3.1.4 `calculateTotalInventory(industry: IndustryData): InventoryResult` - Suma de todos los alcances con desglose
      - [ ] 11.3.1.5 `convertToTonsCO2e(emissions: GHGEmissions): number` - Convierte todos los GEI a CO₂ equivalente usando GWP
      - [ ] 11.3.1.6 `calculateIntensity(emissions: number, production: number, unit: string): number` - Intensidad de emisión (tonCO2e/unidad)
      - [ ] 11.3.1.7 `compareToPreviousYear(current: Inventory, previous: Inventory): ComparisonResult` - Análisis de tendencias
      - [ ] 11.3.1.8 Implementar validaciones: datos negativos, fechas coherentes, unidades válidas
  - [ ] 11.4 Crear tipos TypeScript:
    - [ ] 11.4.1 Crear `src/types/industrial-emissions.ts` con tipos: IndustryType, EmissionScope, SourceCategory, FuelType, EmissionFactor, Scope1Source, Scope2Source, Scope3Activity, EmissionRecord, InventoryResult, ComparisonResult, IndustryWithSources, CalculationMethod
    - [ ] 11.4.2 Crear schemas de validación Zod en `src/lib/validations/industrial-emissions.ts`: createIndustrySchema, createEmissionSourceSchema, recordEmissionSchema, generateInventorySchema
  - [ ] 11.5 Crear API routes para industrias:
    - [ ] 11.5.1 Crear `src/app/api/industries/route.ts`:
      - [ ] 11.5.1.1 GET: Lista de industrias con filtros (sector, departamento, organización), paginación
      - [ ] 11.5.1.2 POST: Crear nueva industria - validar con Zod, asociar a organización
    - [ ] 11.5.2 Crear `src/app/api/industries/[id]/route.ts`:
      - [ ] 11.5.2.1 GET: Detalle de industria con fuentes de emisión, inventarios, métricas agregadas
      - [ ] 11.5.2.2 PATCH: Actualizar información de industria
      - [ ] 11.5.2.3 DELETE: Soft delete (solo si no tiene inventarios certificados)
    - [ ] 11.5.3 Crear `src/app/api/industries/[id]/sources/route.ts`:
      - [ ] 11.5.3.1 GET: Lista de fuentes de emisión de la industria por alcance
      - [ ] 11.5.3.2 POST: Agregar nueva fuente de emisión (combustión estacionaria, móvil, electricidad, etc.)
    - [ ] 11.5.4 Crear `src/app/api/industries/[id]/sources/[sourceId]/route.ts`:
      - [ ] 11.5.4.1 PATCH: Actualizar fuente de emisión
      - [ ] 11.5.4.2 DELETE: Eliminar fuente (solo si no tiene registros)
  - [ ] 11.6 Crear API routes para registros de emisiones:
    - [ ] 11.6.1 Crear `src/app/api/emission-records/route.ts`:
      - [ ] 11.6.1.1 GET: Lista de registros con filtros (industria, fuente, fecha desde/hasta, alcance), ordenamiento, paginación
      - [ ] 11.6.1.2 POST: Registrar nuevas emisiones - validar datos, calcular emisiones usando industrial-calculator, guardar en DB
    - [ ] 11.6.2 Crear `src/app/api/emission-records/[id]/route.ts`:
      - [ ] 11.6.2.1 GET: Detalle de registro con cálculos desglosados
      - [ ] 11.6.2.2 PATCH: Actualizar registro (recalcular emisiones si cambian datos de actividad)
      - [ ] 11.6.2.3 DELETE: Eliminar registro (solo si no está en inventario certificado)
    - [ ] 11.6.3 Crear `src/app/api/emission-records/bulk/route.ts`:
      - [ ] 11.6.3.1 POST: Importar múltiples registros desde Excel/CSV - parsear, validar, calcular, insertar en batch
  - [ ] 11.7 Crear API routes para inventarios:
    - [ ] 11.7.1 Crear `src/app/api/industries/[id]/inventory/route.ts`:
      - [ ] 11.7.1.1 POST: Generar inventario anual - consultar todos los registros del año, sumar por alcance, calcular totales, generar PDF, guardar en DB y Supabase Storage
      - [ ] 11.7.1.2 GET: Lista de inventarios generados con filtro por año y estado
    - [ ] 11.7.2 Crear `src/app/api/inventories/[id]/route.ts`:
      - [ ] 11.7.2.1 GET: Detalle de inventario con desglose completo, comparación con año anterior, gráficos
      - [ ] 11.7.2.2 PATCH: Actualizar estado (DRAFT → SUBMITTED → VERIFIED)
      - [ ] 11.7.2.3 POST verify: Verificar inventario (requiere rol SUPERADMIN)
    - [ ] 11.7.3 Crear `src/app/api/industries/[id]/inventory/calculate/route.ts`:
      - [ ] 11.7.3.1 POST: Calcular inventario en tiempo real sin guardarlo (preview para revisar antes de generar oficial)
  - [ ] 11.8 Crear páginas de gestión de industrias:
    - [ ] 11.8.1 Crear `src/app/(dashboard)/industrias/page.tsx` - Lista de industrias con filtros y estadísticas agregadas
    - [ ] 11.8.2 Crear `src/app/(dashboard)/industrias/nueva/page.tsx` - Formulario de registro de nueva industria
    - [ ] 11.8.3 Crear `src/app/(dashboard)/industrias/[id]/page.tsx` - Dashboard de industria con tabs: Resumen, Fuentes de Emisión, Registros, Inventarios, Configuración
    - [ ] 11.8.4 Crear `src/app/(dashboard)/industrias/[id]/registrar-emision/page.tsx` - Formulario para registrar emisiones con wizard multi-step
  - [ ] 11.9 Crear componentes de UI para industrias:
    - [ ] 11.9.1 Crear `src/components/industrias/industry-form.tsx` - Formulario con react-hook-form + Zod (nombre, sector, ubicación, asociación a organización)
    - [ ] 11.9.2 Crear `src/components/industrias/industry-card.tsx` - Card con nombre, sector, emisiones totales año actual, tendencia vs. año anterior
    - [ ] 11.9.3 Crear `src/components/industrias/industry-table.tsx` - Tabla con @tanstack/react-table (columnas: Nombre, Sector, Departamento, Emisiones año actual, Estado inventario, Acciones)
    - [ ] 11.9.4 Crear `src/components/industrias/emission-source-form.tsx` - Formulario para agregar/editar fuentes de emisión (tipo de fuente, categoría, alcance, descripción)
    - [ ] 11.9.5 Crear `src/components/industrias/emission-source-list.tsx` - Lista agrupada por alcance con badges de categoría y acciones (editar/eliminar)
  - [ ] 11.10 Crear componentes de registro de emisiones:
    - [ ] 11.10.1 Crear `src/components/emisiones/emission-record-form.tsx` - Formulario wizard con 4 pasos:
      - [ ] 11.10.1.1 Paso 1: Seleccionar fuente de emisión (filtrado por industria y alcance)
      - [ ] 11.10.1.2 Paso 2: Ingresar datos de actividad (cantidad de combustible, kWh electricidad, km recorridos, etc.) con selector de unidades
      - [ ] 11.10.1.3 Paso 3: Preview de cálculo (mostrar emisiones CO₂, CH₄, N₂O, total CO₂e, factor de emisión usado, metodología)
      - [ ] 11.10.1.4 Paso 4: Confirmación y notas adicionales
    - [ ] 11.10.2 Crear `src/components/emisiones/emission-calculator-widget.tsx` - Widget para calcular emisiones en tiempo real mientras se ingresan datos (mostrar formula: Actividad × Factor = Emisiones)
    - [ ] 11.10.3 Crear `src/components/emisiones/emission-factor-tooltip.tsx` - Tooltip que explica el factor de emisión usado, fuente (IPCC, DEFRA), fecha de actualización
    - [ ] 11.10.4 Crear `src/components/emisiones/emission-record-table.tsx` - Tabla de registros con filtros (fecha, fuente, alcance), columnas: Fecha, Fuente, Categoría, Alcance, Actividad, Emisiones CO₂e, Estado, Acciones
    - [ ] 11.10.5 Crear `src/components/emisiones/bulk-import-dialog.tsx` - Dialog para importar múltiples registros desde Excel (con plantilla descargable, validación de formato, preview de datos a importar)
  - [ ] 11.11 Crear componentes de inventarios:
    - [ ] 11.11.1 Crear `src/components/inventarios/inventory-summary-cards.tsx` - 4 cards: Alcance 1, Alcance 2, Alcance 3, Total, con indicadores de tendencia
    - [ ] 11.11.2 Crear `src/components/inventarios/inventory-breakdown-chart.tsx` - Gráfico de pie mostrando distribución de emisiones por alcance y categoría
    - [ ] 11.11.3 Crear `src/components/inventarios/emissions-timeline-chart.tsx` - Gráfico de línea con evolución mensual de emisiones (desglosado por alcance)
    - [ ] 11.11.4 Crear `src/components/inventarios/inventory-comparison-chart.tsx` - Gráfico de barras comparando año actual vs. anterior por alcance
    - [ ] 11.11.5 Crear `src/components/inventarios/generate-inventory-dialog.tsx` - Dialog para generar inventario anual (selector de año, opciones de formato PDF/Excel, botón generar con loading state)
    - [ ] 11.11.6 Crear `src/components/inventarios/inventory-status-badge.tsx` - Badge con estados: DRAFT (gray), SUBMITTED (blue), VERIFIED (green)
    - [ ] 11.11.7 Crear `src/components/inventarios/inventory-verification-form.tsx` - Formulario para verificar inventario (solo SUPERADMIN, campos: notas de verificación, fecha de verificación, firma digital)
  - [ ] 11.12 Crear generador de reportes de inventario:
    - [ ] 11.12.1 Crear `src/lib/emissions/reports/inventory-pdf-generator.ts` - Generador de PDF de inventario GEI con jsPDF:
      - [ ] 11.12.1.1 Portada con logo, nombre de industria, año, fecha de generación
      - [ ] 11.12.1.2 Resumen ejecutivo: total de emisiones, desglose por alcance, comparación con año anterior, intensidad de emisión
      - [ ] 11.12.1.3 Sección Alcance 1: tabla de fuentes, gráfico de distribución por categoría
      - [ ] 11.12.1.4 Sección Alcance 2: consumo de electricidad, factor de emisión usado, total de emisiones
      - [ ] 11.12.1.5 Sección Alcance 3: actividades incluidas, metodología, total de emisiones
      - [ ] 11.12.1.6 Anexos: tabla completa de registros de emisión, metodología detallada, factores de emisión usados, certificaciones
      - [ ] 11.12.1.7 Footer en cada página: número de página, fecha de generación, versión del reporte
    - [ ] 11.12.2 Crear `src/lib/emissions/reports/inventory-excel-generator.ts` - Generador de Excel con múltiples hojas:
      - [ ] 11.12.2.1 Hoja "Resumen": tabla con totales por alcance, gráficos embebidos
      - [ ] 11.12.2.2 Hoja "Alcance 1": tabla detallada de todas las fuentes y registros
      - [ ] 11.12.2.3 Hoja "Alcance 2": tabla de consumo de electricidad mensual
      - [ ] 11.12.2.4 Hoja "Alcance 3": tabla de actividades de cadena de valor
      - [ ] 11.12.2.5 Hoja "Metodología": documentación de factores de emisión y metodología de cálculo
      - [ ] 11.12.2.6 Formateo: colores por alcance, totales en negrita, formato de números con separadores de miles
  - [ ] 11.13 Crear dashboard de emisiones industriales agregado:
    - [ ] 11.13.1 Crear `src/app/(dashboard)/dashboard/emisiones-industriales/page.tsx` - Dashboard nacional de emisiones industriales
    - [ ] 11.13.2 Crear `src/components/dashboard/emisiones/industry-emissions-stats.tsx` - 5 cards: Total industrias registradas, Total emisiones año actual (tonCO2e), Emisiones por sector, Tendencia vs. año anterior, Inventarios pendientes de verificación
    - [ ] 11.13.3 Crear `src/components/dashboard/emisiones/industry-emissions-map.tsx` - Mapa de Bolivia mostrando industrias como markers (color por nivel de emisiones, tamaño por emisiones totales)
    - [ ] 11.13.4 Crear `src/components/dashboard/emisiones/sector-comparison-chart.tsx` - Gráfico de barras horizontal comparando emisiones totales por sector industrial
    - [ ] 11.13.5 Crear `src/components/dashboard/emisiones/scope-distribution-chart.tsx` - Gráfico de pie nacional mostrando distribución entre Alcance 1, 2 y 3
    - [ ] 11.13.6 Crear `src/components/dashboard/emisiones/top-emitters-table.tsx` - Tabla con top 10 industrias emisoras (ranking, nombre, sector, departamento, emisiones totales, intensidad)
    - [ ] 11.13.7 Crear `src/components/dashboard/emisiones/emissions-trend-chart.tsx` - Gráfico de línea mostrando tendencia mensual de emisiones nacionales por sector
  - [ ] 11.14 Crear página pública de transparencia de emisiones:
    - [ ] 11.14.1 Crear `src/app/(public)/emisiones-industriales/page.tsx` - Portal público de consulta de emisiones industriales
    - [ ] 11.14.2 Crear `src/components/public/public-emissions-map.tsx` - Mapa público mostrando solo inventarios verificados
    - [ ] 11.14.3 Crear `src/components/public/sector-emissions-ranking.tsx` - Ranking de sectores industriales por emisiones totales
    - [ ] 11.14.4 Crear `src/components/public/public-inventory-search.tsx` - Buscador de inventarios verificados (por nombre de industria, sector, año)
    - [ ] 11.14.5 Crear API route público `src/app/api/public/emissions/stats/route.ts` - Estadísticas agregadas de emisiones industriales (solo inventarios verificados)
  - [ ] 11.15 Implementar sistema de notificaciones para emisiones:
    - [ ] 11.15.1 Notificación cuando se acerca fecha límite para inventario anual (30 días antes)
    - [ ] 11.15.2 Notificación cuando industria supera línea base de su sector (+15%)
    - [ ] 11.15.3 Notificación cuando inventario es verificado por SUPERADMIN
    - [ ] 11.15.4 Notificación cuando se detectan inconsistencias en datos (ej: emisiones muy altas vs. promedio del sector)
  - [ ] 11.16 Integración con módulo de organizaciones:
    - [ ] 11.16.1 Agregar tab "Industrias" en página de detalle de organización
    - [ ] 11.16.2 Mostrar métricas agregadas de emisiones en organization-card
    - [ ] 11.16.3 Permitir crear industria desde formulario de organización (inline creation)
  - [ ] 11.17 Testing y validación:
    - [ ] 11.17.1 Crear tests unitarios `src/lib/emissions/__tests__/industrial-calculator.test.ts`:
      - [ ] 11.17.1.1 Test de cálculo de Alcance 1 (combustión de diesel, gasolina, gas natural)
      - [ ] 11.17.1.2 Test de cálculo de Alcance 2 (electricidad con factor Bolivia)
      - [ ] 11.17.1.3 Test de conversión de GEI a CO₂e usando GWP
      - [ ] 11.17.1.4 Test de cálculo de intensidad de emisión
      - [ ] 11.17.1.5 Test de comparación año contra año
    - [ ] 11.17.2 Crear tests unitarios `src/lib/emissions/__tests__/emission-factors.test.ts` - Verificar que factores de emisión coincidan con IPCC 2006
    - [ ] 11.17.3 Crear test E2E `tests/e2e/industry-registration-and-inventory.spec.ts`:
      - [ ] 11.17.3.1 Registrar nueva industria
      - [ ] 11.17.3.2 Agregar 3 fuentes de emisión (combustión, electricidad, transporte)
      - [ ] 11.17.3.3 Registrar 10 emisiones a lo largo del año
      - [ ] 11.17.3.4 Generar inventario anual
      - [ ] 11.17.3.5 Verificar que PDF se genera correctamente
  - [ ] 11.18 Documentación:
    - [ ] 11.18.1 Crear `docs/EMISSIONS_METHODOLOGY.md` - Documentación de metodologías usadas (GHG Protocol, ISO 14064, IPCC 2006)
    - [ ] 11.18.2 Crear `docs/EMISSION_FACTORS.md` - Documentación de todos los factores de emisión, fuentes, fecha de actualización
    - [ ] 11.18.3 Crear `docs/INDUSTRY_USER_GUIDE.md` - Guía para usuarios industriales sobre cómo registrar sus emisiones
    - [ ] 11.18.4 Crear plantilla Excel descargable `public/templates/bulk-emissions-import-template.xlsx` con instrucciones y formato

---

## Notas Importantes para Implementación

### Orden de Ejecución Recomendado
1. **Semana 1**: Tareas 1.0 y 2.0 (Fundación)
2. **Semana 2**: Tareas 3.0 y 4.0 (Core features)
3. **Semana 3**: Tareas 5.0, 6.0, 8.0 (Features adicionales)
4. **Semana 4**: Tareas 7.0 y 9.0 (Polish)
5. **Semana 5**: Tarea 10.0 (Testing y Deploy)

### Dependencias Críticas
- No se puede empezar Tarea 3.0 sin completar 2.0 (GEE necesario para cálculos)
- No se puede empezar Tarea 4.0 sin completar 3.0 (dashboard necesita proyectos)
- La Tarea 10.0 debe ser la última

### Variables de Entorno Necesarias
```bash
# Supabase (ya existentes)
NEXT_PUBLIC_SUPABASE_URL=https://swfgvfhpmicwptupjyko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NASA FIRMS (obtener en paso 2.1)
NASA_FIRMS_KEY=tu_key_aqui

# Google Earth Engine (obtener en pasos 2.2.x)
GEE_SERVICE_ACCOUNT_EMAIL=carbono-gee-service@carbono-bolivia.iam.gserviceaccount.com
GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Paquetes NPM a Instalar (Tarea 1.1)
```bash
npm install leaflet react-leaflet @turf/turf jspdf xlsx recharts
npm install -D @types/leaflet
```

### Tips de Desarrollo
- Usar React Query devtools para debugging de caché
- Usar Prisma Studio (`npx prisma studio`) para ver/editar datos
- Los mapas deben cargarse con `dynamic import` para evitar SSR issues:
  ```typescript
  const Map = dynamic(() => import('@/components/maps/leaflet-map'), { ssr: false })
  ```
- Para debugging de GEE, usar logs en Vercel Functions (límite de 10s de timeout)
- NASA FIRMS retorna CSV, usar papaparse o parser manual

### Recursos Útiles
- [Google Earth Engine Datasets](https://developers.google.com/earth-engine/datasets)
- [NASA FIRMS API Docs](https://firms.modaps.eosdis.nasa.gov/api/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [Turf.js Examples](http://turfjs.org/docs/)
- [PRD Original](../prd-carbono-national-platform.md)

---

**Estado:** ✅ Fase 2 Completa - Sub-tareas detalladas generadas
**Total de Sub-tareas:** 150+
**Tiempo Estimado MVP:** 4-5 semanas con 1 desarrollador full-time

**¡Listo para empezar la implementación! 🚀**
