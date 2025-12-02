# Metodología de Cálculo de Carbono

## Descripción General

Este documento describe la metodología científica utilizada para calcular la captura de CO₂ en proyectos forestales y de uso de suelo en Bolivia.

**Última actualización:** Diciembre 2025
**Versión de factores IPCC:** 2019 Refinement

---

## Fuentes Científicas

### Principales Referencias

1. **IPCC 2019 Refinement**
   - *2019 Refinement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories*
   - Tablas 4.12 (Bosques Tropicales) y 6.2 (Pastizales/Matorrales)
   - https://www.ipcc-nggip.iges.or.jp/public/2019rf/

2. **FAO FRA 2020**
   - *Global Forest Resources Assessment 2020*
   - Datos de cobertura forestal de Bolivia
   - https://www.fao.org/forest-resources-assessment/

3. **Hansen Global Forest Change**
   - *University of Maryland - Global Forest Change dataset*
   - Datos de pérdida forestal 2000-2023
   - https://glad.earthengine.app/view/global-forest-change

4. **ABT Bolivia**
   - *Autoridad de Fiscalización y Control Social de Bosques y Tierra*
   - Datos oficiales de deforestación en Bolivia
   - https://www.abt.gob.bo/

5. **INRA Bolivia**
   - *Instituto Nacional de Reforma Agraria*
   - Datos de uso de suelo por departamento

---

## Factores de Captura de CO₂

### Tasas Anuales por Tipo de Bosque

Los valores representan la **tasa de captura anual** (flujo), NO la biomasa acumulada (stock).

| Tipo de Bosque | tCO₂/ha/año | Rango | Fuente IPCC |
|----------------|-------------|-------|-------------|
| **Amazonía Tropical** | 10 | 5-15 | Table 4.12 - Tropical Rainforest |
| **Bosque Seco Chiquitano** | 5.5 | 3-8 | Table 4.12 - Tropical Dry Forest |
| **Yungas** | 8 | 4-12 | Table 4.12 - Subtropical Forest |
| **Altiplano Semiárido** | 2 | 1-3 | Table 6.2 - Shrubland/Grassland |

### Factores de Proyecto

Ajustan el cálculo según el tipo de intervención:

| Tipo de Proyecto | Factor | Justificación |
|------------------|--------|---------------|
| **REDD+** | 0.9 | Evita deforestación, captura conservadora |
| **Reforestación** | 1.2 | Plantación activa, mayor captura inicial |
| **Conservación Comunitaria** | 1.0 | Protección de bosque existente |
| **Energía Renovable** | 0.8 | Estimación indirecta de emisiones evitadas |
| **Agricultura Regenerativa** | 0.7 | Captura incremental en suelos |

---

## Fórmula de Cálculo

```
CO₂ anual = Área (ha) × Biomasa (tC/ha) × 3.67 × Factor de Proyecto
```

Donde:
- **Área**: Hectáreas del proyecto
- **Biomasa**: Carbono capturado por hectárea (de factores IPCC)
- **3.67**: Ratio de conversión C → CO₂ (peso molecular 44/12)
- **Factor de Proyecto**: Ajuste según tipo de intervención

### Ejemplo de Cálculo

**Proyecto:** Agricultura Regenerativa en Potosí
**Área:** 1.19 ha
**Departamento:** Potosí → Factor Altiplano = 2 tCO₂/ha/año
**Factor de proyecto:** 0.7

```
CO₂ = 1.19 ha × 2 tCO₂/ha/año × 0.7 = 1.67 tCO₂/año
```

---

## Datos de Bolivia

### Cobertura Forestal por Departamento (2020)

Fuente: ABT Bolivia + INRA

| Departamento | Área Forestal (ha) | % Cobertura | Pérdida Anual (ha/año) |
|--------------|-------------------|-------------|------------------------|
| **Santa Cruz** | 18,500,000 | 50.3% | 120,000 |
| **Beni** | 14,800,000 | 69.2% | 45,000 |
| **Pando** | 6,300,000 | 94.8% | 8,000 |
| **La Paz** | 5,900,000 | 44.1% | 25,000 |
| **Cochabamba** | 3,200,000 | 57.8% | 18,000 |
| **Tarija** | 1,800,000 | 48.6% | 12,000 |
| **Chuquisaca** | 1,200,000 | 23.4% | 9,000 |
| **Potosí** | 600,000 | 5.1% | 4,000 |
| **Oruro** | 200,000 | 3.8% | 2,000 |
| **TOTAL** | **52,500,000** | **47.8%** | **290,000** |

### Tendencia Histórica

| Período | Pérdida Promedio (ha/año) |
|---------|---------------------------|
| 2000-2010 | ~170,000 |
| 2010-2020 | ~290,000 |
| 2020-2023 | ~310,000 (aceleración) |

---

## Limitaciones y Consideraciones

### Incertidumbre

Los cálculos tienen un margen de error de ±20-30% debido a:
- Variabilidad natural en densidad de biomasa
- Diferencias en edad y composición del bosque
- Factores climáticos locales
- Degradación forestal no detectada

### Verificación

Para certificación de créditos de carbono se requiere:
- Mediciones en campo (inventarios forestales)
- Imágenes satelitales de alta resolución
- Monitoreo continuo (MRV - Measurement, Reporting, Verification)
- Auditoría externa independiente

### Tasa de Verificación

En la práctica, solo el **70-90%** de la captura teórica es verificada y certificada como créditos de carbono válidos.

---

## Uso en el Sistema

### Archivos Principales

- `src/lib/carbon/ipcc-factors.ts` - Factores IPCC actualizados
- `src/lib/carbon/calculator.ts` - Motor de cálculo
- `src/lib/carbon/market-prices.ts` - Precios de mercado

### Recalculación de Proyectos

Si actualizas los factores IPCC, ejecuta:

```bash
curl http://localhost:3000/api/admin/recalculate-carbon
```

Esto recalculará todos los proyectos existentes con los nuevos factores.

---

## Referencias Adicionales

1. Brown, S. (1997). *Estimating Biomass and Biomass Change of Tropical Forests*. FAO Forestry Paper 134.

2. Chave, J., et al. (2014). *Improved allometric models to estimate the aboveground biomass of tropical trees*. Global Change Biology, 20(10), 3177-3190.

3. Houghton, R.A., et al. (2012). *Carbon emissions from land use and land-cover change*. Biogeosciences, 9(12), 5125-5142.

4. Pan, Y., et al. (2011). *A large and persistent carbon sink in the world's forests*. Science, 333(6045), 988-993.

5. Saatchi, S.S., et al. (2011). *Benchmark map of forest carbon stocks in tropical regions across three continents*. PNAS, 108(24), 9899-9904.

---

## Contacto

Para consultas sobre la metodología:
- **Email**: carbono@carbono.bo
- **Documentación técnica**: /docs/

**Última revisión:** Diciembre 2025
