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

- [ ] **2.0 Integraciones de APIs Externas (NASA FIRMS & Google Earth Engine)**
  - [ ] 2.1 Obtener API Key de NASA FIRMS (registrarse en https://firms.modaps.eosdis.nasa.gov/api/area/ - toma 2 minutos)
  - [ ] 2.2 Configurar Google Earth Engine Service Account en Google Cloud Console
    - [ ] 2.2.1 Crear proyecto en Google Cloud Console: "carbono-bolivia"
    - [ ] 2.2.2 Habilitar Earth Engine API
    - [ ] 2.2.3 Crear Service Account con nombre "carbono-gee-service"
    - [ ] 2.2.4 Asignar rol "Earth Engine Resource Admin"
    - [ ] 2.2.5 Crear y descargar JSON key
    - [ ] 2.2.6 Extraer email y private key del JSON y agregar a `.env.local`
  - [ ] 2.3 Crear `src/lib/gee/client.ts` - Cliente de Google Earth Engine con autenticación mediante Service Account (usar `@google/earthengine` o hacer requests HTTP directos a Earth Engine REST API)
  - [ ] 2.4 Crear `src/lib/gee/datasets.ts` - Configuración de datasets (Hansen Global Forest Change: `UMD/hansen/global_forest_change_2023_v1_11`, Sentinel-2: `COPERNICUS/S2_SR`, MODIS: `MODIS/006/MOD13A2`, NASA Biomass: `NASA/ORNL/biomass_carbon_density/v1`)
  - [ ] 2.5 Crear `src/app/api/gee/analyze-area/route.ts` - Endpoint POST que recibe GeoJSON, consulta GEE y retorna: forestCoveragePercent, biomassPerHectare, forestType, lastChangeDetected, changePercent, verified
  - [ ] 2.6 Crear `src/app/api/gee/historical-trends/route.ts` - Endpoint GET que retorna serie temporal de NDVI y eventos de deforestación
  - [ ] 2.7 Crear `src/lib/cache/api-cache.ts` - Sistema de caché usando la tabla ApiCache (TTL: 24h para GEE, 3h para NASA)
  - [ ] 2.8 Crear `src/lib/nasa-firms/client.ts` - Cliente HTTP para NASA FIRMS API (usar axios)
  - [ ] 2.9 Crear `src/lib/nasa-firms/parser.ts` - Parser de CSV de NASA FIRMS a objetos TypeScript DeforestationAlert con geocodificación de departamento usando `bolivia-boundaries.ts`
  - [ ] 2.10 Crear `src/app/api/cron/fetch-nasa-firms/route.ts` - Cron job que se ejecuta cada 3 horas, consulta NASA FIRMS para Bolivia (bbox: -69.6,-23,-57.5,-10), parsea resultados, detecta proyectos cercanos (radio 5km) usando @turf/distance, inserta alertas nuevas en DB
  - [ ] 2.11 Crear `vercel.json` con configuración de cron: `{ "crons": [{ "path": "/api/cron/fetch-nasa-firms", "schedule": "0 */3 * * *" }] }`
  - [ ] 2.12 Crear `src/app/api/alerts/latest/route.ts` - Endpoint público GET que retorna alertas de las últimas 48 horas

- [ ] **3.0 Sistema de Gestión de Proyectos de Carbono**
  - [ ] 3.1 Crear tipos TypeScript en `src/types/project.ts` (ProjectType, ProjectStatus, CreateProjectInput, UpdateProjectInput, ProjectWithRelations)
  - [ ] 3.2 Crear schemas de validación Zod en `src/lib/validations/project.ts` (createProjectSchema, updateProjectSchema)
  - [ ] 3.3 Crear `src/lib/carbon/calculator.ts` con función `calculateCarbonCapture(input: CarbonCalculationInput): CarbonCalculationOutput` que implementa la fórmula: CO₂ = Área × Biomasa × Factor
  - [ ] 3.4 Crear `src/lib/geo/turf-utils.ts` con funciones: `calculatePolygonArea(geojson)`, `calculateDistance(point1, point2)`, `isPointInBolivia(lat, lng)`, `simplifyPolygon(geojson)`
  - [ ] 3.5 Crear `src/app/api/projects/route.ts`:
    - [ ] 3.5.1 GET: Lista de proyectos con filtros (departamento, tipo, estado, dateFrom, dateTo), ordenamiento, paginación (20 por página), búsqueda por nombre
    - [ ] 3.5.2 POST: Crear proyecto - validar con Zod, calcular área con Turf, llamar a `/api/gee/analyze-area`, ejecutar `calculateCarbonCapture`, guardar en DB con estado PENDING
  - [ ] 3.6 Crear `src/app/api/projects/[id]/route.ts`:
    - [ ] 3.6.1 GET: Obtener detalle completo con relaciones (organization, documents, carbonCredits, statusHistory)
    - [ ] 3.6.2 PATCH: Actualizar proyecto - recalcular CO₂ si cambió área o tipo
    - [ ] 3.6.3 DELETE: Soft delete (marcar active = false)
  - [ ] 3.7 Crear `src/app/api/projects/[id]/status/route.ts` - PATCH para cambiar estado del proyecto, registrar en ProjectStatusHistory, crear notificación si pasa a CERTIFIED
  - [ ] 3.8 Crear `src/app/api/projects/[id]/documents/route.ts`:
    - [ ] 3.8.1 POST: Subir documento a Supabase Storage bucket `project-documents`, validar tipo (PDF/JPG/PNG) y tamaño (<5MB), guardar metadata en ProjectDocument
    - [ ] 3.8.2 GET: Listar documentos del proyecto con URLs firmadas de Supabase
  - [ ] 3.9 Crear página `src/app/(dashboard)/proyectos/page.tsx` con tabla de proyectos
  - [ ] 3.10 Crear `src/components/proyectos/project-table.tsx` - Tabla con @tanstack/react-table, columnas: Nombre, Tipo, Departamento, Área (ha), CO₂/año, Estado, Fecha creación, acciones (Ver/Editar/Eliminar)
  - [ ] 3.11 Crear página `src/app/(dashboard)/proyectos/nuevo/page.tsx` con formulario multi-step
  - [ ] 3.12 Crear `src/components/proyectos/project-form.tsx` - Formulario con react-hook-form + Zod, 5 pasos: 1) Info básica, 2) Ubicación (mapa), 3) Organización, 4) Documentos, 5) Revisión
  - [ ] 3.13 Crear `src/components/proyectos/project-map-drawer.tsx` - Herramienta para dibujar polígonos en mapa Leaflet, calcular área automáticamente, validar que esté en Bolivia
  - [ ] 3.14 Crear `src/components/proyectos/carbon-preview.tsx` - Preview en tiempo real de cálculos de CO₂ e ingresos (3 escenarios) mientras se dibuja el polígono
  - [ ] 3.15 Crear página `src/app/(dashboard)/proyectos/[id]/page.tsx` con vista detallada
  - [ ] 3.16 Crear `src/components/proyectos/project-detail-view.tsx` - Vista con tabs: Info General, Mapa, Documentos, Análisis GEE, Historial de Estados
  - [ ] 3.17 Crear `src/components/proyectos/document-upload.tsx` - Drag & drop para subir documentos usando Supabase Storage
  - [ ] 3.18 Crear `src/components/proyectos/status-change-dialog.tsx` - Dialog para cambiar estado con confirmación
  - [ ] 3.19 Crear `src/components/proyectos/gee-analysis-badge.tsx` - Badge "✓ Verificado con GEE" que muestra tooltip con detalles del análisis

- [ ] **4.0 Dashboard Interactivo & Visualización de Datos**
  - [ ] 4.1 Crear página `src/app/(dashboard)/dashboard/carbono/page.tsx` - Dashboard principal de carbono (reemplazar el dashboard actual)
  - [ ] 4.2 Crear `src/components/dashboard/carbono/stats-cards.tsx` - 4 cards con métricas principales:
    - [ ] 4.2.1 Card 1: Total hectáreas protegidas (suma de proyectos activos/certificados)
    - [ ] 4.2.2 Card 2: Total tCO₂/año capturadas (suma calculada)
    - [ ] 4.2.3 Card 3: Ingresos potenciales USD (rango min-max-promedio)
    - [ ] 4.2.4 Card 4: Alertas activas últimas 48h (contador con badge rojo)
    - [ ] 4.2.5 Cada card debe mostrar icono, número grande (48px), label, indicador de tendencia (% arriba/abajo)
  - [ ] 4.3 Crear `src/components/maps/leaflet-map.tsx` - Componente base de mapa con Leaflet (dynamic import para optimización), configurar tiles de OpenStreetMap, centrar en Bolivia (lat: -16.5, lng: -64.5, zoom: 6)
  - [ ] 4.4 Crear `src/components/maps/project-marker.tsx` - Marker personalizado con colores por estado (Pendiente: amarillo, Aprobado: azul, Certificado: verde, Activo: verde oscuro)
  - [ ] 4.5 Crear `src/components/maps/alert-marker.tsx` - Marker de alerta con colores por severidad (Baja: amarillo, Media: naranja, Alta: rojo)
  - [ ] 4.6 Crear `src/components/maps/map-tooltip.tsx` - Tooltip personalizado que aparece al hover sobre markers
  - [ ] 4.7 Crear `src/components/dashboard/carbono/carbon-map.tsx` - Mapa interactivo que muestra proyectos y alertas, con clustering si hay >100 markers (usar react-leaflet-cluster), tooltips al hover, click para ver detalle
  - [ ] 4.8 Crear `src/components/dashboard/carbono/map-controls.tsx` - Controles para cambiar capas del mapa: toggle Proyectos, toggle Alertas, toggle Cobertura forestal, switch Vista satelital/Topográfica
  - [ ] 4.9 Crear `src/components/dashboard/carbono/filters-bar.tsx` - Barra de filtros con selects: Departamento (todos los 9), Rango de fechas (date-picker), Tipo de proyecto, Estado
  - [ ] 4.10 Crear `src/components/dashboard/carbono/trend-charts.tsx` - 4 gráficos con Recharts:
    - [ ] 4.10.1 Gráfico de líneas: Deforestación mensual (últimos 12 meses) - datos de alertas agrupadas por mes
    - [ ] 4.10.2 Gráfico de barras: Captura de CO₂ por departamento - suma de proyectos por departamento
    - [ ] 4.10.3 Gráfico de dona: Distribución de proyectos por tipo - conteo por ProjectType
    - [ ] 4.10.4 Gráfico de área: Evolución de cobertura forestal - datos históricos de GEE
  - [ ] 4.11 Implementar actualización automática de métricas cuando cambian filtros (usar React Query con refetch)
  - [ ] 4.12 Optimizar performance del mapa: lazy loading, debounce en filtros, virtualización de markers si >500

- [ ] **5.0 Sistema de Alertas y Monitoreo de Deforestación**
  - [ ] 5.1 Crear tipos TypeScript en `src/types/alert.ts` (AlertSeverity, AlertStatus, AlertWithProject)
  - [ ] 5.2 Crear schemas de validación Zod en `src/lib/validations/alert.ts` (updateAlertStatusSchema)
  - [ ] 5.3 Crear `src/app/api/alerts/route.ts`:
    - [ ] 5.3.1 GET: Lista de alertas con filtros (departamento, severidad, estado, dateFrom, dateTo), ordenamiento por fecha DESC, paginación
    - [ ] 5.3.2 PATCH: Actualizar estado de alerta (Nueva → Investigando → Resuelta), agregar notas
  - [ ] 5.4 Crear `src/app/api/alerts/[id]/route.ts` - GET detalle completo de alerta con análisis de GEE (hectáreas perdidas estimadas)
  - [ ] 5.5 Crear página `src/app/(dashboard)/alertas/page.tsx` con tabla de alertas y mapa
  - [ ] 5.6 Crear `src/components/alertas/alerts-table.tsx` - Tabla con columnas: Ubicación (lat/lng), Fecha, Departamento, Severidad (badge), Estado, Proyecto cercano (si aplica), Acciones
  - [ ] 5.7 Crear `src/components/alertas/severity-badge.tsx` - Badge con colores: Baja (yellow), Media (orange), Alta (red)
  - [ ] 5.8 Crear `src/components/alertas/alert-detail-dialog.tsx` - Dialog que muestra: mapa con ubicación exacta, datos de NASA (confianza, brillo), análisis de GEE, proyecto cercano si aplica, campo de notas
  - [ ] 5.9 Crear `src/components/alertas/alert-status-select.tsx` - Select para cambiar estado con confirmación
  - [ ] 5.10 Implementar lógica de detección de proyectos cercanos en el cron job (usar @turf/distance con radio de 5km)
  - [ ] 5.11 Crear notificación automática cuando alerta de alta severidad está cerca de proyecto (llamar a API de notificaciones)

- [ ] **6.0 Portal Público de Transparencia**
  - [ ] 6.1 Crear layout `src/app/(public)/layout.tsx` - Layout para páginas públicas sin sidebar, con header público y footer
  - [ ] 6.2 Reemplazar `src/app/page.tsx` con nueva landing page de CARBONO (mover contenido actual a `src/app/old-landing-backup.tsx`)
  - [ ] 6.3 Crear `src/components/public/hero-carbono.tsx` - Hero section con:
    - [ ] 6.3.1 Título principal: "Bolivia protege X millones de hectáreas de bosque"
    - [ ] 6.3.2 4 métricas nacionales destacadas (solo proyectos certificados/activos)
    - [ ] 6.3.3 CTA button: "Ver Proyectos" que scroll a mapa
  - [ ] 6.4 Crear `src/components/public/public-map.tsx` - Mapa público que muestra solo proyectos con estado CERTIFIED o ACTIVE, tooltips básicos sin datos sensibles (nombre, tipo, tCO₂/año)
  - [ ] 6.5 Crear `src/components/public/featured-projects.tsx` - Grid con 3-6 proyectos destacados (los de mayor captura de CO₂), cards con imagen, nombre, departamento, métricas básicas
  - [ ] 6.6 Crear `src/components/public/department-ranking.tsx` - Ranking de departamentos por hectáreas protegidas, visualización con barras horizontales, top 5
  - [ ] 6.7 Crear `src/components/public/how-it-works.tsx` - Sección "¿Cómo funciona?" con 4 pasos: 1) Registro, 2) Verificación satelital, 3) Certificación, 4) Monetización
  - [ ] 6.8 Crear `src/components/public/contact-form.tsx` - Formulario de contacto con campos: Nombre, Email, Tipo (Inversor/Organización/Prensa), Mensaje, guardar en tabla ContactForm o enviar email
  - [ ] 6.9 Crear API route `src/app/api/public/metrics/route.ts` - Endpoint público que retorna métricas agregadas (cache de 1 hora)
  - [ ] 6.10 Implementar SEO: metadata en layout público, Open Graph tags, schema.org JSON-LD
  - [ ] 6.11 Optimizar performance de landing page: usar ISR (revalidate cada 3600 segundos), optimizar imágenes con next/image

- [ ] **7.0 Sistema de Generación de Reportes y Exportación**
  - [ ] 7.1 Crear tipos TypeScript en `src/types/report.ts` (ReportType, ReportFormat, ReportParameters)
  - [ ] 7.2 Crear schemas de validación Zod en `src/lib/validations/report.ts` (generateReportSchema)
  - [ ] 7.3 Crear `src/lib/reports/pdf-generator.ts` - Generador de PDFs con jsPDF:
    - [ ] 7.3.1 Función `generateNationalReport(data)` - Reporte completo nacional
    - [ ] 7.3.2 Función `generateDepartmentReport(department, data)` - Reporte filtrado por departamento
    - [ ] 7.3.3 Función `generateProjectReport(projectId, data)` - Reporte detallado de proyecto individual
    - [ ] 7.3.4 Función `generateMonthlyReport(month, year, data)` - Reporte mensual de actividad
    - [ ] 7.3.5 Template con: portada con logo del gobierno (asset a incluir), header/footer, sección de resumen ejecutivo, métricas con iconos, mapa estático (screenshot), gráficos (convertir charts a imágenes con canvas.toDataURL), tabla de proyectos, disclaimer
  - [ ] 7.4 Crear `src/lib/reports/excel-generator.ts` - Generador de Excel con xlsx:
    - [ ] 7.4.1 Hoja 1: Lista de proyectos con todas las columnas (nombre, tipo, departamento, área, CO₂, estado, fechas)
    - [ ] 7.4.2 Hoja 2: Lista de alertas (ubicación, fecha, severidad, estado)
    - [ ] 7.4.3 Hoja 3: Métricas agregadas por departamento (suma de hectáreas, suma de CO₂)
    - [ ] 7.4.4 Formato de celdas: moneda para USD, números con separador de miles, fechas en formato DD/MM/YYYY
  - [ ] 7.5 Crear `src/app/api/reports/generate/route.ts` - POST que recibe tipo, formato, filtros, genera reporte (PDF o Excel), sube a Supabase Storage bucket `reports`, guarda registro en tabla Report, retorna downloadUrl
  - [ ] 7.6 Crear `src/app/api/reports/route.ts` - GET lista de reportes generados con paginación, filtro por tipo
  - [ ] 7.7 Crear página `src/app/(dashboard)/reportes/page.tsx` con generador y historial
  - [ ] 7.8 Crear `src/components/reportes/report-generator-form.tsx` - Formulario con selects: Tipo de reporte (Nacional/Departamento/Proyecto/Mensual), Formato (PDF/Excel), Filtros (departamento, rango de fechas), botón "Generar Reporte" con loading state
  - [ ] 7.9 Crear `src/components/reportes/report-history-table.tsx` - Tabla con columnas: Tipo, Fecha generación, Usuario, Formato, Acciones (Descargar, Eliminar)
  - [ ] 7.10 Implementar generación asíncrona para reportes grandes (usar background jobs o Vercel Background Functions si disponible)

- [ ] **8.0 Sistema de Gestión de Organizaciones**
  - [ ] 8.1 Crear tipos TypeScript en `src/types/organization.ts` (OrganizationType, CreateOrganizationInput, OrganizationWithProjects)
  - [ ] 8.2 Crear schemas de validación Zod en `src/lib/validations/organization.ts` (createOrganizationSchema, updateOrganizationSchema)
  - [ ] 8.3 Crear `src/app/api/organizations/route.ts`:
    - [ ] 8.3.1 GET: Lista de organizaciones con paginación, búsqueda por nombre, filtro por tipo
    - [ ] 8.3.2 POST: Crear organización - validar con Zod, guardar en DB
  - [ ] 8.4 Crear `src/app/api/organizations/[id]/route.ts`:
    - [ ] 8.4.1 GET: Detalle de organización con proyectos relacionados, métricas agregadas (total hectáreas, total CO₂)
    - [ ] 8.4.2 PATCH: Actualizar organización
    - [ ] 8.4.3 DELETE: Soft delete (solo si no tiene proyectos activos)
  - [ ] 8.5 Crear página `src/app/(dashboard)/organizaciones/page.tsx` con lista de organizaciones
  - [ ] 8.6 Crear página `src/app/(dashboard)/organizaciones/[id]/page.tsx` con detalle y lista de proyectos de la organización
  - [ ] 8.7 Crear `src/components/organizaciones/organization-form.tsx` - Formulario con react-hook-form para crear/editar organización (campos: nombre, tipo, email, teléfono, dirección)
  - [ ] 8.8 Crear `src/components/organizaciones/organization-card.tsx` - Card que muestra: nombre, tipo, número de proyectos, métricas agregadas (hectáreas, CO₂), link a detalle
  - [ ] 8.9 Implementar creación inline de organización en el formulario de proyecto (modal o drawer que se abre desde el select de organización)
  - [ ] 8.10 Agregar validación: no permitir eliminar organización si tiene proyectos en estado CERTIFIED o ACTIVE

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
  - [ ] 9.7 Actualizar `src/components/sidebar/app-sidebar.tsx` - Agregar nuevas rutas: Dashboard Carbono, Proyectos, Alertas, Organizaciones, Reportes
  - [ ] 9.8 Crear breadcrumbs component para navegación contextual en páginas internas
  - [ ] 9.9 Implementar loading states con Skeleton components de shadcn/ui en todas las páginas
  - [ ] 9.10 Implementar error boundaries para manejo de errores graceful
  - [ ] 9.11 Agregar tooltips informativos en campos complejos del formulario de proyecto
  - [ ] 9.12 Implementar confirmaciones antes de acciones destructivas (eliminar proyecto, eliminar organización)

- [ ] **10.0 Testing, Optimización y Deployment**
  - [ ] 10.1 Crear `prisma/seed.ts` con datos de prueba:
    - [ ] 10.1.1 15+ proyectos realistas distribuidos en los 9 departamentos de Bolivia
    - [ ] 10.1.2 10+ organizaciones de diferentes tipos (Comunidad Indígena, ONG, Gobierno Local)
    - [ ] 10.1.3 20+ alertas de deforestación con diferentes severidades y estados
    - [ ] 10.1.4 Historial de cambios de estado para algunos proyectos
    - [ ] 10.1.5 Documentos de ejemplo (usar URLs públicas o placeholders)
  - [ ] 10.2 Ejecutar `npx prisma db seed` para poblar la base de datos
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
