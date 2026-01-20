import React from 'react';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  DollarSign,
  Phone,
  Mail,
  Eye,
  MessageCircle,
  Calendar,
  Edit,
  Trash2,
  Share2
} from 'lucide-react';
import { Property } from '../../types/properties';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose
}) => {
  const formatCurrency = (amount: number, currency: string) => {
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

  const statusInfo = getStatusBadge(property.status);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
              <Edit className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Compartir">
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Eliminar">
              <Trash2 className="h-5 w-5 text-red-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="space-y-6">
            <div className="h-64 bg-gradient-to-br from-orange-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Building2 className="h-32 w-32 text-white/40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Información General</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">{getTypeLabel(property.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Operación:</span>
                      <span className="font-medium">
                        {property.operationType === 'SELL' ? 'Venta' : 'Renta'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio:</span>
                      <span className="font-bold text-lg text-gray-900">
                        {formatCurrency(property.price.amount, property.price.currency)}
                      </span>
                    </div>
                    {property.price.maintenance && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mantenimiento:</span>
                        <span className="font-medium">
                          {formatCurrency(property.price.maintenance, property.price.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{property.location.neighborhood}</div>
                        <div className="text-gray-600">
                          {property.location.district}, {property.location.city}
                        </div>
                        <div className="text-gray-600">
                          {property.location.state}, {property.location.country}
                        </div>
                        {property.location.zipCode && (
                          <div className="text-gray-600">C.P. {property.location.zipCode}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contacto</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{property.contact.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${property.contact.phone}`} className="text-orange-600 hover:underline">
                        {property.contact.phone}
                      </a>
                    </div>
                    {property.contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${property.contact.email}`} className="text-orange-600 hover:underline">
                          {property.contact.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.features.bedrooms && (
                      <div className="flex items-center gap-2 text-sm">
                        <Bed className="h-4 w-4 text-gray-400" />
                        <span>{property.features.bedrooms} Recámaras</span>
                      </div>
                    )}
                    {property.features.bathrooms && (
                      <div className="flex items-center gap-2 text-sm">
                        <Bath className="h-4 w-4 text-gray-400" />
                        <span>{property.features.bathrooms} Baños</span>
                      </div>
                    )}
                    {property.features.parkingSpots && (
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-gray-400" />
                        <span>{property.features.parkingSpots} Estacionamientos</span>
                      </div>
                    )}
                    {property.features.builtArea && (
                      <div className="flex items-center gap-2 text-sm">
                        <Maximize className="h-4 w-4 text-gray-400" />
                        <span>{property.features.builtArea}m² construidos</span>
                      </div>
                    )}
                    {property.features.totalArea && (
                      <div className="flex items-center gap-2 text-sm">
                        <Maximize className="h-4 w-4 text-gray-400" />
                        <span>{property.features.totalArea}m² totales</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    {property.features.petsAllowed && (
                      <div className="text-sm text-green-600">✓ Se permiten mascotas</div>
                    )}
                    {property.features.furnished && (
                      <div className="text-sm text-green-600">✓ Amueblado</div>
                    )}
                    {property.features.hasPool && (
                      <div className="text-sm text-green-600">✓ Alberca</div>
                    )}
                    {property.features.hasGym && (
                      <div className="text-sm text-green-600">✓ Gimnasio</div>
                    )}
                    {property.features.hasElevator && (
                      <div className="text-sm text-green-600">✓ Elevador</div>
                    )}
                    {property.features.hasGarden && (
                      <div className="text-sm text-green-600">✓ Jardín</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Estadísticas</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-xl font-bold text-blue-600">{property.views || 0}</div>
                      <div className="text-xs text-gray-600">Vistas</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <MessageCircle className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                      <div className="text-xl font-bold text-purple-600">{property.leads || 0}</div>
                      <div className="text-xs text-gray-600">Leads</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <Calendar className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                      <div className="text-xl font-bold text-orange-600">{property.appointments || 0}</div>
                      <div className="text-xs text-gray-600">Citas</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fechas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Publicada:</span>
                      <span className="font-medium">
                        {format(new Date(property.publishedDate), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actualizada:</span>
                      <span className="font-medium">
                        {format(new Date(property.lastUpdated), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {property.tags && property.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Etiquetas</h3>
                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {property.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas Internas</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">{property.notes}</p>
                </div>
              </div>
            )}
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
