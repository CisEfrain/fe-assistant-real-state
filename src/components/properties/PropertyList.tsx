import React from 'react';
import { MapPin, Bed, Bath, Car, Maximize, Eye, MessageCircle, Calendar } from 'lucide-react';
import { Property } from '../../types/properties';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PropertyListProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({ properties, onPropertyClick }) => {
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency === 'MXN' ? 'MXN' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      SOLD: 'bg-red-100 text-red-800',
      RENTED: 'bg-blue-100 text-blue-800',
      INACTIVE: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      ACTIVE: 'Activa',
      SOLD: 'Vendida',
      RENTED: 'Rentada',
      INACTIVE: 'Inactiva'
    };
    return { badge: badges[status as keyof typeof badges] || badges.ACTIVE, label: labels[status as keyof typeof labels] || status };
  };

  return (
    <div className="space-y-4">
      {properties.map(property => {
        const statusInfo = getStatusBadge(property.status);
        return (
          <div
            key={property.id}
            onClick={() => onPropertyClick(property)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-purple-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-white/40" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {property.location.neighborhood}, {property.location.district}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.badge}`}>
                      {statusInfo.label}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium whitespace-nowrap">
                      {property.operationType === 'SELL' ? 'Venta' : 'Renta'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {property.description}
                </p>

                <div className="flex items-center gap-6 mb-3 text-sm text-gray-600">
                  {property.features.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{property.features.bedrooms} rec</span>
                    </div>
                  )}
                  {property.features.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{property.features.bathrooms} baños</span>
                    </div>
                  )}
                  {property.features.parkingSpots && (
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      <span>{property.features.parkingSpots} est</span>
                    </div>
                  )}
                  {property.features.builtArea && (
                    <div className="flex items-center gap-1">
                      <Maximize className="h-4 w-4" />
                      <span>{property.features.builtArea}m²</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(property.price.amount, property.price.currency)}
                    {property.price.maintenance && (
                      <span className="text-sm text-gray-500 font-normal ml-2">
                        + {formatPrice(property.price.maintenance, property.price.currency)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1" title="Vistas">
                      <Eye className="h-4 w-4" />
                      <span>{property.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Leads">
                      <MessageCircle className="h-4 w-4" />
                      <span>{property.leads || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Citas">
                      <Calendar className="h-4 w-4" />
                      <span>{property.appointments || 0}</span>
                    </div>
                    <div className="text-xs">
                      {format(new Date(property.lastUpdated), 'dd MMM yy', { locale: es })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function Building2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
