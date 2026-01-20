---
description: Ejecución rápida de **calidad antes del push**: lint + formateo, type-check, pruebas mínimas, y validaciones de estilo/seguridad/performance para React/TypeScript.   
auto_execution_mode: 1
---

Objetivo: detectar problemas comunes sin bloquear el flujo local, pero entregando un **reporte claro**.

# 1) Alcance
- Solo archivos modificados vs. la rama base (si se puede detectar); en su defecto, sobre el proyecto completo.
- Ignorar `.windsurf/temp/test_*.ts` y cualquier archivo en `.windsurf/temp/`.

---

## 2) Pasos (orden recomendado)

1. **Formato & Lint**
   - Ejecutar:
     - `prettier --write` (o la configuración del repo)
     - `eslint --fix`
   - Objetivo: dejar el código formateado y con reglas básicas corregidas.

2. **Type-check (TS)**
   - Ejecutar `tsc --noEmit` para validar types bajo `"strict": true`.

3. **Pruebas rápidas**
   - Ejecutar `npm run test` o `jest --passWithNoTests --watchAll=false`.
   - Para componentes, correr tests unitarios y de integración básicos.

4. **Estilo & convenciones**
   - Verificar convenciones de nombres (camelCase/PascalCase/snake_case según `project_rules.md`).
   - Opcional: revisar tamaño de archivos/funciones (warning si exceden umbrales).

5. **Seguridad (estática y dependencias)**
   - SAST ligero (si hay herramienta configurada) → reportar *warnings*.
   - Dependencias: `npm audit --audit-level=moderate` (no bloquear, solo listar).
   - Buscar *secrets* obvios en cambios (tokens/keys) y advertir.

6. **Performance (heurística)**
   - Señalar patrones de riesgo: componentes sin memo, re-renders innecesarios, efectos sin dependencias, etc.
   - Si procede, sugerir crear ticket y anotar en `technical_debt.md`.

7. **Documentación mínima**
   - Si cambió algún contrato (props/interfaces/componentes), recomendar correr `/update-docs`.
   - Validar que no existan referencias rotas hacia el plan del ticket.

---

## 3) Reporte de salida
Producir un resumen en Markdown y mostrarlo en la consola de Cascade, por ejemplo:

```markdown
# Pre-Push Report

## Formatting & Lint
- Prettier: fixed 4 files
- ESLint: 2 issues auto-fixed, 1 warning remaining (see src/x.ts:23)

## Type-check
- OK (tsc --noEmit)

## Tests (fast)
- Jest: 42 passed, 1 skipped

## Security
- npm audit: 1 moderate (lodash) – consider upgrade
- Secrets scan: none found

## Performance hints
- Potential re-render issue in src/components/dashboard/MetricCard.tsx:42

## Docs
- Changes detected in component props → run `/update-docs`

## Decision
- ✅ Safe to push
```
> Si hay errores críticos (lint no auto-fixable, type errors, tests fallidos), mostrar **❌ Block push** y enumerar acciones sugeridas.

---

## 4) Criterios de bloqueo (recomendado)
- **Type-check** con errores.
- **Tests** fallidos (excepto suites marcadas como `@skip-fast`).
- **ESLint** con errores (warnings no bloquean).
- Detección de **secrets** en cambios.
- Componentes que rompen la arquitectura de módulos.

---

## 5) Notas
- Este workflow no reemplaza la pipeline CI completa 
- Los *findings* de performance/seguridad son heurísticos; crear ticket si amerita y registrar en `technical_debt.md`.
- No incluir archivos de `.windsurf/temp/` en el push.
- Verificar que los componentes sigan las convenciones de naming y estructura de módulos.
