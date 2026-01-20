---
description: Guiar el inicio de un nuevo desarrollo (ticket/historia), crear el **plan técnico** y, si corresponde, **scaffoldear un módulo nuevo** con la estructura estándar.
auto_execution_mode: 1
---

## 1) Recolección de contexto (preguntas)
1. ID del ticket y alias corto (ej: `IAD-123` / `quality-metrics`)
2. Descripción resumida de la historia (1–2 párrafos + criterios de aceptación)
3. ¿Qué módulo de la aplicación afecta? (dashboard, calls, conversion, search, appointments, quality)
4. ¿Requiere nuevos componentes o modificar existentes?
5. ¿Necesita cambios en el store global (useCallStore)?
6. ¿Requiere nuevos tipos/interfaces?
7. ¿Depende de la Call Analytics API?
8. ¿Tienes wireframes, mockups o especificaciones de UX?

> No asumir nada: si falta información, preguntar explícitamente.

---

## 2) Generación del plan
- Crear **`.windsurf/plans/{ticket}_{alias}_plan.md`** con este esqueleto:

```markdown
# {ticket} · {alias} · Plan

## Objetivo
{resumen del objetivo del feature}

## Checklist técnico
- [ ] Componentes a crear o modificar
- [ ] Tipos/interfaces nuevos (src/types/index.ts)
- [ ] Cambios en useCallStore (estados, acciones, computed)
- [ ] Servicios API (src/services/api.ts)
- [ ] Routing/navegación (App.tsx, Layout.tsx)
- [ ] Estilos Tailwind y responsive design
- [ ] Tests con React Testing Library
- [ ] Documentación del módulo

## Interfaces y tipos
{interfaces de props, tipos de datos, estados del store}

## Componentes
| Componente | Props principales | Responsabilidad |
|------------|-------------------|------------------|
| {Component} | {props} | {descripción} |

## Flujos de usuario
{wireframes o diagramas de interacción UX}

## Store integration
{nuevos estados, acciones y computed properties en useCallStore}

## API integration
{endpoints necesarios, filtros, paginación}

## Consideraciones
- Riesgos:
- Deuda técnica (si se difiere algo):
- Observaciones:
```

---

## 3) **Decision Gate**: ¿Es un módulo nuevo?
- **Si NO** → ir a la sección 4 (Challenge del plan).
- **Si SÍ** → ejecutar **New Feature Checklist (scaffold)**:

### New Feature Checklist (módulo nuevo)
1. **Crear estructura siguiendo la arquitectura existente:**
   ```
   src/components/{module}/
   ├─ {Module}Module.tsx         # Componente principal (ej: QualityModule.tsx)
   ├─ {Module}Metrics.tsx        # Métricas específicas
   ├─ {Module}Filters.tsx        # Sistema de filtros
   ├─ {Module}Table.tsx          # Tabla de datos si aplica
   ├─ {Module}Chart.tsx          # Visualizaciones si aplica
   └─ __tests__/                 # Tests del módulo
      └─ {Module}Module.test.tsx
   ```
2. **Actualizar tipos globales:**
   - Agregar interfaces en `src/types/index.ts`
   - Seguir convenciones existentes (CallRecord, DashboardMetrics, etc.)
3. **Integrar con store global:**
   - Actualizar `src/stores/useCallStore.ts`
   - Agregar computed properties para métricas del módulo
   - Mantener consistencia con filtros existentes
4. **Conectar con API:**
   - Usar `src/services/api.ts` existente
   - Reutilizar endpoints con filtros específicos
   - Mantener patrón de autenticación JWT
5. **Integrar navegación:**
   - Actualizar `src/components/Layout.tsx` con nueva opción de menú
   - Agregar caso en `src/App.tsx` para routing
6. **Documentación:**
   - Seguir patrón de módulos existentes
   - Documentar integración con store y API

> Regla: Seguir la arquitectura de módulos existente. Cada módulo tiene componente principal, métricas, filtros. Lógica de negocio en useCallStore con computed properties.

---

## 4) Challenge inicial del plan
- Sugerir al dev ejecutar **`/review-plan`** para una revisión estilo **Tech Lead**:
  - Riesgos y supuestos no validados
  - Casos borde/UX
  - Impacto en performance/rendering
- Si hay ajustes, **actualizar** el plan y confirmar.

---

## 5) Salidas del workflow
- Plan creado/actualizado en: `.windsurf/plans/{ticket}_{alias}_plan.md`
- (Opcional) Módulo scaffoldeado en `src/components/{new-module}/`
- Próximos pasos recomendados:
  1) Ejecutar `/review-plan`  
  2) Comenzar desarrollo con `/ddd-tdd` (modo CDD para componentes)  
  3) Mantener `resume.md` actualizado en `.windsurf/temp/`

---

## Notas
- Cualquier deuda técnica detectada → **`.windsurf/project_info/technical_debt.md`** (con prioridad/owner).
- Si se descubren patrones reusables o gotchas → **`solutions_commons_problems.md`** (contexto → problema → solución → trade-offs).
- Seguir estrictamente la arquitectura de módulos definida en `architecture.md`.
- Reutilizar componentes existentes (MetricCard, filtros, tablas).
- Mantener consistencia con el diseño Tailwind CSS existente.
- Cada módulo debe integrarse con el store global useCallStore.