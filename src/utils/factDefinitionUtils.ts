// Utilities for FactDefinition validation and management

import { FactDefinition, FactDefinitionType } from '../types/agents';

export interface FactValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a single FactDefinition
 */
export function validateFactDefinition(def: FactDefinition): FactValidationResult {
  const errors: string[] = [];

  // Validate name
  if (!def.name || typeof def.name !== 'string') {
    errors.push('name is required and must be a string');
  } else if (!/^[a-z_][a-z0-9_]*$/i.test(def.name)) {
    errors.push('name must be alphanumeric with underscores (e.g., has_budget, is_qualified)');
  }

  // Validate type
  const validTypes: FactDefinitionType[] = ['exists', 'equals', 'any_exists', 'all_exists', 'composite', 'not_exists'];
  if (!validTypes.includes(def.type)) {
    errors.push(`type must be one of: ${validTypes.join(', ')}`);
  }

  // Type-specific validations
  switch (def.type) {
    case 'exists':
    case 'not_exists':
      if (!def.field || typeof def.field !== 'string') {
        errors.push(`${def.type} requires 'field' property (string)`);
      }
      break;

    case 'equals':
      if (!def.field || typeof def.field !== 'string') {
        errors.push('equals requires \'field\' property (string)');
      }
      if (def.value === undefined) {
        errors.push('equals requires \'value\' property');
      }
      break;

    case 'any_exists':
    case 'all_exists':
      if (!Array.isArray(def.fields) || def.fields.length === 0) {
        errors.push(`${def.type} requires non-empty 'fields' array`);
      } else if (def.fields.some(f => typeof f !== 'string')) {
        errors.push(`${def.type} 'fields' must be an array of strings`);
      }
      break;

    case 'composite':
      if (!Array.isArray(def.conditions) || def.conditions.length === 0) {
        errors.push('composite requires non-empty \'conditions\' array');
      } else if (def.conditions.some(c => !c.fact || typeof c.fact !== 'string')) {
        errors.push('composite conditions must have \'fact\' property (string)');
      }
      if (def.logic && !['all', 'any'].includes(def.logic)) {
        errors.push('composite logic must be \'all\' or \'any\'');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates an array of FactDefinitions
 */
export function validateFactDefinitions(definitions: FactDefinition[]): FactValidationResult {
  const errors: string[] = [];
  const names = new Set<string>();

  definitions.forEach((def, index) => {
    // Validate individual definition
    const result = validateFactDefinition(def);
    if (!result.valid) {
      errors.push(`Definition ${index + 1} (${def.name || 'unnamed'}): ${result.errors.join(', ')}`);
    }

    // Check for duplicate names
    if (def.name) {
      if (names.has(def.name)) {
        errors.push(`Duplicate fact name: "${def.name}"`);
      }
      names.add(def.name);
    }
  });

  // Validate composite fact references
  definitions.forEach(def => {
    if (def.type === 'composite' && def.conditions) {
      def.conditions.forEach(cond => {
        if (!names.has(cond.fact)) {
          errors.push(`Composite fact "${def.name}" references undefined fact: "${cond.fact}"`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates an empty FactDefinition template
 */
export function createEmptyFactDefinition(type: FactDefinitionType = 'exists'): FactDefinition {
  const base: FactDefinition = {
    name: '',
    type
  };

  switch (type) {
    case 'exists':
    case 'not_exists':
      return { ...base, field: '' };
    
    case 'equals':
      return { ...base, field: '', value: '' };
    
    case 'any_exists':
    case 'all_exists':
      return { ...base, fields: [] };
    
    case 'composite':
      return { ...base, logic: 'all', conditions: [] };
    
    default:
      return base;
  }
}

/**
 * Translates a FactDefinition to natural language description
 */
export function translateFactDefinitionToNaturalLanguage(def: FactDefinition): string {
  switch (def.type) {
    case 'exists':
      return `Existe el campo "${def.field}"`;
    
    case 'not_exists':
      return `NO existe el campo "${def.field}"`;
    
    case 'equals':
      return `El campo "${def.field}" es igual a "${def.value}"`;
    
    case 'any_exists':
      return `Al menos uno de estos campos existe: ${def.fields?.join(', ')}`;
    
    case 'all_exists':
      return `Todos estos campos existen: ${def.fields?.join(', ')}`;
    
    case 'composite': {
      const logic = def.logic === 'all' ? 'TODOS' : 'AL MENOS UNO';
      const facts = def.conditions?.map(c => c.fact).join(', ') || '';
      return `${logic} de estos facts son verdaderos: ${facts}`;
    }
    
    default:
      return 'Definición desconocida';
  }
}

/**
 * Gets the icon for a FactDefinitionType
 */
export function getFactTypeIcon(type: FactDefinitionType): string {
  switch (type) {
    case 'exists':
      return '✓';
    case 'not_exists':
      return '✗';
    case 'equals':
      return '=';
    case 'any_exists':
      return '∨';
    case 'all_exists':
      return '∧';
    case 'composite':
      return '⚙️';
    default:
      return '?';
  }
}

/**
 * Gets the color class for a FactDefinitionType
 */
export function getFactTypeColor(type: FactDefinitionType): string {
  switch (type) {
    case 'exists':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'not_exists':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'equals':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'any_exists':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'all_exists':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'composite':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Detects circular dependencies in composite facts
 */
export function detectCircularDependencies(definitions: FactDefinition[]): string[] {
  const errors: string[] = [];
  const graph = new Map<string, Set<string>>();

  // Build dependency graph
  definitions.forEach(def => {
    if (def.type === 'composite' && def.conditions) {
      const deps = new Set(def.conditions.map(c => c.fact));
      graph.set(def.name, deps);
    }
  });

  // DFS to detect cycles
  function hasCycle(node: string, visited: Set<string>, recStack: Set<string>): boolean {
    visited.add(node);
    recStack.add(node);

    const neighbors = graph.get(node);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor, visited, recStack)) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          errors.push(`Circular dependency detected: ${node} → ${neighbor}`);
          return true;
        }
      }
    }

    recStack.delete(node);
    return false;
  }

  const visited = new Set<string>();
  graph.forEach((_, node) => {
    if (!visited.has(node)) {
      hasCycle(node, visited, new Set());
    }
  });

  return errors;
}
