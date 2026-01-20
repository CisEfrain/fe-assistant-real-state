// Utilities for Guard validation and translation

import { GuardExpression, FactKey, CORE_FACTS, FactDefinition, getAvailableFacts } from '../types/agents';

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a guard expression structure
 */
export function validateGuard(
  guard: GuardExpression | undefined | null,
  path: string = 'root',
  availableFacts: Record<string, unknown> = CORE_FACTS
): ValidationResult {
  const errors: string[] = [];
  
  if (!guard) return { valid: true, errors: [] }; // No guard is valid
  
  const validOperators = ['all', 'any', 'not', 'eq', 'neq', 'exists'];
  const foundOperators = validOperators.filter(op => (guard as Record<string, unknown>)[op] !== undefined);
  
  if (foundOperators.length === 0) {
    errors.push(`${path}: Guard debe tener al menos un operador válido (${validOperators.join(', ')})`);
  }
  
  if (foundOperators.length > 1) {
    errors.push(`${path}: Solo un operador por expresión. Encontrados: ${foundOperators.join(', ')}`);
  }
  
  // Validate specific operators
  if (guard.eq !== undefined) {
    if (!Array.isArray(guard.eq) || guard.eq.length !== 2) {
      errors.push(`${path}.eq: Debe ser un array [factKey, value]`);
    } else if (typeof guard.eq[0] !== 'string') {
      errors.push(`${path}.eq: El primer elemento debe ser un string (factKey)`);
    } else if (!isValidFactKey(guard.eq[0], availableFacts)) {
      errors.push(`${path}.eq: Fact key "${guard.eq[0]}" no es válido. Valores permitidos: ${Object.keys(availableFacts).join(', ')}`);
    }
  }
  
  if (guard.neq !== undefined) {
    if (!Array.isArray(guard.neq) || guard.neq.length !== 2) {
      errors.push(`${path}.neq: Debe ser un array [factKey, value]`);
    } else if (typeof guard.neq[0] !== 'string') {
      errors.push(`${path}.neq: El primer elemento debe ser un string (factKey)`);
    } else if (!isValidFactKey(guard.neq[0], availableFacts)) {
      errors.push(`${path}.neq: Fact key "${guard.neq[0]}" no es válido. Valores permitidos: ${Object.keys(availableFacts).join(', ')}`);
    }
  }
  
  if (guard.exists !== undefined) {
    if (typeof guard.exists !== 'string') {
      errors.push(`${path}.exists: Debe ser un string (factKey)`);
    } else if (!isValidFactKey(guard.exists, availableFacts)) {
      errors.push(`${path}.exists: Fact key "${guard.exists}" no es válido. Valores permitidos: ${Object.keys(availableFacts).join(', ')}`);
    }
  }
  
  if (guard.all !== undefined) {
    if (!Array.isArray(guard.all)) {
      errors.push(`${path}.all: Debe ser un array de expresiones`);
    } else {
      guard.all.forEach((sub, i) => {
        const subValidation = validateGuard(sub, `${path}.all[${i}]`, availableFacts);
        errors.push(...subValidation.errors);
      });
    }
  }
  
  if (guard.any !== undefined) {
    if (!Array.isArray(guard.any)) {
      errors.push(`${path}.any: Debe ser un array de expresiones`);
    } else {
      guard.any.forEach((sub, i) => {
        const subValidation = validateGuard(sub, `${path}.any[${i}]`, availableFacts);
        errors.push(...subValidation.errors);
      });
    }
  }
  
  if (guard.not !== undefined) {
    const subValidation = validateGuard(guard.not, `${path}.not`, availableFacts);
    errors.push(...subValidation.errors);
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Checks if a fact key is valid
 */
function isValidFactKey(key: string, availableFacts: Record<string, unknown>): boolean {
  return key in availableFacts;
}

/**
 * Translates a guard expression to natural language (Spanish)
 */
export function translateGuardToNaturalLanguage(
  guard: GuardExpression | undefined,
  availableFacts: Record<string, { label: string }> = CORE_FACTS
): string {
  if (!guard) return 'Sin restricciones (siempre elegible)';
  
  return translateExpression(guard, 0, availableFacts);
}

function translateExpression(
  expr: GuardExpression,
  level: number = 0,
  availableFacts: Record<string, { label: string }> = CORE_FACTS
): string {
  
  if (expr.all) {
    const conditions = expr.all.map(sub => translateExpression(sub, level + 1, availableFacts));
    if (level === 0) {
      return conditions.join('\n✓ Y ');
    }
    return `(${conditions.join(' Y ')})`;
  }
  
  if (expr.any) {
    const conditions = expr.any.map(sub => translateExpression(sub, level + 1, availableFacts));
    if (level === 0) {
      return conditions.join('\n✓ O ');
    }
    return `(${conditions.join(' O ')})`;
  }
  
  if (expr.not) {
    const inner = translateExpression(expr.not, level + 1, availableFacts);
    return `NO ${inner}`;
  }
  
  if (expr.eq) {
    const [factKey, value] = expr.eq;
    const factLabel = availableFacts[factKey]?.label || factKey;
    return `${factLabel} sea ${formatValue(value)}`;
  }
  
  if (expr.neq) {
    const [factKey, value] = expr.neq;
    const factLabel = availableFacts[factKey]?.label || factKey;
    return `${factLabel} NO sea ${formatValue(value)}`;
  }
  
  if (expr.exists) {
    const factLabel = availableFacts[expr.exists]?.label || expr.exists;
    return `${factLabel} exista`;
  }
  
  return 'Condición desconocida';
}

function formatValue(value: unknown): string {
  if (value === null) return 'nulo';
  if (value === true) return 'verdadero';
  if (value === false) return 'falso';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

/**
 * Creates an empty guard expression
 */
export function createEmptyGuard(): GuardExpression {
  return {
    all: []
  };
}

/**
 * Creates a simple equality condition
 */
export function createEqCondition(factKey: FactKey, value: unknown): GuardExpression {
  return {
    eq: [factKey, value]
  };
}

/**
 * Creates a simple inequality condition
 */
export function createNeqCondition(factKey: FactKey, value: unknown): GuardExpression {
  return {
    neq: [factKey, value]
  };
}

/**
 * Creates an exists condition
 */
export function createExistsCondition(factKey: FactKey): GuardExpression {
  return {
    exists: factKey
  };
}

/**
 * Wraps an expression with NOT
 */
export function wrapWithNot(expr: GuardExpression): GuardExpression {
  return {
    not: expr
  };
}

/**
 * Checks if a guard is empty (no conditions)
 */
export function isEmptyGuard(guard: GuardExpression | undefined): boolean {
  if (!guard) return true;
  
  if (guard.all && guard.all.length === 0) return true;
  if (guard.any && guard.any.length === 0) return true;
  
  return false;
}

/**
 * Gets all fact keys used in a guard expression
 */
export function getUsedFactKeys(guard: GuardExpression | undefined): string[] {
  if (!guard) return [];
  
  const keys = new Set<string>();
  
  function traverse(expr: GuardExpression) {
    if (expr.eq && typeof expr.eq[0] === 'string') keys.add(expr.eq[0]);
    if (expr.neq && typeof expr.neq[0] === 'string') keys.add(expr.neq[0]);
    if (expr.exists && typeof expr.exists === 'string') keys.add(expr.exists);
    
    if (expr.all) expr.all.forEach(traverse);
    if (expr.any) expr.any.forEach(traverse);
    if (expr.not) traverse(expr.not);
  }
  
  traverse(guard);
  return Array.from(keys);
}
