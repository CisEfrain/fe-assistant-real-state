import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Grid3x3,
  List,
  TrendingUp,
  Eye,
  Heart,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Property, PropertyFilters, PropertyStatus } from '../../types/properties';
import { PropertyCard } from './PropertyCard';
import { PropertyList } from './PropertyList';
import { PropertyFiltersPanel } from './PropertyFiltersPanel';
import { PropertyStats } from './PropertyStats';
import { PropertyDetailModal } from './PropertyDetailModal';

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Hermosa Casa en Polanco',
    description: 'Hermosa casa con acabados de lujo en una de las mejores zonas de la CDMX. Cuenta con amplios espacios, jardín y estacionamiento.',
    status: 'ACTIVE',
    type: 'HOUSE',
    operationType: 'SELL',
    price: {
      amount: 12500000,
      currency: 'MXN'
    },
    location: {
      country: 'México',
      state: 'CDMX',
      city: 'Ciudad de México',
      district: 'Miguel Hidalgo',
      neighborhood: 'Polanco',
      zipCode: '11560'
    },
    features: {
      bedrooms: 4,
      bathrooms: 3,
      parkingSpots: 2,
      builtArea: 350,
      totalArea: 450,
      hasGarden: true,
      petsAllowed: true
    },
    contact: {
      name: 'Carlos García',
      phone: '+52 55 1234 5678',
      email: 'carlos@inmobiliaria.com'
    },
    publishedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    views: 245,
    leads: 12,
    appointments: 5,
    tags: ['Destacada', 'Lujo']
  },
  {
    id: '2',
    title: 'Departamento Moderno en Santa Fe',
    description: 'Departamento con vista panorámica, amenidades de primer nivel y excelente ubicación cerca de corporativos.',
    status: 'ACTIVE',
    type: 'APARTMENT',
    operationType: 'RENT',
    price: {
      amount: 25000,
      currency: 'MXN',
      maintenance: 3500
    },
    location: {
      country: 'México',
      state: 'CDMX',
      city: 'Ciudad de México',
      district: 'Álvaro Obregón',
      neighborhood: 'Santa Fe',
      zipCode: '01376'
    },
    features: {
      bedrooms: 2,
      bathrooms: 2,
      parkingSpots: 2,
      builtArea: 120,
      floor: 15,
      totalFloors: 20,
      hasElevator: true,
      hasGym: true,
      hasPool: true,
      furnished: true
    },
    contact: {
      name: 'María López',
      phone: '+52 55 9876 5432',
      email: 'maria@inmobiliaria.com'
    },
    publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    views: 189,
    leads: 18,
    appointments: 8,
    tags: ['Amueblado', 'Amenidades']
  }
];

export const PropertiesModule: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>({
    status: 'ACTIVE',
    sortBy: 'publishedDate',
    sortOrder: 'DESC'
  });

  const filteredProperties = useMemo(() => {
    let filtered = [...mockProperties];

    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      filtered = filtered.filter(p => statusArray.includes(p.status));
    }

    if (filters.type) {
      const typeArray = Array.isArray(filters.type) ? filters.type : [filters.type];
      filtered = filtered.filter(p => typeArray.includes(p.type));
    }

    if (filters.operationType) {
      filtered = filtered.filter(p => p.operationType === filters.operationType);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price.amount >= filters.minPrice!);
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price.amount <= filters.maxPrice!);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.location.neighborhood.toLowerCase().includes(term)
      );
    }

    if (filters.sortBy && filters.sortOrder) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sortBy) {
          case 'price':
            aValue = a.price.amount;
            bValue = b.price.amount;
            break;
          case 'publishedDate':
            aValue = new Date(a.publishedDate).getTime();
            bValue = new Date(b.publishedDate).getTime();
            break;
          case 'views':
            aValue = a.views || 0;
            bValue = b.views || 0;
            break;
          case 'leads':
            aValue = a.leads || 0;
            bValue = b.leads || 0;
            break;
          case 'lastUpdated':
            aValue = new Date(a.lastUpdated).getTime();
            bValue = new Date(b.lastUpdated).getTime();
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'ASC') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [mockProperties, filters]);

  const stats = useMemo(() => {
    const active = mockProperties.filter(p => p.status === 'ACTIVE').length;
    const sold = mockProperties.filter(p => p.status === 'SOLD').length;
    const rented = mockProperties.filter(p => p.status === 'RENTED').length;
    const inactive = mockProperties.filter(p => p.status === 'INACTIVE').length;

    const totalValue = mockProperties
      .filter(p => p.status === 'ACTIVE')
      .reduce((sum, p) => sum + p.price.amount, 0);

    const totalLeads = mockProperties.reduce((sum, p) => sum + (p.leads || 0), 0);
    const totalAppointments = mockProperties.reduce((sum, p) => sum + (p.appointments || 0), 0);

    return {
      total: mockProperties.length,
      active,
      sold,
      rented,
      inactive,
      totalValue,
      averagePrice: totalValue / (active || 1),
      totalLeads,
      totalAppointments,
      conversionRate: totalLeads > 0 ? (totalAppointments / totalLeads) * 100 : 0
    };
  }, [mockProperties]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-orange-500" />
            Propiedades
          </h1>
          <p className="text-gray-600 mt-1">Gestiona tu inventario de propiedades</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg">
          <Plus className="h-5 w-5" />
          Nueva Propiedad
        </button>
      </div>

      <PropertyStats stats={stats} />

      <PropertyFiltersPanel filters={filters} onFiltersChange={setFilters} />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredProperties.length} Propiedades
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay propiedades
            </h3>
            <p className="text-gray-500">
              Ajusta los filtros o agrega una nueva propiedad
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => setSelectedProperty(property)}
              />
            ))}
          </div>
        ) : (
          <PropertyList
            properties={filteredProperties}
            onPropertyClick={setSelectedProperty}
          />
        )}
      </div>

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};
