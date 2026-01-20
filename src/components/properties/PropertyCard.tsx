import React from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Eye,
  MessageCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Property } from '../../types/properties';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
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

  const getTypeLabel = (type: string) => {
    const labels = {
      HOUSE: 'Casa',
      APARTMENT: 'Departamento',
      CONDO: 'Condominio',
      OFFICE: 'Oficina',
      LAND: 'Terreno',
      COMMERCIAL: 'Comercial'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency === 'MXN' ? 'MXN' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statusInfo = getStatusBadge(property.status);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-purple-100">
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {property.operationType === 'SELL' ? 'Venta' : 'Renta'}
          </span>
        </div>
        {property.tags && property.tags.length > 0 && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-medium">
              {property.tags[0]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="h-20 w-20 text-white/30" />
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location.neighborhood}, {property.location.district}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          {property.features.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.features.bedrooms}</span>
            </div>
          )}
          {property.features.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.features.bathrooms}</span>
            </div>
          )}
          {property.features.parkingSpots && (
            <div className="flex items-center gap-1">
              <Car className="h-4 w-4" />
              <span>{property.features.parkingSpots}</span>
            </div>
          )}
          {property.features.builtArea && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4" />
              <span>{property.features.builtArea}m²</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(property.price.amount, property.price.currency)}
            </div>
            {property.price.maintenance && (
              <div className="text-xs text-gray-500">
                + {formatPrice(property.price.maintenance, property.price.currency)} mant.
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded">
              {getTypeLabel(property.type)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
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
          </div>
          <div className="text-xs">
            {format(new Date(property.lastUpdated), 'dd MMM', { locale: es })}
          </div>
        </div>
      </div>
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
