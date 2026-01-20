export type PropertyStatus = 'ACTIVE' | 'SOLD' | 'RENTED' | 'INACTIVE';
export type PropertyType = 'HOUSE' | 'APARTMENT' | 'CONDO' | 'OFFICE' | 'LAND' | 'COMMERCIAL';
export type OperationType = 'SELL' | 'RENT';

export interface PropertyLocation {
  country: string;
  state: string;
  city: string;
  district: string;
  neighborhood: string;
  street?: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PropertyPrice {
  amount: number;
  currency: string;
  maintenance?: number;
}

export interface PropertyFeatures {
  bedrooms?: number;
  bathrooms?: number;
  parkingSpots?: number;
  builtArea?: number;
  totalArea?: number;
  floor?: number;
  totalFloors?: number;
  hasElevator?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  petsAllowed?: boolean;
  furnished?: boolean;
}

export interface PropertyContact {
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  status: PropertyStatus;
  type: PropertyType;
  operationType: OperationType;
  price: PropertyPrice;
  location: PropertyLocation;
  features: PropertyFeatures;
  contact: PropertyContact;
  images?: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  source?: string;
  externalId?: string;
  publishedDate: string;
  lastUpdated: string;
  views?: number;
  favorites?: number;
  leads?: number;
  appointments?: number;
  tags?: string[];
  notes?: string;
}

export interface PropertyFilters {
  status?: PropertyStatus | PropertyStatus[];
  type?: PropertyType | PropertyType[];
  operationType?: OperationType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
  };
  features?: {
    petsAllowed?: boolean;
    furnished?: boolean;
    hasPool?: boolean;
    hasGym?: boolean;
    hasElevator?: boolean;
  };
  searchTerm?: string;
  sortBy?: 'price' | 'publishedDate' | 'views' | 'leads' | 'lastUpdated';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface PropertyStats {
  total: number;
  active: number;
  sold: number;
  rented: number;
  inactive: number;
  totalValue: number;
  averagePrice: number;
  totalLeads: number;
  totalAppointments: number;
  conversionRate: number;
}
