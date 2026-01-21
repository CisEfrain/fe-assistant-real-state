import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'orange' | 'purple' | 'green' | 'blue' | 'red' | 'yellow';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  tooltip?: string;
}

const colorVariants = {
  orange: 'from-orange-500 to-orange-600',
  purple: 'from-purple-500 to-purple-600', 
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-500 to-yellow-600',
};

const sizeVariants = {
  small: 'p-4',
  medium: 'p-6',
  large: 'p-8',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'orange',
  size = 'medium',
  animated = true,
  tooltip
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300',
        animated && 'hover:shadow-xl hover:scale-105 hover:-translate-y-1',
        sizeVariants[size]
      )}
      title={tooltip}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={clsx(
              'p-3 rounded-lg bg-gradient-to-r',
              colorVariants[color]
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 leading-tight">{title}</h3>
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};