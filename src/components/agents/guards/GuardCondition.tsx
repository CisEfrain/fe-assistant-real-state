import React from 'react';
import { Trash2 } from 'lucide-react';
import { GuardExpression } from '../../../types/agents';

interface GuardConditionProps {
  condition: GuardExpression;
  onChange: (condition: GuardExpression) => void;
  onRemove: () => void;
  availableFacts: Record<string, { label: string; type: 'string' | 'boolean'; values?: unknown[]; description?: string }>;
}

type OperatorType = 'eq' | 'neq' | 'exists';

export const GuardCondition: React.FC<GuardConditionProps> = ({ condition, onChange, onRemove, availableFacts }) => {
  // Extract the actual condition (unwrap NOT if present)
  const isNegated = !!condition.not;
  const actualCondition = isNegated ? condition.not! : condition;

  // Determine current operator and values from the actual condition
  const getCurrentOperator = (): OperatorType => {
    if (actualCondition.eq) return 'eq';
    if (actualCondition.neq) return 'neq';
    if (actualCondition.exists) return 'exists';
    return 'eq'; // default
  };

  const getCurrentFactKey = (): string => {
    if (actualCondition.eq) return String(actualCondition.eq[0]);
    if (actualCondition.neq) return String(actualCondition.neq[0]);
    if (actualCondition.exists) return String(actualCondition.exists);
    return Object.keys(availableFacts)[0] || 'operation_type'; // default
  };

  const getCurrentValue = (): unknown => {
    if (actualCondition.eq) return actualCondition.eq[1];
    if (actualCondition.neq) return actualCondition.neq[1];
    return null;
  };

  const operator = getCurrentOperator();
  const factKey = getCurrentFactKey();
  const value = getCurrentValue();

  // Get fact metadata
  const factMeta = availableFacts[factKey];
  const availableValues = factMeta?.values || [];

  const handleFactKeyChange = (newFactKey: string) => {
    const newFactMeta = availableFacts[newFactKey];
    const defaultValue = newFactMeta?.values?.[0] ?? null;

    let newCondition: GuardExpression;
    if (operator === 'exists') {
      newCondition = { exists: newFactKey };
    } else if (operator === 'eq') {
      newCondition = { eq: [newFactKey, defaultValue] };
    } else if (operator === 'neq') {
      newCondition = { neq: [newFactKey, defaultValue] };
    } else {
      newCondition = { eq: [newFactKey, defaultValue] };
    }

    // Wrap with NOT if negated
    onChange(isNegated ? { not: newCondition } : newCondition);
  };

  const handleOperatorChange = (newOperator: OperatorType) => {
    let newCondition: GuardExpression;
    if (newOperator === 'exists') {
      newCondition = { exists: factKey };
    } else if (newOperator === 'eq') {
      newCondition = { eq: [factKey, value] };
    } else if (newOperator === 'neq') {
      newCondition = { neq: [factKey, value] };
    } else {
      newCondition = { eq: [factKey, value] };
    }

    // Wrap with NOT if negated
    onChange(isNegated ? { not: newCondition } : newCondition);
  };

  const handleValueChange = (newValue: unknown) => {
    let newCondition: GuardExpression;
    if (operator === 'eq') {
      newCondition = { eq: [factKey, newValue] };
    } else if (operator === 'neq') {
      newCondition = { neq: [factKey, newValue] };
    } else {
      newCondition = { eq: [factKey, newValue] };
    }

    // Wrap with NOT if negated
    onChange(isNegated ? { not: newCondition } : newCondition);
  };

  const handleToggleNegation = () => {
    if (isNegated) {
      // Remove NOT wrapper - use actualCondition
      onChange(actualCondition);
    } else {
      // Add NOT wrapper - wrap actualCondition
      onChange({ not: actualCondition });
    }
  };

  const formatValueForDisplay = (val: unknown): string => {
    if (val === null) return 'nulo';
    if (val === true) return 'verdadero';
    if (val === false) return 'falso';
    return String(val);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <div className="space-y-3">
        {/* Main condition row */}
        <div className="grid grid-cols-12 gap-3">
          {/* Fact Key */}
          <div className="col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Campo</label>
            <select
              value={factKey}
              onChange={(e) => handleFactKeyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {Object.entries(availableFacts).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div className="col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Operador</label>
            <select
              value={operator}
              onChange={(e) => handleOperatorChange(e.target.value as OperatorType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="eq">es igual a</option>
              <option value="neq">no es igual a</option>
              <option value="exists">existe</option>
            </select>
          </div>

          {/* Value (only for eq/neq) */}
          {operator !== 'exists' && (
            <div className="col-span-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor</label>
              <select
                value={String(value)}
                onChange={(e) => {
                  const val = e.target.value;
                  let parsedValue: unknown = val;
                  
                  if (val === 'null') parsedValue = null;
                  else if (val === 'true') parsedValue = true;
                  else if (val === 'false') parsedValue = false;
                  else if (factMeta?.type === 'string') parsedValue = val;
                  
                  handleValueChange(parsedValue);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {availableValues.map((val: unknown, idx: number) => (
                  <option key={idx} value={String(val)}>
                    {formatValueForDisplay(val)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Remove button */}
          <div className={`${operator !== 'exists' ? 'col-span-1' : 'col-span-5'} flex items-end`}>
            <button
              onClick={onRemove}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar condición"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Negation toggle */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isNegated}
            onChange={handleToggleNegation}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">Negar esta condición (NOT)</span>
        </label>
      </div>
    </div>
  );
};
