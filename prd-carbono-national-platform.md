# PRD: CARBONO - Plataforma Nacional de Monitoreo y Registro de Créditos de Carbono

## 1. Introduction/Overview

### Problema
Bolivia posee uno de los activos naturales más valiosos del continente: más de 50 millones de hectáreas de bosques con capacidad de captura estimada en 150-200 millones de toneladas de CO₂ anuales, representando un valor potencial de $2.3-15 mil millones de dólares en créditos de carbono para la próxima década.

Sin embargo, **Bolivia carece de infraestructura digital** para:
- Monitorear en tiempo real el estado de sus bosques
- Registrar y certificar proyectos de carbono de manera centralizada
- Demostrar a compradores internacionales la legitimidad de los créditos
- Transparentar la distribución de beneficios a comunidades
- Conectar con mercados internacionales (Artículo 6 del Acuerdo de París)

Esta brecha tecnológica resulta en:
- **Pérdida de oportunidades económicas**: ~$500M USD anuales no monetizados
- **Falta de transparencia**: Proyectos operando en silos sin trazabilidad
- **Incapacidad de respuesta**: Deforestación sin detección temprana
- **Desconfianza internacional**: Sin datos verificables para certificadoras

### Solución
**CARBONO** es una plataforma web centralizada que permite al Gobierno de Bolivia:

1. **Visualizar** en tiempo real el inventario nacional de carbono con mapas interactivos
2. **Registrar y gestionar** proyectos de carbono con trazabilidad completa
3. **Monitorear** deforestación y cambios en cobertura forestal vía satélite (Google Earth Engine + NASA FIRMS)
4. **Calcular** automáticamente el potencial de captura de CO₂ e ingresos por proyecto
5. **Transparentar** datos públicamente para atraer inversión internacional
6. **Generar reportes** automáticos para auditorías y certificaciones internacionales

### Objetivo del MVP
Crear una plataforma funcional y visualmente impactante que demuestre al **Gobierno de Bolivia** que mediante software moderno pueden:
- Centralizar y monetizar sus activos de carbono
- Posicionarse como líder regional en mercados de carbono
- Atraer inversión extranjera legítima con datos verificables
- Responder en tiempo real a amenazas de deforestación

---

## 2. Goals

### Objetivos de Negocio
1. **Cerrar venta con el Gobierno de Bolivia** demostrando valor inmediato y ROI claro
2. **Posicionar a Bolivia** como pionera en gestión digital de carbono en Sudamérica
3. **Habilitar monetización** de al menos 1% del potencial de carbono en el primer año (target: $10M+ USD)
4. **Atraer inversión internacional** mediante transparencia radical de datos

### Objetivos Técnicos
1. **Integración satelital funcional**: Google Earth Engine + NASA FIRMS operando en tiempo real
2. **Plataforma escalable**: Arquitectura que soporte expansión a 10,000+ proyectos
3. **Performance óptimo**: Dashboard carga en <2 segundos, mapas interactivos fluidos
4. **Datos verificables**: Toda métrica respaldada por fuentes científicas (IPCC, NASA, ESA)

### Objetivos de Usuario (Gobierno)
1. **Visibilidad total**: Ver estado nacional de carbono en 1 pantalla
2. **Decisiones informadas**: Datos en tiempo real para políticas públicas
3. **Control centralizado**: Gestionar todos los proyectos desde un solo sistema
4. **Credibilidad internacional**: Plataforma que cumpla estándares de Verra, Gold Standard

### Métricas de Éxito (Post-MVP)
- **Adopción**: 50+ proyectos registrados en los primeros 3 meses
- **Engagement**: Gobierno accede al dashboard 3+ veces por semana
- **Visibilidad**: 1,000+ visitas mensuales al portal público
- **Conversión**: Al menos 3 proyectos certificados en los primeros 6 meses
- **Revenue**: Facilitar la venta de créditos por valor mínimo de $5M USD en el primer año

---

## 3. User Stories

### Como Superadministrador del Gobierno
1. **US-001**: Como SUPERADMIN, quiero ver un dashboard nacional con métricas clave (hectáreas de bosque, toneladas CO₂, ingresos potenciales, alertas activas) para tener visibilidad inmediata del estado del país.

2. **US-002**: Como SUPERADMIN, quiero ver un mapa interactivo de Bolivia con todos los proyectos registrados y alertas de deforestación, para identificar rápidamente zonas de interés o riesgo.

3. **US-003**: Como SUPERADMIN, quiero registrar nuevos proyectos de carbono con información detallada (nombre, tipo, ubicación geográfica, área, organización responsable), para centralizar toda la información nacional.

4. **US-004**: Como SUPERADMIN, quiero que el sistema calcule automáticamente la captura de CO₂ e ingresos potenciales basados en datos de Google Earth Engine, para tener estimaciones precisas sin trabajo manual.

5. **US-005**: Como SUPERADMIN, quiero recibir alertas cuando se detecte deforestación en zonas críticas, para coordinar respuestas rápidas con autoridades locales.

6. **US-006**: Como SUPERADMIN, quiero cambiar el estado de proyectos (Pendiente → Aprobado → Certificado), para mantener trazabilidad del proceso de certificación.

7. **US-007**: Como SUPERADMIN, quiero generar reportes automáticos en PDF/Excel por proyecto, departamento o período, para presentar a certificadoras internacionales y al gabinete ministerial.

8. **US-008**: Como SUPERADMIN, quiero filtrar proyectos por departamento, tipo, estado, y rango de fechas, para análisis específicos.

9. **US-009**: Como SUPERADMIN, quiero ver tendencias históricas de deforestación y captura de carbono, para evaluar el impacto de políticas públicas.

10. **US-010**: Como SUPERADMIN, quiero subir documentos oficiales (PDFs, imágenes) a cada proyecto, para mantener toda la documentación centralizada.

### Como Usuario Público (Portal de Transparencia)
11. **US-011**: Como ciudadano boliviano o inversionista internacional, quiero ver un mapa público con todos los proyectos activos y sus métricas básicas, para conocer los esfuos del país en conservación.

12. **US-012**: Como inversionista, quiero ver estadísticas nacionales agregadas (total de tCO₂ capturadas, ingresos generados, comunidades beneficiadas), para evaluar oportunidades de inversión.

13. **US-013**: Como ciudadano, quiero ver el ranking de departamentos más activos en conservación, para conocer qué regiones lideran la protección ambiental.

### Como Usuario del Sistema (Futuro - Fase 2)
14. **US-014**: Como organización comunitaria, quiero registrar mi proyecto y subirlo para aprobación gubernamental, para participar en el mercado de carbono.

15. **US-015**: Como auditor internacional, quiero acceder a datos verificables de cada proyecto con enlaces a fuentes satelitales, para realizar certificaciones.

---

## 4. Functional Requirements

### 4.1 Autenticación y Autorización

**FR-001**: El sistema DEBE utilizar Supabase Auth para autenticación de usuarios.

**FR-002**: El sistema DEBE soportar dos roles principales:
- `SUPERADMIN`: Acceso total al dashboard, registro de proyectos, gestión de datos
- `USER`: Acceso limitado (para fase 2)

**FR-003**: El sistema DEBE mostrar un portal público sin autenticación con datos transparentes (proyectos activos, métricas nacionales).

**FR-004**: El sistema DEBE redirigir a usuarios no autenticados que intenten acceder al dashboard a la página de login.

**FR-005**: El sistema DEBE mantener sesiones persistentes usando cookies seguras.

---

### 4.2 Dashboard Nacional de Carbono

**FR-006**: El dashboard DEBE mostrar 4 métricas principales en cards destacados:
- Total de hectáreas de bosque protegido (suma de proyectos activos)
- Total de toneladas de CO₂ capturadas/año (calculado)
- Ingresos potenciales en USD (rango min-max-promedio)
- Número de alertas de deforestación activas (últimas 48 horas)

**FR-007**: El dashboard DEBE incluir un mapa interactivo de Bolivia mostrando:
- Proyectos registrados como markers con colores por estado (Pendiente: amarillo, Aprobado: azul, Certificado: verde, Activo: verde oscuro)
- Alertas de deforestación como puntos rojos con intensidad por nivel de confianza
- Tooltips al hover mostrando información básica
- Zoom y pan fluidos

**FR-008**: El dashboard DEBE mostrar gráficos de tendencias:
- Deforestación mensual (últimos 12 meses) - gráfico de líneas
- Captura de CO₂ por departamento - gráfico de barras
- Distribución de proyectos por tipo - gráfico de dona
- Evolución de cobertura forestal - gráfico de área

**FR-009**: El dashboard DEBE permitir cambiar entre capas del mapa:
- Proyectos de carbono
- Alertas de deforestación
- Cobertura forestal (datos de GEE)
- Vista satelital vs topográfica

**FR-010**: El dashboard DEBE actualizar las métricas automáticamente al cambiar filtros (departamento, rango de fechas).

---

### 4.3 Registro y Gestión de Proyectos

**FR-011**: El sistema DEBE permitir registrar nuevos proyectos con los siguientes campos OBLIGATORIOS:
- Nombre del proyecto
- Tipo de proyecto (REDD+, Reforestación, Energías Renovables, Agricultura Regenerativa, Conservación Comunitaria)
- Descripción
- Ubicación geográfica (latitud/longitud o polígono dibujado en mapa)
- Área en hectáreas
- Departamento
- Municipio
- Organización responsable (selección o creación nueva)

**FR-012**: El sistema DEBE permitir campos OPCIONALES:
- Comunidades indígenas beneficiadas
- Co-beneficios (biodiversidad, empleos, restauración de suelos)
- Fecha de inicio del proyecto
- Duración estimada (años)

**FR-013**: El sistema DEBE permitir dibujar el área del proyecto directamente en el mapa usando herramientas de polígono.

**FR-014**: El sistema DEBE calcular automáticamente el área en hectáreas cuando se dibuja un polígono.

**FR-015**: El sistema DEBE validar que:
- El área sea > 0 hectáreas
- La ubicación esté dentro de Bolivia
- El nombre del proyecto sea único
- Todos los campos obligatorios estén completos

**FR-016**: El sistema DEBE permitir subir documentos adjuntos al proyecto:
- PDFs (informes, certificados)
- Imágenes (fotos del área, mapas)
- Límite: 10 archivos por proyecto, 5MB por archivo
- Almacenamiento en Supabase Storage

**FR-017**: El sistema DEBE asignar automáticamente el estado "Pendiente" a proyectos recién creados.

**FR-018**: El sistema DEBE permitir cambiar el estado del proyecto mediante dropdown:
- Pendiente → Aprobado → Certificado → Activo
- Solo SUPERADMIN puede cambiar estados
- Se registra fecha y usuario que cambió el estado

**FR-019**: El sistema DEBE mostrar una tabla de todos los proyectos con:
- Columnas: Nombre, Tipo, Departamento, Área (ha), CO₂/año, Estado, Fecha de creación
- Filtros por: Departamento, Tipo, Estado
- Búsqueda por nombre
- Ordenamiento por columnas
- Paginación (20 proyectos por página)

**FR-020**: El sistema DEBE permitir editar proyectos existentes.

**FR-021**: El sistema DEBE permitir eliminar proyectos (soft delete, marcar como inactivo).

**FR-022**: El sistema DEBE mostrar una vista detallada de cada proyecto con:
- Todos los campos del proyecto
- Mapa con la ubicación exacta
- Métricas calculadas (CO₂, ingresos)
- Documentos adjuntos descargables
- Historial de cambios de estado
- Análisis de cobertura forestal (datos de GEE)

---

### 4.4 Calculadora de Carbono con Google Earth Engine

**FR-023**: El sistema DEBE integrar Google Earth Engine para obtener datos reales de cobertura forestal.

**FR-024**: Cuando se registra un proyecto, el sistema DEBE:
1. Enviar las coordenadas del polígono a GEE
2. Consultar la cobertura forestal actual en esa área
3. Consultar datos históricos (últimos 5 años) para detectar cambios
4. Calcular la biomasa promedio según tipo de bosque detectado

**FR-025**: El sistema DEBE calcular toneladas de CO₂/año usando la siguiente fórmula:

```
Captura CO₂ = Área (ha) × Biomasa promedio (tCO₂/ha) × Factor de proyecto

Donde:
- Biomasa promedio viene de GEE basado en tipo de bosque detectado
- Factor de proyecto:
  * REDD+ (evitar deforestación): 0.9
  * Reforestación: 1.2
  * Conservación comunitaria: 1.0
  * Energías renovables: calculado por kWh evitado
  * Agricultura regenerativa: 0.7
```

**FR-026**: El sistema DEBE consultar factores de emisión del IPCC para tipos de bosque bolivianos:
- Amazonía: 150 tCO₂/ha/año
- Chiquitanía: 120 tCO₂/ha/año
- Yungas: 130 tCO₂/ha/año
- Altiplano: 40 tCO₂/ha/año

**FR-027**: Si GEE no puede determinar el tipo de bosque, el sistema DEBE usar factores por departamento:
- La Paz, Pando, Beni: Amazonía (150)
- Santa Cruz: Chiquitanía (120)
- Cochabamba, Tarija: Yungas (130)
- Potosí, Oruro: Altiplano (40)

**FR-028**: El sistema DEBE calcular ingresos potenciales usando rangos de precios de mercado:

```
Precios por tonelada CO₂ (USD):
- Conservador: $5
- Promedio: $15
- Optimista: $50

Ingresos anuales = CO₂/año × Precio
Ingresos proyectados (30 años) = Ingresos anuales × 30
```

**FR-029**: El sistema DEBE mostrar tres estimaciones de ingresos:
- Escenario conservador
- Escenario realista (por defecto)
- Escenario optimista

**FR-030**: El sistema DEBE actualizar los cálculos automáticamente cuando:
- Se modifica el área del proyecto
- Se cambia el tipo de proyecto
- Se actualiza la ubicación

**FR-031**: El sistema DEBE mostrar un badge de "Verificado con GEE" si los datos satelitales confirman cobertura forestal activa.

**FR-032**: El sistema DEBE generar alertas si GEE detecta pérdida de cobertura forestal en el área del proyecto:
- Alerta amarilla: pérdida 5-15% en el último año
- Alerta naranja: pérdida 15-30%
- Alerta roja: pérdida >30%

---

### 4.5 Monitoreo de Deforestación (NASA FIRMS + GEE)

**FR-033**: El sistema DEBE integrar NASA FIRMS API para detectar incendios forestales.

**FR-034**: El sistema DEBE consultar NASA FIRMS cada 3 horas para obtener alertas de las últimas 48 horas.

**FR-035**: El sistema DEBE almacenar alertas en la base de datos con:
- Latitud/longitud
- Fecha y hora de detección
- Nivel de confianza (0-100%)
- Brillo (indicador de intensidad)
- Departamento (calculado por geocodificación inversa)
- Severidad (baja/media/alta) calculada por:
  * Alta: confianza >80% y brillo >330K
  * Media: confianza 60-80% o brillo 310-330K
  * Baja: confianza <60%

**FR-036**: El sistema DEBE mostrar una tabla de alertas con:
- Columnas: Ubicación, Fecha, Departamento, Severidad, Estado
- Filtros por: Departamento, Severidad, Estado (Nueva/Investigando/Resuelta)
- Ordenamiento por fecha (más recientes primero)
- Paginación

**FR-037**: El sistema DEBE permitir cambiar el estado de alertas:
- Nueva → Investigando → Resuelta
- Campo de notas para comentarios

**FR-038**: El sistema DEBE mostrar alertas en el mapa del dashboard con:
- Puntos rojos para alertas de alta severidad
- Puntos naranjas para media severidad
- Puntos amarillos para baja severidad
- Tooltip mostrando detalles al hover

**FR-039**: El sistema DEBE detectar si una alerta está cerca de un proyecto registrado (radio de 5km):
- Marcar la alerta como "Cerca de proyecto: [nombre]"
- Notificación destacada en el dashboard
- Enviar email automático al SUPERADMIN (opcional para MVP)

**FR-040**: El sistema DEBE mostrar un counter en el dashboard: "X alertas activas en las últimas 48h".

**FR-041**: El sistema DEBE usar Google Earth Engine para complementar alertas de NASA con:
- Análisis de cambio de cobertura forestal en la zona afectada
- Estimación de hectáreas perdidas
- Comparación con imágenes satelitales de 30 días antes

---

### 4.6 Portal Público de Transparencia

**FR-042**: El sistema DEBE tener una landing page pública accesible sin login mostrando:
- Hero section con métricas nacionales agregadas
- Mapa interactivo público con proyectos activos
- Lista de proyectos destacados (certificados)
- Ranking de departamentos por hectáreas protegidas
- Call-to-action para inversores internacionales

**FR-043**: El mapa público DEBE mostrar:
- Solo proyectos con estado "Certificado" o "Activo"
- Información básica en tooltips (nombre, tipo, tCO₂/año)
- NO mostrar datos sensibles (documentos, organizaciones específicas)

**FR-044**: El portal público DEBE mostrar métricas nacionales en tiempo real:
- Total de hectáreas protegidas
- Total de toneladas de CO₂ capturadas
- Número de proyectos certificados
- Número de comunidades beneficiadas
- Ingresos generados (si hay ventas confirmadas)

**FR-045**: El portal público DEBE tener una sección "¿Cómo funciona?" explicando:
- Qué son los créditos de carbono
- Por qué Bolivia es clave
- Proceso de certificación
- Cómo invertir/participar

**FR-046**: El portal público DEBE tener un formulario de contacto para:
- Inversores internacionales interesados
- Organizaciones que quieren registrar proyectos
- Prensa y medios

---

### 4.7 Gestión de Organizaciones

**FR-047**: El sistema DEBE permitir registrar organizaciones/comunidades responsables de proyectos con:
- Nombre de la organización
- Tipo (Comunidad Indígena, ONG, Gobierno Local, Empresa Privada)
- Email de contacto
- Teléfono de contacto
- Dirección

**FR-048**: El sistema DEBE mostrar una lista de organizaciones registradas.

**FR-049**: Al crear un proyecto, el sistema DEBE permitir:
- Seleccionar una organización existente
- Crear una nueva organización inline

**FR-050**: El sistema DEBE mostrar en la vista de organización:
- Lista de proyectos asociados
- Métricas agregadas (total de hectáreas, total de CO₂)

---

### 4.8 Reportes Automáticos

**FR-051**: El sistema DEBE generar reportes automáticos en PDF con:
- Logo del gobierno de Bolivia
- Fecha de generación
- Métricas del período seleccionado
- Gráficos y visualizaciones
- Tabla de proyectos

**FR-052**: El sistema DEBE permitir generar reportes de:
- **Reporte Nacional**: Todas las métricas del país, todos los proyectos
- **Reporte por Departamento**: Filtrado por departamento específico
- **Reporte por Proyecto**: Detalle completo de un proyecto individual
- **Reporte Mensual**: Actividad del mes (nuevos proyectos, alertas, cambios)

**FR-053**: El sistema DEBE permitir exportar datos a Excel (.xlsx) con:
- Hoja 1: Lista de proyectos con todas las columnas
- Hoja 2: Lista de alertas
- Hoja 3: Métricas agregadas por departamento

**FR-054**: Los reportes PDF DEBN incluir:
- Portada con título y período
- Resumen ejecutivo (1 página)
- Métricas clave con iconos
- Mapa estático de Bolivia con proyectos
- Gráficos de tendencias
- Tabla detallada de proyectos
- Pie de página con disclaimer: "Generado automáticamente por CARBONO Platform"

**FR-055**: El sistema DEBE permitir programar reportes automáticos mensuales (opcional para MVP, mencionar en roadmap).

**FR-056**: El sistema DEBE mantener un historial de reportes generados con:
- Fecha de generación
- Tipo de reporte
- Usuario que lo generó
- Link de descarga (almacenado en Supabase Storage)

---

### 4.9 Búsqueda y Filtros

**FR-057**: El sistema DEBE tener una barra de búsqueda global que permita buscar:
- Proyectos por nombre
- Organizaciones por nombre
- Ubicaciones (departamento, municipio)

**FR-058**: El sistema DEBE permitir filtros combinados:
- Departamento + Tipo de proyecto + Estado
- Rango de fechas (desde - hasta)
- Rango de área (min - max hectáreas)
- Rango de captura de CO₂

**FR-059**: Los filtros DEBEN actualizar la tabla y el mapa en tiempo real.

**FR-060**: El sistema DEBE mantener los filtros activos al navegar entre páginas.

---

### 4.10 Notificaciones y Alertas

**FR-061**: El sistema DEBE mostrar un badge de notificaciones en el header con contador.

**FR-062**: El sistema DEBE generar notificaciones para:
- Nueva alerta de deforestación de alta severidad
- Proyecto que pasó a estado "Certificado"
- Alerta de deforestación cerca de proyecto registrado
- Pérdida de cobertura forestal detectada en proyecto activo (vía GEE)

**FR-063**: Las notificaciones DEBEN ser visibles en un dropdown del header.

**FR-064**: El sistema DEBE marcar notificaciones como leídas al hacer clic.

**FR-065**: El sistema DEBE mantener historial de notificaciones (últimos 30 días).

---

### 4.11 Base de Datos y Persistencia

**FR-066**: El sistema DEBE usar Supabase PostgreSQL como base de datos principal.

**FR-067**: El sistema DEBE implementar las siguientes tablas (ver schema detallado en sección técnica):
- `profiles` (usuarios)
- `organizations` (comunidades/ONGs)
- `projects` (proyectos de carbono)
- `carbon_credits` (créditos generados)
- `deforestation_alerts` (alertas de NASA FIRMS)
- `notifications` (notificaciones del sistema)
- `reports` (historial de reportes generados)
- `project_documents` (archivos adjuntos)

**FR-068**: El sistema DEBE usar Supabase Storage para almacenar:
- Documentos de proyectos (bucket: `project-documents`)
- Reportes generados (bucket: `reports`)
- Avatares de usuarios (bucket: `avatars`, ya existe)

**FR-069**: El sistema DEBE implementar Row Level Security (RLS) en Supabase:
- SUPERADMIN: acceso total
- USER: solo lectura (para fase 2)
- Público: solo proyectos certificados

---

### 4.12 Performance y Caché

**FR-070**: El sistema DEBE cachear datos de NASA FIRMS por 3 horas para evitar requests excesivos.

**FR-071**: El sistema DEBE cachear consultas a Google Earth Engine por 24 horas para datos históricos.

**FR-072**: El dashboard DEBE cargar en menos de 2 segundos en conexiones de 10Mbps.

**FR-073**: El mapa DEBE renderizar 500+ markers sin lag (usar clustering si necesario).

---

## 5. Non-Goals (Out of Scope para MVP)

**NG-001**: Sistema de pagos integrado (Stripe, PayPal) - Fase 2

**NG-002**: Tokenización de créditos en blockchain - Fase 2

**NG-003**: App móvil nativa para iOS/Android - Fase 3

**NG-004**: Sistema de MRV (Monitoring, Reporting, Verification) completamente automatizado - Fase 2

**NG-005**: Integración con exchanges de créditos de carbono (VCS Registry, Gold Standard) - Fase 2

**NG-006**: Sistema de subastas de créditos - Fase 2

**NG-007**: Roles granulares por departamento/región - Fase 2

**NG-008**: Análisis de IA predictivo de deforestación - Fase 3

**NG-009**: App para guardabosques con modo offline - Fase 3

**NG-010**: Integración con drones para validación en campo - Fase 3

**NG-011**: Marketplace completo con carrito de compras - Fase 2

**NG-012**: Sistema de notificaciones push móviles - Fase 3

**NG-013**: Soporte multi-idioma (Inglés, Quechua, Aymara) - Fase 2

**NG-014**: API pública para terceros - Fase 2

**NG-015**: Certificación automática sin intervención humana - Fase 3

---

## 6. Design Considerations

### 6.1 Diseño Visual

**DC-001**: La interfaz DEBE seguir los colores de la marca "CARBONO":
- Verde Bosque: `#2D5016` (primario, header, botones principales)
- Verde Claro: `#7FB069` (datos positivos, badges de éxito)
- Amarillo Alerta: `#FBB13C` (alertas medias, warnings)
- Rojo Crítico: `#D72638` (alertas altas, errores)
- Azul Institucional: `#1E3A5F` (links, elementos secundarios)
- Blanco/Gris: `#F5F5F5` / `#333333` (fondos, texto)

**DC-002**: El dashboard DEBE tener un diseño "command center":
- Sidebar con navegación principal (Dashboard, Proyectos, Alertas, Organizaciones, Reportes)
- Header con notificaciones, perfil de usuario, y logo
- Área principal con métricas destacadas arriba, mapa central, gráficos abajo

**DC-003**: Las cards de métricas DEBEN mostrar:
- Icono grande relacionado (árbol, dinero, alerta)
- Número grande y legible (48px)
- Label descriptivo
- Indicador de tendencia (arriba/abajo con porcentaje)

**DC-004**: El mapa DEBE ocupar al menos 60% del viewport inicial del dashboard.

**DC-005**: Los gráficos DEBEN usar la librería Recharts con animaciones suaves.

**DC-006**: La tipografía DEBE ser:
- Headings: Inter Bold
- Body: Inter Regular
- Monospace (números): JetBrains Mono

### 6.2 UX y Flujos

**DC-007**: El flujo de registro de proyecto DEBE ser:
1. Click en "Nuevo Proyecto"
2. Modal/página con formulario en pasos:
   - Paso 1: Información básica (nombre, tipo, descripción)
   - Paso 2: Ubicación (dibujar en mapa o ingresar coordenadas)
   - Paso 3: Organización responsable
   - Paso 4: Documentos (opcional)
   - Paso 5: Revisión y confirmación
3. Mostrar preview de cálculos de CO₂ e ingresos
4. Botón "Registrar Proyecto"
5. Mensaje de éxito con link a vista del proyecto

**DC-008**: La tabla de proyectos DEBE tener acciones rápidas:
- Ícono de ojo: Ver detalles
- Ícono de lápiz: Editar
- Ícono de gráfico: Ver análisis de GEE
- Menú de tres puntos: Cambiar estado, Eliminar, Descargar reporte

**DC-009**: Los tooltips del mapa DEBEN aparecer al hover y mostrar:
- Título del proyecto / alerta
- 2-3 datos clave
- Link "Ver más"

**DC-010**: Los formularios DEBEN tener validación en tiempo real con mensajes de error claros.

### 6.3 Responsive Design

**DC-011**: El sistema DEBE ser completamente responsive:
- Desktop: >1280px (vista completa)
- Tablet: 768-1279px (sidebar colapsable)
- Mobile: <768px (menú hamburguesa, tablas con scroll horizontal)

**DC-012**: El mapa DEBE ser usable en móviles con controles táctiles optimizados.

### 6.4 Componentes de UI (shadcn/ui)

**DC-013**: El sistema DEBE usar componentes de shadcn/ui ya instalados:
- Button, Input, Select, Textarea
- Dialog, AlertDialog, Popover
- Table, Tabs, Accordion
- Avatar, Badge, Progress
- Toast para notificaciones temporales
- Command (Cmd+K) para búsqueda rápida

---

## 7. Technical Considerations

### 7.1 Stack Tecnológico

**TC-001**: Frontend:
- Next.js 15 con App Router
- React 19
- TypeScript 5.7
- Tailwind CSS + shadcn/ui
- Framer Motion (animaciones)

**TC-002**: Backend/Database:
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Prisma ORM

**TC-003**: Integraciones Externas:
- **Google Earth Engine** (análisis satelital, cobertura forestal)
- **NASA FIRMS API** (detección de incendios)
- **Global Forest Watch API** (datos de deforestación)
- **Leaflet + React-Leaflet** (mapas interactivos)
- **OpenStreetMap** (tiles de mapas, gratis)
- **Recharts** (gráficos)

**TC-004**: Hosting y Deploy:
- Vercel (frontend + serverless functions)
- Supabase Cloud (database + storage)

**TC-005**: Librerías Adicionales:
- `axios` (HTTP client)
- `date-fns` (manejo de fechas)
- `zod` (validación de schemas)
- `jsPDF` (generación de PDFs)
- `xlsx` (exportación a Excel)
- `@tanstack/react-query` (data fetching y caché)
- `@turf/turf` (cálculos geoespaciales)

### 7.2 Arquitectura de Datos

**TC-006**: Schema de Base de Datos (Prisma):

```prisma
enum UserRole {
  USER
  SUPERADMIN
}

enum ProjectType {
  REDD_PLUS
  REFORESTATION
  RENEWABLE_ENERGY
  REGENERATIVE_AGRICULTURE
  COMMUNITY_CONSERVATION
}

enum ProjectStatus {
  PENDING
  APPROVED
  CERTIFIED
  ACTIVE
}

enum AlertSeverity {
  LOW
  MEDIUM
  HIGH
}

enum AlertStatus {
  NEW
  INVESTIGATING
  RESOLVED
}

model Profile {
  id            String     @id @default(cuid())
  userId        String     @unique
  avatarUrl     String?
  firstName     String?
  lastName      String?
  role          UserRole   @default(USER)
  active        Boolean    @default(true)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@map("profiles")
}

model Organization {
  id              String      @id @default(cuid())
  name            String
  type            String      // Community, NGO, Government, Private
  contactEmail    String?
  contactPhone    String?
  address         String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  projects        Project[]

  @@map("organizations")
}

model Project {
  id                    String         @id @default(cuid())
  name                  String         @unique
  type                  ProjectType
  description           String?
  geometry              Json           // GeoJSON polygon
  areaHectares          Decimal
  estimatedCo2TonsYear  Decimal?       // Calculado con GEE
  department            String
  municipality          String?
  status                ProjectStatus  @default(PENDING)
  organizationId        String
  organization          Organization   @relation(fields: [organizationId], references: [id])

  // Campos adicionales
  communities           String?        // Comunidades beneficiadas
  coBenefits            String?        // JSON array
  startDate             DateTime?
  durationYears         Int?

  // Metadatos de verificación
  geeVerified           Boolean        @default(false)
  geeLastCheck          DateTime?
  forestCoveragePercent Decimal?       // % de cobertura forestal actual

  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
  createdBy             String?

  documents             ProjectDocument[]
  carbonCredits         CarbonCredit[]
  statusHistory         ProjectStatusHistory[]

  @@index([department])
  @@index([status])
  @@index([organizationId])
  @@map("projects")
}

model ProjectDocument {
  id          String    @id @default(cuid())
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  fileName    String
  fileUrl     String    // Supabase Storage URL
  fileType    String    // PDF, JPG, PNG
  fileSize    Int       // bytes
  uploadedBy  String?
  createdAt   DateTime  @default(now())

  @@index([projectId])
  @@map("project_documents")
}

model ProjectStatusHistory {
  id          String        @id @default(cuid())
  projectId   String
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  fromStatus  ProjectStatus?
  toStatus    ProjectStatus
  changedBy   String?
  notes       String?
  createdAt   DateTime      @default(now())

  @@index([projectId])
  @@map("project_status_history")
}

model CarbonCredit {
  id                  String    @id @default(cuid())
  projectId           String
  project             Project   @relation(fields: [projectId], references: [id])
  tonsCo2             Decimal
  verificationDate    DateTime?
  certificationBody   String?   // Verra, Gold Standard, etc.
  status              String    @default("pending") // pending, verified, sold
  pricePerTon         Decimal?
  createdAt           DateTime  @default(now())

  @@index([projectId])
  @@map("carbon_credits")
}

model DeforestationAlert {
  id            String        @id @default(cuid())
  latitude      Decimal
  longitude     Decimal
  confidence    Int           // 0-100
  brightness    Decimal?      // Kelvin
  detectedAt    DateTime
  department    String?
  severity      AlertSeverity
  status        AlertStatus   @default(NEW)
  notes         String?

  // Relación con proyectos cercanos
  nearProjectId String?
  nearProjectDistance Decimal?  // km

  // Análisis de GEE
  estimatedHectaresLost Decimal?

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([detectedAt])
  @@index([status])
  @@index([department])
  @@map("deforestation_alerts")
}

model Notification {
  id          String    @id @default(cuid())
  userId      String
  type        String    // deforestation_alert, project_certified, etc.
  title       String
  message     String
  link        String?   // Link a la alerta/proyecto
  read        Boolean   @default(false)
  createdAt   DateTime  @default(now())

  @@index([userId, read])
  @@index([createdAt])
  @@map("notifications")
}

model Report {
  id          String    @id @default(cuid())
  type        String    // national, department, project, monthly
  title       String
  fileUrl     String    // Supabase Storage
  generatedBy String?
  parameters  Json?     // Filtros usados
  createdAt   DateTime  @default(now())

  @@index([type])
  @@map("reports")
}

model ApiCache {
  id          String    @id @default(cuid())
  cacheKey    String    @unique
  data        Json
  expiresAt   DateTime
  createdAt   DateTime  @default(now())

  @@index([expiresAt])
  @@map("api_cache")
}
```

### 7.3 Integración con Google Earth Engine

**TC-007**: El sistema DEBE usar Google Earth Engine Python API desde Next.js API Routes.

**TC-008**: Crear API route `/api/gee/analyze-area` que:
- Recibe GeoJSON del polígono del proyecto
- Inicializa cliente de GEE con service account
- Consulta dataset `UMD/hansen/global_forest_change_2023_v1_11` para cobertura forestal
- Consulta dataset `COPERNICUS/S2_SR` (Sentinel-2) para imágenes recientes
- Calcula biomasa usando algoritmos de GEE
- Retorna:
  ```json
  {
    "forestCoveragePercent": 87.5,
    "biomassPerHectare": 145.3,
    "forestType": "amazon",
    "lastChangeDetected": "2024-03-15",
    "changePercent": -2.1,
    "verified": true
  }
  ```

**TC-009**: Crear API route `/api/gee/historical-trends` que:
- Recibe coordenadas y rango de fechas
- Retorna serie temporal de NDVI (índice de vegetación)
- Detecta eventos de deforestación

**TC-010**: Usar variables de entorno para credenciales de GEE:
```
GEE_SERVICE_ACCOUNT_EMAIL=
GEE_PRIVATE_KEY=
```

**TC-011**: Implementar rate limiting: máximo 100 requests a GEE por día para MVP.

### 7.4 Integración con NASA FIRMS

**TC-012**: Crear cron job (Vercel Cron) que ejecute cada 3 horas:
- Endpoint: `/api/cron/fetch-nasa-firms`
- Consulta NASA FIRMS para Bolivia (bbox: -69.6,10,-57.5,-23)
- Parsea CSV response
- Inserta nuevas alertas en DB (deduplicación por lat/lng/fecha)
- Geocodifica departamento usando API de Bolivia o lookup table
- Detecta proyectos cercanos (query PostGIS o cálculo manual)

**TC-013**: Variables de entorno:
```
NASA_FIRMS_API_KEY=tu_key_gratuita
```

**TC-014**: Endpoint público `/api/alerts/latest` para obtener alertas recientes.

### 7.5 Cálculos Geoespaciales

**TC-015**: Usar librería `@turf/turf` para:
- Calcular área de polígonos (hectáreas)
- Calcular distancia entre puntos (alertas vs proyectos)
- Validar que polígonos estén dentro de Bolivia
- Simplificar polígonos complejos

**TC-016**: Función helper `calculateCarbonCapture()`:
```typescript
interface CarbonCalculationInput {
  areaHectares: number;
  projectType: ProjectType;
  forestType?: 'amazon' | 'chiquitania' | 'yungas' | 'altiplano';
  department?: string;
  geeBiomass?: number; // Opcional, de GEE
}

interface CarbonCalculationOutput {
  co2TonsPerYear: number;
  revenue: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
  projected30Years: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
}

function calculateCarbonCapture(input: CarbonCalculationInput): CarbonCalculationOutput
```

### 7.6 Generación de Reportes

**TC-017**: Usar `jsPDF` para generar PDFs:
- Template con header/footer
- Insertar logo del gobierno
- Generar gráficos como imágenes (canvas → base64)
- Tablas formateadas

**TC-018**: Usar `xlsx` para exportar a Excel:
- Múltiples hojas
- Formato de celdas (moneda, números)
- Totales y subtotales

**TC-019**: API route `/api/reports/generate`:
```typescript
POST /api/reports/generate
Body: {
  type: 'national' | 'department' | 'project' | 'monthly',
  format: 'pdf' | 'excel',
  filters?: {
    department?: string,
    dateFrom?: string,
    dateTo?: string,
    projectId?: string
  }
}

Response: {
  reportId: string,
  downloadUrl: string
}
```

### 7.7 Performance

**TC-020**: Implementar caché con `@tanstack/react-query`:
- Dashboard metrics: stale time 5 minutos
- Lista de proyectos: stale time 2 minutos
- Datos de GEE: stale time 24 horas
- Alertas NASA: stale time 3 horas

**TC-021**: Usar React Server Components para:
- Landing page pública (SSG o ISR cada 1 hora)
- Dashboard inicial (SSR con datos frescos)

**TC-022**: Implementar lazy loading para:
- Mapa (load on viewport)
- Gráficos (load on scroll)
- Tablas paginadas

**TC-023**: Optimizar imágenes con Next.js Image component.

### 7.8 Seguridad

**TC-024**: Implementar Row Level Security en Supabase:
```sql
-- Solo SUPERADMIN puede insertar/actualizar proyectos
CREATE POLICY "superadmin_full_access" ON projects
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'SUPERADMIN'
    )
  );

-- Público puede leer solo proyectos certificados
CREATE POLICY "public_read_certified" ON projects
  FOR SELECT USING (status IN ('CERTIFIED', 'ACTIVE'));
```

**TC-025**: Validar todas las inputs con Zod schemas.

**TC-026**: Sanitizar datos antes de insertar en DB (prevenir SQL injection).

**TC-027**: Rate limiting en API routes críticas (NASA, GEE).

**TC-028**: Variables de entorno sensibles solo en servidor (no exponer en cliente).

### 7.9 APIs que Necesitas Conseguir HOY

#### ✅ APIs Gratuitas (Registrarse YA)

1. **NASA FIRMS** (CRÍTICO - Primera Prioridad)
   - URL: https://firms.modaps.eosdis.nasa.gov/api/area/
   - Tiempo de registro: 2 minutos
   - Key llega por email instantáneo
   - Uso: Alertas de incendios

2. **Google Earth Engine** (YA TIENES ACCESO - Configurar credenciales)
   - URL: https://earthengine.google.com/
   - Necesitas crear Service Account:
     1. Ve a Google Cloud Console
     2. Crea proyecto nuevo
     3. Habilita Earth Engine API
     4. Crea Service Account
     5. Descarga JSON con credenciales
   - Uso: Análisis de cobertura forestal, biomasa

3. **Global Forest Watch API** (Opcional, tiene límite de 1000 req/día)
   - URL: https://www.globalforestwatch.org/
   - Registro gratuito
   - Uso: Datos históricos de deforestación (complemento)

4. **OpenWeatherMap** (Opcional para MVP, útil para contexto)
   - URL: https://openweathermap.org/api
   - Free tier: 1000 calls/día
   - Uso: Condiciones climáticas en zonas de alerta

#### 🔧 Servicios a Configurar

5. **Mapbox** (Opcional - Alternativa: usar Leaflet + OSM gratis)
   - URL: https://account.mapbox.com/
   - Free tier: 50k cargas/mes
   - Recomendación: Usa **Leaflet con OpenStreetMap** (100% gratis, ilimitado)

6. **Supabase** (YA CONFIGURADO según tu README)
   - Verificar que tienes storage buckets:
     - `avatars` (existe)
     - `project-documents` (crear)
     - `reports` (crear)

#### 📋 Checklist de Configuración para HOY

```bash
# 1. Obtener NASA FIRMS API Key
# Ve a: https://firms.modaps.eosdis.nasa.gov/api/area/
# Formulario: Nombre, Email, Uso: "Carbon monitoring platform for Bolivia Government"
# Guarda el MAP_KEY que te envían

# 2. Configurar Google Earth Engine Service Account
# - Ir a: https://console.cloud.google.com/
# - Crear proyecto: "carbono-bolivia"
# - APIs & Services > Enable APIs > Earth Engine API
# - IAM & Admin > Service Accounts > Create Service Account
# - Nombre: "carbono-gee-service"
# - Create and continue
# - Grant role: "Earth Engine Resource Admin"
# - Create key > JSON > Descargar
# - Guardar en archivo seguro (NO commitear a Git)

# 3. Actualizar .env.local
NASA_FIRMS_KEY=tu_key_de_nasa
GEE_SERVICE_ACCOUNT_EMAIL=carbono-gee-service@carbono-bolivia.iam.gserviceaccount.com
GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Ya tienes configurado:
NEXT_PUBLIC_SUPABASE_URL=https://swfgvfhpmicwptupjyko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

---

## 8. Success Metrics

### 8.1 Métricas Técnicas (MVP Launch)
- **Performance**: Dashboard carga en <2s (90th percentile)
- **Uptime**: 99.5% en primeros 30 días
- **Bugs críticos**: 0 en producción
- **Test coverage**: >70% en funciones críticas (calculadora, GEE integration)

### 8.2 Métricas de Adopción (Post-Demo)
- **Proyectos registrados**: Meta de 20 proyectos en primer mes post-lanzamiento
- **Usuarios activos**: Al menos 5 usuarios SUPERADMIN usando semanalmente
- **Portal público**: 500+ visitantes únicos en primer mes
- **Reportes generados**: 10+ reportes descargados en primer mes

### 8.3 Métricas de Impacto (6 meses)
- **Hectáreas monitoreadas**: 1M+ hectáreas en proyectos registrados
- **Alertas procesadas**: 100% de alertas de alta severidad revisadas en <48h
- **Certificaciones**: Al menos 3 proyectos alcanzando estado "Certificado"
- **Visibilidad internacional**: 2+ menciones en prensa internacional o conferencias de cambio climático

### 8.4 Métricas de Negocio
- **ROI**: Demostrar potencial de generar 200x el costo de desarrollo en ingresos de créditos
- **Lead generation**: 5+ contactos de inversionistas internacionales vía portal público
- **Expansión**: Interés de al menos 1 país vecino en licenciar la plataforma

---

## 9. Open Questions

### Preguntas para Resolver Durante Desarrollo

**OQ-001**: ¿El gobierno tiene un logo oficial que debemos usar en reportes y landing page?
- **Acción**: Solicitar assets gráficos oficiales

**OQ-002**: ¿Hay proyectos de carbono ya existentes en Bolivia que podamos usar como datos reales de demostración?
- **Acción**: Investigar proyectos de REDD+ en Madidi, TIPNIS, Isiboro Sécure

**OQ-003**: ¿Necesitamos soporte multi-idioma desde el MVP (Español/Inglés)?
- **Decisión tentativa**: Solo español para MVP, inglés en Fase 2
- **Confirmar con cliente**

**OQ-004**: ¿Qué nivel de acceso tenemos a Google Earth Engine? ¿Hay límites de requests?
- **Acción**: Verificar cuota de GEE del service account
- **Backup**: Implementar caché agresivo

**OQ-005**: ¿El gobierno tiene un servidor propio donde eventualmente quieran self-hostear, o está bien Vercel + Supabase Cloud?
- **Decisión tentativa**: Cloud para MVP, migración opcional en Fase 2
- **Confirmar soberanía de datos**

**OQ-006**: ¿Necesitamos integración con sistemas gubernamentales existentes (SIRBA, SERNAP, etc.)?
- **Decisión**: Fuera de scope para MVP, mencionar en roadmap

**OQ-007**: ¿Cuál es el proceso oficial de certificación de proyectos en Bolivia?
- **Acción**: Investigar normativa boliviana (Ley 300, Autoridad Plurinacional de la Madre Tierra)
- **Ajustar flujo de estados si necesario**

**OQ-008**: ¿Hay restricciones de seguridad para almacenar datos en servicios cloud extranjeros?
- **Acción**: Consultar marco legal
- **Backup**: Plan de migración a infraestructura nacional

**OQ-009**: ¿Qué formato prefieren para los reportes PDF? ¿Hay templates existentes?
- **Acción**: Solicitar ejemplos de reportes oficiales del gobierno
- **Backup**: Crear template profesional genérico

**OQ-010**: ¿Cuántos usuarios SUPERADMIN necesitamos soportar concurrentemente?
- **Estimación**: 5-10 usuarios para MVP
- **Confirmar para dimensionar recursos**

---

## 10. Roadmap y Fases

### Fase 1: MVP (Hoy - 1 mes)
**Objetivo**: Demo funcional para venderle al gobierno

**Semana 1: Fundaciones**
- [ ] Setup completo del proyecto (Next.js + Supabase + Prisma)
- [ ] Schema de base de datos completo
- [ ] Componentes de UI base (layout, sidebar, header)
- [ ] Sistema de autenticación funcional
- [ ] Integración NASA FIRMS básica
- [ ] Integración Google Earth Engine básica

**Semana 2: Features Core**
- [ ] Dashboard con métricas principales
- [ ] Mapa interactivo con Leaflet
- [ ] Registro de proyectos (formulario completo)
- [ ] Calculadora de carbono con GEE
- [ ] Tabla de proyectos con filtros
- [ ] Sistema de alertas de deforestación

**Semana 3: Features Avanzadas**
- [ ] Portal público de transparencia
- [ ] Gestión de organizaciones
- [ ] Subida de documentos a proyectos
- [ ] Vista detallada de proyectos
- [ ] Gráficos de tendencias (Recharts)
- [ ] Sistema de notificaciones

**Semana 4: Polish y Reportes**
- [ ] Generación de reportes PDF/Excel
- [ ] Optimización de performance
- [ ] Testing completo (E2E con Playwright)
- [ ] Seed data con proyectos realistas
- [ ] Responsive design completo
- [ ] Documentación para handoff

**Semana 5: Demo y Ajustes**
- [ ] Preparación de pitch deck
- [ ] Video demo (3-5 minutos)
- [ ] Deploy a producción (Vercel)
- [ ] Ajustes basados en feedback interno
- [ ] Presentación al gobierno

### Fase 2: Producción (Meses 2-3)
- [ ] Sistema de roles granulares (por departamento)
- [ ] Marketplace básico de créditos
- [ ] API pública para terceros
- [ ] Integración con registros internacionales (Verra)
- [ ] Sistema de MRV automatizado
- [ ] Multi-idioma (EN/ES)
- [ ] Notificaciones por email
- [ ] Dashboard de analytics avanzado

### Fase 3: Escala (Meses 4-6)
- [ ] Tokenización blockchain de créditos
- [ ] App móvil (React Native)
- [ ] Sistema de subastas
- [ ] IA predictiva para deforestación
- [ ] Integración con drones
- [ ] Expansión a países vecinos (Perú, Ecuador)

---

## 11. Dependencies y Risks

### Dependencies
**DEP-001**: Acceso a Google Earth Engine aprobado y funcional
- **Mitigation**: Confirmar acceso hoy, tener backup con Global Forest Watch

**DEP-002**: NASA FIRMS API key obtenida
- **Mitigation**: Registro inmediato (2 minutos), sin aprobación requerida

**DEP-003**: Datos de proyectos reales bolivianos para seed data
- **Mitigation**: Usar proyectos simulados realistas si no conseguimos datos reales

**DEP-004**: Servidor Supabase estable y con espacio suficiente
- **Mitigation**: Free tier suficiente para MVP, upgrade a Pro si necesario ($25/mes)

### Risks

**RISK-001**: Cuota de Google Earth Engine insuficiente
- **Probabilidad**: Media
- **Impacto**: Alto
- **Mitigation**: Implementar caché agresivo (24h), mostrar disclaimer de "última actualización"

**RISK-002**: Performance del mapa con 500+ markers
- **Probabilidad**: Media
- **Impacto**: Medio
- **Mitigation**: Implementar clustering de markers, lazy loading

**RISK-003**: Gobierno no tiene datos de proyectos existentes
- **Probabilidad**: Alta
- **Impacto**: Bajo
- **Mitigation**: Crear seed data realista basado en investigación pública

**RISK-004**: Cambios en requisitos durante desarrollo
- **Probabilidad**: Alta
- **Impacto**: Medio
- **Mitigation**: Arquitectura modular, comunicación constante

**RISK-005**: Latencia alta en consultas a GEE desde Bolivia
- **Probabilidad**: Media
- **Impacto**: Medio
- **Mitigation**: Caché, procesamiento asíncrono con loading states

**RISK-006**: Problemas de geocodificación para alertas (departamento/municipio)
- **Probabilidad**: Media
- **Impacto**: Bajo
- **Mitigation**: Lookup table manual con coordenadas de departamentos bolivianos

---

## 12. Acceptance Criteria (MVP Launch)

### General
- [ ] **AC-001**: La aplicación carga sin errores en Chrome, Firefox, Safari (últimas versiones)
- [ ] **AC-002**: La aplicación es responsive en desktop (1920px), tablet (768px), mobile (375px)
- [ ] **AC-003**: No hay console errors en producción
- [ ] **AC-004**: Todas las variables de entorno sensibles están configuradas correctamente
- [ ] **AC-005**: El proyecto tiene README actualizado con instrucciones de setup

### Dashboard
- [ ] **AC-006**: El dashboard muestra 4 métricas principales con datos reales
- [ ] **AC-007**: El mapa carga y muestra al menos 10 proyectos de ejemplo
- [ ] **AC-008**: El mapa muestra alertas de NASA FIRMS de las últimas 48 horas
- [ ] **AC-009**: Los gráficos se renderizan correctamente con animaciones
- [ ] **AC-010**: Los filtros actualizan el mapa y las métricas en <1 segundo

### Proyectos
- [ ] **AC-011**: Se puede registrar un nuevo proyecto con todos los campos obligatorios
- [ ] **AC-012**: Se puede dibujar un polígono en el mapa y el área se calcula automáticamente
- [ ] **AC-013**: La calculadora de carbono retorna valores razonables (rango esperado)
- [ ] **AC-014**: Se pueden subir documentos PDF/JPG (hasta 5MB) y se almacenan en Supabase
- [ ] **AC-015**: Se puede cambiar el estado de un proyecto y se registra en historial
- [ ] **AC-016**: La tabla de proyectos soporta filtros, búsqueda y ordenamiento
- [ ] **AC-017**: La vista detallada de proyecto muestra todos los datos + mapa + documentos

### Alertas
- [ ] **AC-018**: Las alertas de NASA FIRMS se importan automáticamente cada 3 horas (cron job)
- [ ] **AC-019**: Las alertas se clasifican correctamente por severidad (baja/media/alta)
- [ ] **AC-020**: Se detectan proyectos cercanos (radio 5km) a alertas
- [ ] **AC-021**: Se puede cambiar el estado de alertas (Nueva → Investigando → Resuelta)

### Portal Público
- [ ] **AC-022**: La landing page es accesible sin login
- [ ] **AC-023**: El mapa público muestra solo proyectos certificados/activos
- [ ] **AC-024**: Las métricas nacionales son precisas (suma de proyectos certificados)
- [ ] **AC-025**: El formulario de contacto funciona y envía emails (o guarda en DB)

### Reportes
- [ ] **AC-026**: Se puede generar reporte nacional en PDF con datos correctos
- [ ] **AC-027**: Se puede generar reporte por departamento filtrado
- [ ] **AC-028**: Se puede exportar lista de proyectos a Excel (.xlsx)
- [ ] **AC-029**: Los reportes se almacenan en Supabase Storage y son descargables

### Google Earth Engine
- [ ] **AC-030**: El análisis de GEE retorna datos de cobertura forestal para proyectos
- [ ] **AC-031**: El sistema cachea resultados de GEE por 24 horas
- [ ] **AC-032**: Si GEE falla, se muestra mensaje de error amigable (no crashea)
- [ ] **AC-033**: Se muestra badge "Verificado con GEE" cuando corresponde

### Performance
- [ ] **AC-034**: Dashboard carga en <3 segundos (3G throttling)
- [ ] **AC-035**: El mapa renderiza 100+ markers sin lag
- [ ] **AC-036**: Las imágenes están optimizadas (Next.js Image)
- [ ] **AC-037**: No hay memory leaks en sesiones largas (>30 min)

### Seguridad
- [ ] **AC-038**: Solo usuarios SUPERADMIN pueden registrar/editar proyectos
- [ ] **AC-039**: Las API keys no están expuestas en el código cliente
- [ ] **AC-040**: Row Level Security está configurado en Supabase
- [ ] **AC-041**: Todos los inputs están validados con Zod

### Demo
- [ ] **AC-042**: Hay al menos 15 proyectos de seed data distribuidos en Bolivia
- [ ] **AC-043**: Hay alertas reales de NASA FIRMS de los últimos 2 días
- [ ] **AC-044**: El pitch deck está preparado (PDF, 6-8 slides)
- [ ] **AC-045**: Hay un video demo de 3-5 minutos grabado

---

## 13. Glossary

- **REDD+**: Reducing Emissions from Deforestation and Forest Degradation
- **tCO₂**: Toneladas de dióxido de carbono
- **GEE**: Google Earth Engine
- **FIRMS**: Fire Information for Resource Management System
- **MRV**: Monitoring, Reporting, and Verification
- **NDC**: Nationally Determined Contributions (Acuerdo de París)
- **VCS**: Verified Carbon Standard (Verra)
- **TCO**: Tierras Comunitarias de Origen
- **IPCC**: Intergovernmental Panel on Climate Change
- **Biomasa**: Materia orgánica de los bosques (troncos, raíces, hojas)
- **NDVI**: Normalized Difference Vegetation Index (índice de vegetación satelital)
- **Hectárea**: 10,000 m² (medida estándar para proyectos forestales)

---

## 14. Appendix

### A. Factores de Emisión por Tipo de Bosque (IPCC)

| Tipo de Bosque | Región Boliviana | tCO₂/ha/año | Fuente |
|----------------|------------------|-------------|---------|
| Amazonía tropical | Pando, Beni, Norte La Paz | 150 | IPCC 2019 |
| Bosque seco (Chiquitanía) | Santa Cruz | 120 | IPCC 2019 |
| Yungas | Cochabamba, Tarija | 130 | IPCC 2019 |
| Altiplano semiárido | Potosí, Oruro | 40 | IPCC 2019 |

### B. Precios de Referencia de Mercado de Carbono (2025)

| Mercado | USD/tCO₂ | Fuente |
|---------|----------|--------|
| Mercado voluntario (promedio) | $15 | Ecosystem Marketplace 2024 |
| Mercado de cumplimiento (UE ETS) | $65 | EU Carbon Market |
| Proyectos premium (co-beneficios) | $40-80 | Verra Registry |
| Proyectos comunitarios indígenas | $50-150 | Gold Standard |

### C. Datasets de Google Earth Engine Recomendados

1. **Hansen Global Forest Change**: `UMD/hansen/global_forest_change_2023_v1_11`
   - Pérdida de cobertura forestal anual 2000-2023
   - Resolución: 30m

2. **Sentinel-2 Surface Reflectance**: `COPERNICUS/S2_SR`
   - Imágenes ópticas recientes
   - Resolución: 10-20m
   - Actualización: cada 5 días

3. **MODIS Vegetation Indices**: `MODIS/006/MOD13A2`
   - NDVI, EVI
   - Resolución: 1km
   - Útil para tendencias temporales

4. **Global Biomass**: `NASA/ORNL/biomass_carbon_density/v1`
   - Densidad de carbono aboveground
   - Resolución: 300m

### D. Bounding Box de Bolivia (para NASA FIRMS)

```
Coordenadas: -69.6, -23.0, -57.5, -10.0
Formato: min_lon, min_lat, max_lon, max_lat
```

### E. Departamentos de Bolivia (Geocoding Reference)

| Departamento | Capital | Coordenadas Aprox. |
|--------------|---------|-------------------|
| La Paz | La Paz | -16.5, -68.15 |
| Santa Cruz | Santa Cruz | -17.78, -63.18 |
| Cochabamba | Cochabamba | -17.39, -66.16 |
| Potosí | Potosí | -19.58, -65.75 |
| Oruro | Oruro | -17.98, -67.13 |
| Chuquisaca | Sucre | -19.03, -65.26 |
| Tarija | Tarija | -21.53, -64.73 |
| Beni | Trinidad | -14.83, -64.90 |
| Pando | Cobija | -11.03, -68.76 |

---

**Documento creado**: 2025-01-23
**Versión**: 1.0
**Autor**: Equipo CARBONO
**Estado**: Aprobado para desarrollo
**Próxima revisión**: Post-demo con gobierno

