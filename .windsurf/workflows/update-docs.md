---
description: Generar o actualizar documentación técnica **después de cambios de código** que afecten componentes, interfaces o estructura en React/TypeScript.  
auto_execution_mode: 1
---

## 1) Alcance y entradas
- Detectar archivos modificados desde el último commit (o rama base si se indica).
- Identificar **módulos impactados** (`src/components/<feature-module>/...`) y tipos/stores si aplica.
- Recibir opcionalmente: ticket/alias para enlazar con el plan en `.windsurf/plans/`.

## 2) Tareas por cada módulo impactado

### A) README del módulo
1. Crear/actualizar `src/components/<module>/README.md` con:
   - **Overview** (qué resuelve el módulo, funcionalidad principal).
   - **Componentes**: lista de componentes principales y su propósito.
   - **Props & Interfaces**: tipos principales y sus propiedades.
   - **Store Integration**: cómo se conecta con Zustand store.
   - **Usage Examples**: ejemplos de uso de los componentes.
   - **Testing**: cómo correr tests del módulo.
   - **Quick reference**: props y ejemplos mínimos.
2. Agregar ejemplos de uso si se tocaron interfaces de componentes.

### B) Diagramas (opcional si hubo cambios de flujo)
- Generar/actualizar diagrama **Mermaid** en el README que refleje el flujo Component → Store → API Service, y las interacciones entre componentes.

### C) Storybook (opcional)
- Si hay componentes reutilizables, considerar crear stories:
  - Ejemplos de diferentes estados del componente.
  - Documentación de props y variaciones.
- Añadir stories en `src/components/<module>/<Component>.stories.tsx`.

### D) knowledge base
- Si se detectaron patrones reusables o gotchas:
  - Actualizar `.windsurf/project_info/solutions_commons_problems.md` con:
    - **Context** → **Problem** → **Solution** → **Trade-offs** → **Prevention**.
- Si hay deuda técnica (algo postergado): registrar en `.windsurf/project_info/technical_debt.md`.

---

## 3) Validaciones automáticas
- Comprobar consistencia de enlaces entre READMEs y el plan (`.windsurf/plans/{ticket}_{alias}_plan.md` si se proveyó).
- Verificar que los ejemplos de componentes usen imports reales del proyecto.
- Si hay Storybook: validar que las stories compilen correctamente.

---

## 4) Salidas
- READMEs de módulos actualizados.
- Diagramas/links incorporados.
- Stories de Storybook agregadas si corresponde.
- `solutions_commons_problems.md` y `technical_debt.md` actualizados si corresponde.
- Mensaje final con resumen por módulo (archivos tocados).

---

## 5) Notas
- No documentar tests de depuración local (`.windsurf/temp/test_*.tsx`).
- Mantener el tono factual y conciso; evitar duplicar contenido de `architecture.md`.
- Si el cambio fue revertido en el código, **revertir** también en la documentación.
- Documentar patrones de composición y reutilización de componentes.