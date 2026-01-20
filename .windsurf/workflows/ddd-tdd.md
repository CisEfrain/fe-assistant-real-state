---
description: Guiar un ciclo iterativo de **Component-Driven Development (CDD)** o **Test-Driven Development (TDD)** para implementar una tarea del plan en React/TypeScript.
auto_execution_mode: 1
---

## 1) Modo de trabajo (seleccionar uno)
- **TDD**: escribir primero las pruebas de componentes → implementar → refactor.
- **CDD**: modelar tipos/interfaces → componentes → store/hooks → integración.

> Si no se especifica, usar **CDD** por defecto.

---

## 2) Entradas requeridas
- Ruta del plan: `.windsurf/plans/{ticket}_{alias}_plan.md`.
- Módulo objetivo: `src/components/<feature-module>/`.
- Nombre corto de la tarea (ej: "dashboard-metrics").

---

## 3) Pasos – TDD

1. **Definir especificaciones**
   - Extraer del plan: comportamiento esperado, props, estados, interacciones.
   - Registrar breve nota en `.windsurf/temp/resume.md` (qué se va a cubrir en esta iteración).

2. **Generar pruebas (Jest + React Testing Library)**
   - Crear `*.test.tsx` cerca del componente o en `__tests__/` del módulo.
   - Cobertura mínima target: líneas ≥ 80 % (global).
   - Para componentes: usar `@testing-library/react` para renderizado y interacciones.
   - Para hooks/stores: usar `@testing-library/react-hooks` si es necesario.

3. **Implementar hasta verde**
   - Escribir el código mínimo para pasar la prueba.
   - Ejecutar **`/run-test-and-fix`** hasta que todas pasen.

4. **Refactor**
   - Limpiar duplicación, mejorar nombres, separar responsabilidades.
   - Mantener el contrato público (props, tipos) sin romper tests.

5. **Actualizar plan y doc**
   - Marcar la tarea como hecha en el plan.
   - Actualizar el plan: .windsurf/plans/{ticket}_{alias}_plan.md

---

## 4) Pasos – CDD (Component-Driven Development)

1. **Modelado de tipos**
   - Crear/ajustar **Interfaces** y **Types** en `src/types/`.
   - Definir props de componentes, estados de store, tipos de datos.

2. **Componentes base**
   - Crear componentes de presentación en el módulo correspondiente.
   - Implementar lógica de UI, manejo de props, eventos.
   - Usar TypeScript estricto para type safety.

3. **Store y hooks**
   - Actualizar `src/stores/` con nuevos estados y acciones (Zustand).
   - Crear hooks personalizados si es necesario para lógica reutilizable.
   - Integrar componentes con store.

4. **Pruebas**
   - Unitarias para componentes con React Testing Library.
   - Tests de integración para flujos completos.
   - Correr **`/run-test-and-fix`**.

5. **Actualizar plan y doc**
   - Marcar avance en el plan.
   - Actualizar el plan: .windsurf/plans/{ticket}_{alias}_plan.md

---

## 5) Plantillas rápidas

### A) Interface de tipos
```ts
// src/types/index.ts
export interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: React.ComponentType;
}

export interface DashboardState {
  metrics: DashboardMetrics;
  isLoading: boolean;
  error: string | null;
}
```

### B) Componente React con TypeScript
```tsx
import React from 'react';
import { MetricCardProps } from '../../types';

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {change && (
        <p className={`text-sm ${
          change > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </p>
      )}
    </div>
  );
};
```

### C) Zustand Store
```ts
import { create } from 'zustand';
import { DashboardState, DashboardMetrics } from '../types';

export const useDashboardStore = create<DashboardState & {
  fetchMetrics: () => Promise<void>;
  setError: (error: string | null) => void;
}>((set, get) => ({
  metrics: {} as DashboardMetrics,
  isLoading: false,
  error: null,
  
  fetchMetrics: async () => {
    set({ isLoading: true, error: null });
    try {
      // API call logic
      const metrics = await fetchDashboardMetrics();
      set({ metrics, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  setError: (error) => set({ error })
}));
```

### D) Test de componente
```tsx
import { render, screen } from '@testing-library/react';
import { MetricCard } from './MetricCard';
import { TrendingUp } from 'lucide-react';

describe('MetricCard', () => {
  it('renders metric information correctly', () => {
    render(
      <MetricCard 
        title="Total Calls" 
        value="1,234" 
        change={5.2}
        icon={TrendingUp}
      />
    );
    
    expect(screen.getByText('Total Calls')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
  });
});
```

---

## 6) Criterios de salida
- Tests verdes (componentes/integración) para la tarea abordada.
- Plan actualizado y, si cambió interfaces/props, docs actualizadas.
- Componentes siguiendo principios de composición y reutilización.
- TypeScript sin errores con modo estricto.

---

## 7) Notas
- Los tests de depuración temporal van en `.windsurf/temp/test_*.tsx` y no se versionan. 
- Si aparecen **gotchas** o patrones reusables, registrarlos en `solutions_commons_problems.md`.
- Si se difiere una mejora, anotarla en `technical_debt.md` con prioridad.
- Usar React.memo para componentes que renderizan frecuentemente.
- Preferir composición sobre herencia en componentes.