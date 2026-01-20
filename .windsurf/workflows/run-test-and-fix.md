---
description: Ejecutar pruebas y **autocorregir iterativamente** errores comunes en TypeScript/React hasta dejar la suite en verde (o reportar bloqueos), sin tocar archivos temporales.
auto_execution_mode: 1
---

---

## 1) Alcance
- Tests de **Jest** con **React Testing Library** (componentes y hooks).
- Type-check con `tsc --noEmit`.
- Lint autofix con `eslint --fix` (sólo si no rompe compilación).
- **Excluir** `.windsurf/temp/` (no ejecutar ni editar tests `test_*.tsx` allí).

---

## 2) Estrategia de ejecución [no ejecutar en terminal, solo nombrar los comandos y esperar la respuesta]
1. Determinar conjunto inicial de pruebas:
   - Si se puede, ejecutar **sólo archivos afectados** por los cambios (watch mode o `--findRelatedTests`). o Solo las pruebas del feature actual 
   - En su defecto, ejecutar la suite completa.
2. Orden sugerido por iteración:
   1) `tsc --noEmit`  
   2) `eslint --fix` (archivos tocados)  
   3) `npm run test` (ó `--findRelatedTests <files>`)
3. Repetir hasta **N = 3** iteraciones o hasta quedar en verde.

---

## 3) Reglas de autocorrección
- **TypeScript errors**:
  - Sugerir adiciones de tipos explícitos en el archivo indicado por el error.
  - Evitar `any` salvo justificación → preferir Generics/utility types.
- **Componentes React**:
  - Si falla por props, revisar interfaces y tipos en `src/types/`.
  - Si falla por hooks, verificar dependencias y estados.
- **React Testing Library**:
  - Si falla por queries, revisar selectores y elementos renderizados.
  - Si falla por eventos, verificar user interactions y async behavior.
- **Zustand Store**:
  - Si falla por estado, revisar acciones y computed properties.
  - Verificar que el store se inicialice correctamente en tests.
- **Tests inestables**:
  - Si hay flaky tests, marcar con `@flaky` y **no** bloquear; abrir ítem en `technical_debt.md`.
- **Snapshots**:
  - No actualizar snapshots automáticamente; pedir confirmación explícita si se requiere.

---

## 4) Reporte por ciclo
Al finalizar cada iteración, producir resumen Markdown con:
```markdown
# Test & Fix – Iteration {n}

## Type-check
- {OK|errores} (lista de archivos/lineas clave)

## Lint
- {issues fixed / remaining}

## Jest
- Passed: {n}  Failed: {m}  Skipped: {k}
- Top failures:
  1) {test name} – {file}:{line}
     Cause: {component|hook|store|async|timeout}
     Proposed fix: {summary}
```

Si al llegar a N=3 todavía hay fallos críticos, **detener** y emitir sección **"Blocking issues"** con enlaces a archivos y propuestas.

---

## 5) Criterios de salida
- ✅ **Green**: sin errores de type-check, ESLint sin errores, Jest passed/skipped.
- ⚠️ **Warnings**: flaky tests, vulnerabilidades leves, style warnings (permiten continuar).
- ❌ **Blocking**: type errors, tests fallidos, secretos detectados, ruptura de contratos (props/interfaces).

---

## 6) Acciones posteriores
- Si hubo cambios en interfaces o componentes, recomendar correr **`/update-docs`**.
- Si se aplicaron fixes relevantes o se detectaron patrones, actualizar `solutions_commons_problems.md`.
- Para deudas detectadas, registrar en `technical_debt.md` con prioridad/sprint.

---

## 7) Notas
- Mantener el loop breve (máx. 3 iteraciones); evitar cambios masivos automáticos.
- No tocar archivos bajo `.windsurf/temp/`.
- Respetar la regla: Componentes de presentación **no** dependen directamente del store global.
- Usar React Testing Library best practices: queries por rol, texto, etc.