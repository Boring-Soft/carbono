# Tasks: Nuevos Features de Análisis Avanzado de Áreas

Documento generado para implementar los 7 nuevos features de análisis avanzado de áreas forestales en la plataforma CARBONO.

## Relevant Files

### Nuevos Archivos a Crear

#### Clients y Utilidades
- `src/lib/osm/overpass-client.ts` - Cliente HTTP para OpenStreetMap Overpass API (consulta ríos, edificios, comunidades)
- `src/lib/osm/parser.ts` - Parser de respuestas XML/JSON de OSM Overpass API
- `src/lib/osm/types.ts` - TypeScript types para OSM (Waterway, Building, Place)
- `src/lib/microsoft/building-footprints-client.ts` - Cliente para Microsoft Building Footprints API
- `src/lib/geo/area-analyzer.ts` - Orquestador principal que coordina todos los análisis (árboles, ríos, casas, comunidades)
- `src/lib/geo/forest-mask.ts` - Funciones para crear máscaras de bosque y vectorización
- `src/lib/geo/tree-counter.ts` - Estimación de árboles basada en densidad de cobertura forestal

#### Componentes UI
- `src/components/maps/satellite-layer-control.tsx` - ✅ CREADO - Control toggle para cambiar entre vista street/satellite con ToggleGroup de shadcn/ui
- `src/components/maps/area-analysis-loader.tsx` - Loader con progreso multi-stage para análisis de área
- `src/components/maps/area-analysis-results.tsx` - Dialog modal con resultados detallados del análisis
- `src/components/maps/forest-mask-control.tsx` - Control para ajustar polígono solo a áreas de bosque
- `src/components/maps/density-threshold-slider.tsx` - Slider para ajustar umbral mínimo de densidad forestal
- `src/components/dashboard/national-forest-stats.tsx` - Card component con estadísticas nacionales de inventario forestal
- `src/components/dashboard/national-forest-trends.tsx` - Gráfico de tendencias históricas de cobertura forestal
- `src/components/proyectos/area-details-section.tsx` - Sección en ProjectDetailView que muestra análisis detallado

#### API Routes
- `src/app/api/analysis/area/route.ts` - POST endpoint que orquesta análisis completo de área (árboles, ríos, casas, comunidades)
- `src/app/api/national/forest-stats/route.ts` - GET endpoint para estadísticas nacionales de bosques
- `src/app/api/gee/forest-mask/route.ts` - POST endpoint para obtener máscara de bosque y vectorizar
- `src/app/api/gee/snap-to-forest/route.ts` - POST endpoint para ajustar polígono a límites de bosque

#### Types
- `src/types/analysis.ts` - Types para AreaAnalysisResult, TreeEstimation, WaterwayData, BuildingData, CommunityData
- `src/types/national-stats.ts` - Types para NationalForestStats, DepartmentStats, HistoricalTrend

### Archivos Existentes a Modificar

- `src/components/proyectos/project-form.tsx` - Integrar botón "Analizar Área Detalladamente" y "Ajustar a Bosque"
- `src/components/proyectos/project-detail-view.tsx` - Mostrar análisis detallado de área con datos enriquecidos
- `src/components/maps/leaflet-map.tsx` - ✅ MODIFICADO - Agregado TILE_LAYERS config, soporte dinámico de cambio de tiles, export de providers
- `src/components/proyectos/project-map-drawer.tsx` - ✅ MODIFICADO - Integrado SatelliteLayerControl, auto-switch a satélite al dibujar, toast notifications
- `src/components/dashboard/carbono/carbon-map.tsx` - Pendiente - Agregar toggle de vista satélite
- `src/app/(dashboard)/dashboard/carbono/page.tsx` - ✅ MODIFICADO - Integrado SatelliteLayerControl posicionado sobre el mapa
- `src/lib/gee/client.ts` - Agregar funciones: vectorizeForestMask(), snapPolygonToForest(), getNationalForestStats()
- `src/lib/gee/datasets.ts` - Agregar configuración para datasets de vectorización
- `src/types/project.ts` - Agregar campos detailedAnalysis?: AreaAnalysisResult

### Archivos de Configuración

- `.env` - Agregar variables: OVERPASS_API_URL, MICROSOFT_BUILDING_FOOTPRINTS_ENABLED
- `next.config.js` - ✅ MODIFICADO - Agregados dominios de tiles satélite en images.domains y Content-Security-Policy

### Documentación

- `docs/architecture/area-analysis.md` - Documento de arquitectura del sistema de análisis de áreas
- `docs/guides/area-calculation-logic.md` - Guía detallada de cómo funciona la lógica de cálculo de áreas
- `docs/api/osm-integration.md` - Documentación de integración con OpenStreetMap

## Notes

### Orden de Implementación Recomendado

1. **Feature #1 (Vista Satélite)** - Quick win, mejora inmediata de UX
2. **Feature #2 (Loader)** - Infraestructura necesaria para features siguientes
3. **Feature #3 (Inventario Nacional)** - Independiente, puede ir en paralelo
4. **Feature #4 (Análisis Detallado)** - Core feature, el más complejo
5. **Feature #5 (Auto-Delimitación)** - Depende de GEE client mejorado
6. **Feature #6 (Filtrado Bosque)** - Similar a #5, puede compartir código
7. **Feature #7 (Documentación)** - Al final, cuando todo esté implementado

### Dependencias Técnicas

- **Google Earth Engine**: Requiere credenciales configuradas en `.env` (GEE_SERVICE_ACCOUNT_EMAIL, GEE_PRIVATE_KEY)
- **OpenStreetMap Overpass API**: Gratis, sin API key, pero respetar rate limits (10k requests/día)
- **Microsoft Building Footprints**: Dataset público, requiere descarga inicial y setup de PostGIS (opcional)
- **Leaflet**: Ya instalado, pero necesita plugin adicional para control de capas

### Consideraciones de Performance

- Análisis completo de área grande (>1000 km²): 30-60 segundos
- Cachear resultados de inventario nacional por 24 horas
- Usar React Query con staleTime apropiado para cada endpoint
- Implementar debounce en Density Threshold Slider (500ms)

### Testing Strategy

- Usar datos de Bolivia para tests (evitar datos ficticios)
- Mockear respuestas de GEE con datos realistas
- Tests E2E para flujo completo: dibujar → analizar → ver resultados
- Tests unitarios para parsers (OSM, GEE responses)

## Tasks

- [x] **1.0 Implementar Vista Satélite en Mapas de Dibujo**
  - [x] 1.1 Crear componente `SatelliteLayerControl.tsx` con toggle entre 3 providers (Street, ESRI Satellite, Google Satellite)
  - [x] 1.2 Configurar tile layers en `leaflet-map.tsx`: ESRI World Imagery (default), Google Satellite (fallback), Mapbox (opcional)
  - [x] 1.3 Integrar SatelliteLayerControl en `ProjectMapDrawer` (formulario de nuevo proyecto)
  - [x] 1.4 Implementar auto-switch a vista satélite cuando usuario empieza a dibujar polígono (map.on('draw:drawstart'))
  - [x] 1.5 Agregar toggle satélite en dashboard map (`carbon-map.tsx`) con persistencia en localStorage
  - [x] 1.6 Actualizar `next.config.js` para permitir dominios de tiles: server.arcgisonline.com, mt0-3.google.com, api.mapbox.com

- [x] **2.0 Implementar Sistema de Loader Inteligente con Progreso**
  - [x] 2.1 Crear hook custom `useAreaAnalysis()` que maneja estados: idle, analyzing, success, error
  - [x] 2.2 Implementar componente `AreaAnalysisLoader.tsx` con progress bar multi-stage (5 stages: forest, buildings, waterways, communities, report)
  - [x] 2.3 Crear componente `AreaAnalysisResults.tsx` - Dialog modal con animated cards para cada métrica (trees, buildings, rivers, communities)
  - [x] 2.4 Integrar Framer Motion para animaciones: progress bar, número contador animado (AnimatedNumber), fade-in de results
  - [x] 2.5 Implementar estimación de tiempo por stage basado en área del polígono (formula: baseTime + (area * factor))
  - [x] 2.6 Agregar estados de error con mensajes específicos y botón "Reintentar"
  - [x] 2.7 Implementar toast notifications con Sonner: inicio de análisis, error, éxito con link a resultados

- [x] **3.0 Implementar Dashboard Nacional de Inventario Forestal**
  - [x] 3.1 Crear API route `/api/national/forest-stats/route.ts` que consulta GEE con Hansen dataset para Bolivia completa
  - [x] 3.2 Implementar función en `gee/client.ts`: `getNationalForestStats()` que calcula hectáreas por departamento
  - [x] 3.3 Configurar caché de resultados usando ApiCache model (24 horas de expiración)
  - [x] 3.4 Crear componente `NationalForestStats.tsx` con 4 stat cards: Total Bosques, Cobertura %, Pérdida Anual, Departamento Líder
  - [x] 3.5 Implementar gráfico de barras con Recharts: hectáreas de bosque por departamento (9 departamentos)
  - [x] 3.6 Crear gráfico de líneas: tendencia histórica 2000-2023 usando Hansen loss data
  - [x] 3.7 Integrar NationalForestStats en dashboard principal (`dashboard/carbono/page.tsx`) en nueva sección arriba del mapa
  - [x] 3.8 Agregar botón "Actualizar Datos" que invalida caché y re-consulta GEE (admin only)

- [ ] **4.0 Implementar Análisis Detallado de Áreas (Árboles, Ríos, Casas, Comunidades)**
  - [ ] 4.1 Crear cliente OpenStreetMap: `osm/overpass-client.ts` con métodos fetchWaterways(), fetchBuildings(), fetchCommunities()
  - [ ] 4.2 Implementar queries Overpass QL optimizadas para Bolivia (bbox validation, timeout 60s, format JSON)
  - [ ] 4.3 Crear parser `osm/parser.ts` que extrae data útil: nombres de ríos, tipos de edificios, población de comunidades
  - [ ] 4.4 Implementar estimación de árboles en `geo/tree-counter.ts` usando GEE tree cover density (formula: area × density × trees_per_pixel)
  - [ ] 4.5 Crear orquestador `geo/area-analyzer.ts` que ejecuta 4 análisis en paralelo con Promise.all()
  - [ ] 4.6 Implementar API `/api/analysis/area/route.ts` que recibe polygon, ejecuta area-analyzer, retorna AreaAnalysisResult
  - [ ] 4.7 Agregar validaciones: polígono dentro de Bolivia, área max 100,000 ha, timeout 60s
  - [ ] 4.8 Crear types en `types/analysis.ts`: TreeEstimation (min/max/confidence), WaterwayData (rivers/streams/length), BuildingData (total/residential/area), CommunityData (count/names/population)
  - [ ] 4.9 Implementar componente results `AreaAnalysisResults.tsx` con 4 sections expandibles: 🌳 Árboles, 🌊 Ríos, 🏠 Edificios, 🏘️ Comunidades
  - [ ] 4.10 Agregar botón "Analizar Área Detalladamente" en project-form después de dibujar polígono
  - [ ] 4.11 Implementar animación de números con CountUp.js para resultados (45,000 árboles contando de 0 a 45k)
  - [ ] 4.12 Agregar badges de confianza: Alta (>80%), Media (60-80%), Baja (<60%)
  - [ ] 4.13 Implementar botón "Descargar Reporte PDF" que genera PDF con todos los datos del análisis
  - [ ] 4.14 Guardar resultados en DB: agregar campo detailedAnalysis JSON en Project model
  - [ ] 4.15 Mostrar análisis guardado en ProjectDetailView en nueva sección "Análisis Detallado del Área"

- [ ] **5.0 Implementar Auto-Delimitación de Áreas de Bosque (Snap to Forest)**
  - [ ] 5.1 Crear función GEE en `gee/client.ts`: `snapPolygonToForest(polygon, threshold)` que retorna polígono ajustado
  - [ ] 5.2 Implementar vectorización de raster de cobertura forestal usando reduceToVectors() en Earth Engine
  - [ ] 5.3 Configurar parámetros de vectorización: scale 30m, geometryType polygon, maxPixels 1e10
  - [ ] 5.4 Implementar simplificación de geometrías complejas con tolerance 50m para reducir vértices
  - [ ] 5.5 Crear API route `/api/gee/snap-to-forest/route.ts` que recibe polygon original y threshold
  - [ ] 5.6 Implementar lógica de intersección usando Turf.js entre polígono original y forest mask
  - [ ] 5.7 Agregar botón "Ajustar a Límites de Bosque" en project-form que aparece después de dibujar
  - [ ] 5.8 Implementar visualización before/after: polígono original en rojo translúcido, ajustado en verde sólido
  - [ ] 5.9 Mostrar stats de ajuste: "Ajustado de 1,230 ha → 1,187 ha (bosque real). Excluidas: 43 ha de áreas no boscosas"

- [ ] **6.0 Implementar Filtrado Exclusivo de Zonas Boscosas (Forest Mask Filter)**
  - [ ] 6.1 Crear API route `/api/gee/forest-mask/route.ts` que retorna solo polígonos de bosque dentro del área seleccionada
  - [ ] 6.2 Implementar detección de múltiples fragmentos de bosque (puede retornar array de polígonos)
  - [ ] 6.3 Crear componente `DensityThresholdSlider.tsx` con opciones: 10% (permisivo), 30% (estándar), 50% (estricto), 70% (muy estricto)
  - [ ] 6.4 Implementar debounce (500ms) en slider para evitar requests excesivos a GEE
  - [ ] 6.5 Agregar visualización de áreas excluidas: overlay rojo semi-transparente sobre zonas no boscosas
  - [ ] 6.6 Implementar componente `ForestMaskControl.tsx` que muestra: umbral actual, área original, área filtrada, % reducción
  - [ ] 6.7 Agregar opción "Aplicar Filtro" que reemplaza polígono original con polígonos filtrados
  - [ ] 6.8 Implementar preview mode: mostrar filtro sin aplicar, con botón "Aplicar" o "Cancelar"
  - [ ] 6.9 Guardar metadata del filtro aplicado: threshold usado, fecha de aplicación, área excluida
  - [ ] 6.10 Agregar badge "Filtrado por Bosque" en project cards que tienen filtro aplicado

- [ ] **7.0 Crear Documentación Técnica Completa de Lógica de Áreas**
  - [ ] 7.1 Crear `docs/architecture/area-analysis.md` con diagrama de flujo del sistema de análisis
  - [ ] 7.2 Documentar en `docs/guides/area-calculation-logic.md`: fórmulas de cálculo, conversiones (m² → ha → km²), proyecciones geográficas
  - [ ] 7.3 Crear ejemplos de código reales para: calcular área con Turf.js, validar polígonos, detectar auto-intersecciones
  - [ ] 7.4 Documentar integración GEE: autenticación, rate limits, datasets usados, best practices de caché
  - [ ] 7.5 Crear guía de troubleshooting para errores comunes: credenciales GEE inválidas, polígono fuera de Bolivia, timeout de APIs

## Success Criteria

### Feature #1 - Vista Satélite
- ✅ Usuario puede cambiar entre vista street/satellite con toggle
- ✅ Vista satélite se activa automáticamente al dibujar polígono
- ✅ Tiles cargan en <2 segundos
- ✅ Funciona en desktop, tablet, mobile

### Feature #2 - Loader Inteligente
- ✅ Progress bar muestra 5 stages con nombres claros
- ✅ Tiempo estimado es preciso (±20%)
- ✅ Resultados se animan suavemente con Framer Motion
- ✅ Manejo de errores con opción de retry

### Feature #3 - Inventario Nacional
- ✅ Stats nacionales muestran datos reales de Hansen 2023
- ✅ Gráficos renderizan correctamente para 9 departamentos
- ✅ Datos se cachean por 24h
- ✅ Actualización manual funciona (admin only)

### Feature #4 - Análisis Detallado
- ✅ API retorna estimación de árboles con rango (min-max) y confianza
- ✅ Ríos, edificios, comunidades muestran datos reales de OSM
- ✅ Análisis completo de área 100 km² termina en <30s
- ✅ Resultados se guardan en DB y son recuperables
- ✅ PDF con reporte completo se genera correctamente

### Feature #5 - Auto-Delimitación
- ✅ Polígono se ajusta a límites de bosque con precisión >85%
- ✅ Visualización before/after es clara
- ✅ Stats de ajuste son precisas (área original vs ajustada)
- ✅ Funciona con polígonos complejos (>100 vértices)

### Feature #6 - Filtrado Bosque
- ✅ Slider de umbral funciona con debounce
- ✅ Preview muestra áreas excluidas en rojo
- ✅ Múltiples fragmentos de bosque se manejan correctamente
- ✅ Metadata del filtro se guarda en proyecto

### Feature #7 - Documentación
- ✅ Arquitectura documentada con diagramas claros
- ✅ Ejemplos de código funcionan sin modificación
- ✅ Guía de troubleshooting cubre 80% de errores comunes
- ✅ Documentación incluye referencias a papers de IPCC y Hansen

## Technical Debt & Future Improvements

### Optimizaciones
- Implementar clustering de markers en mapa cuando hay >500 proyectos
- Comprimir responses de GEE (GeoJSON puede ser muy grande)
- Implementar WebWorkers para procesamiento de polígonos complejos en cliente

### Features Adicionales (Post-MVP)
- Comparación temporal: "Cómo cambió esta área en los últimos 5 años"
- Exportar análisis a formatos GIS (Shapefile, KML, GeoPackage)
- API pública para terceros (con rate limiting)
- Integración con drones para validación en campo

### Monitoreo
- Agregar analytics para tracking de uso de features
- Logs detallados de requests a GEE para debugging
- Alertas cuando rate limits se acercan al límite
