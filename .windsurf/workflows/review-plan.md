---
description: Revisar de forma crítica un plan técnico generado en `.windsurf/plans/{ticket}_{alias}_plan.md`, simulando la mirada de un Tech Lead.   El objetivo es **detectar huecos, riesgos y oportunidades de mejora** antes de iniciar el desarrollo.
auto_execution_mode: 1
---

---

## 1) Entrada requerida
- Ruta del plan (`.windsurf/plans/{ticket}_{alias}_plan.md`).
- Contexto adicional del ticket si lo hubiera.

---

## 2) Checklist de revisión

### A) Consistencia
- ¿El **objetivo** está claro y alineado con la historia de usuario?
- ¿El **modelo de datos** refleja correctamente los cambios necesarios?
- ¿Los **endpoints** propuestos cubren los criterios de aceptación?

### B) Seguridad
- ¿Se especifica autenticación/autorización?
- ¿Se contemplan validaciones de entrada (`class-validator`)?
- ¿Se evita exponer información sensible?

### C) Performance
- Riesgos de N+1 queries o consultas ineficientes.
- Necesidad de cache o índices adicionales.

### D) Calidad técnica
- Separación de capas Domain / Application / Infrastructure respetada.
- Tests unitarios/integración planificados.
- Identificación de deuda técnica documentada en `technical_debt.md`.

### E) Integraciones externas
- ¿Están todos los **clients** externos identificados?
- ¿Se consideran timeouts, retries, logging y métricas?

---

## 3) Proceso

1. Leer el plan completo.  
2. Ejecutar checklist A–E.  
3. Producir un **reporte de revisión** con formato:

```markdown
# Review Report – {ticket} · {alias}

## Strengths
- …

## Risks / Gaps
- …

## Recommendations
- …

## Action Items
- [ ] Update plan with missing X
- [ ] Add Y to technical_debt.md
- [ ] Confirm external dependency Z
```

4. Guardar el reporte como comentario dentro del mismo archivo del plan (al final, sección “Review Report”).

---

## 4) Salidas
- Plan actualizado con observaciones al final.
- Próximos pasos sugeridos:
  - Corregir plan según recomendaciones.
  - Confirmar cambios con el equipo antes de continuar con `/ddd-tdd`.

---

## Notas
- El propósito es **challenge**, no reescribir el plan completo.
- El desarrollador sigue siendo responsable de aceptar/rechazar recomendaciones.
- Si surgen nuevos patrones o gotchas, añadir a `solutions_commons_problems.md`.
