---
trigger: always_on
---

# Architecture Overview – IAD Contact Center Frontend

This project follows a **Component-Based Architecture** with **Feature Modules** and **Centralized State Management**, designed for scalability and maintainability in React applications.

## Key Architectural Principles

- **Feature-based organization** with dedicated modules for each business domain
- **Centralized state management** using Zustand for predictable data flow
- **Component composition** with reusable UI components
- **Type-safe development** with comprehensive TypeScript interfaces
- **API-first approach** with dedicated service layer for external communication

---

## 1. Folder Structure

```
src/
├── components/           # Feature modules organized by business domain
│   ├── dashboard/        # Executive dashboard module
│   │   ├── DashboardExecutive.tsx    # Main dashboard component
│   │   ├── MetricCard.tsx           # Reusable metric display component
│   │   ├── ImpactBlock.tsx          # Global impact visualization
│   │   └── ComparisonTable.tsx      # Economic comparison table
│   │
│   ├── calls/            # Call detail management module
│   │   ├── CallsDetail.tsx          # Main calls listing component
│   │   ├── CallsTable.tsx           # Paginated table with filters
│   │   └── CallDetailModal.tsx      # Individual call detail modal
│   │
│   ├── conversion/       # Conversion analysis module
│   │   ├── ConversionAnalysis.tsx   # Main conversion analysis component
│   │   ├── ConversionFunnel.tsx     # Visual funnel representation
│   │   ├── ConversionFilters.tsx    # Advanced filtering system
│   │   └── ConversionComparison.tsx # SELL vs RENT comparison
│   │
│   ├── search/           # Search lead analysis module
│   │   ├── SearchAnalysis.tsx       # Main search analysis component
│   │   ├── SearchMetrics.tsx        # Search-specific metrics
│   │   ├── SearchFilters.tsx        # Search filtering system
│   │   └── SearchDistribution.tsx   # Geographic and preference distributions
│   │
│   ├── appointments/     # Appointment management module
│   │   ├── AppointmentsModule.tsx   # Main appointments component
│   │   ├── AppointmentCalendar.tsx  # Interactive calendar view
│   │   ├── AppointmentList.tsx      # Appointment listing
│   │   ├── AppointmentMetrics.tsx   # Appointment-specific metrics
│   │   └── AppointmentFilters.tsx   # Appointment filtering system
│   │
│   ├── quality/          # Quality analysis module
│   │   ├── QualityModule.tsx        # Main quality analysis component
│   │   ├── QualityMetrics.tsx       # Quality KPIs and metrics
│   │   ├── CSATDistribution.tsx     # CSAT satisfaction analysis
│   │   ├── ComplaintAnalysis.tsx    # Complaint tracking and analysis
│   │   ├── HumanEscalation.tsx      # Human escalation analysis
│   │   └── QualityFilters.tsx       # Quality filtering system
│   │
│   └── Layout.tsx        # Main application layout with navigation
│
├── stores/               # Centralized state management
│   └── useCallStore.ts   # Main Zustand store for call data and app state
│
├── services/             # External API communication layer
│   └── api.ts            # API client with authentication and endpoints
│
├── types/                # TypeScript type definitions
│   └── index.ts          # Core interfaces (CallRecord, DashboardMetrics, etc.)
│
├── data/                 # Data utilities and mock data
│   └── mockData.ts       # Mock data generation for development/testing
│
├── utils/                # Utility functions and helpers
│   └── (future utilities)
│
├── App.tsx               # Main application component with routing logic
├── main.tsx              # Application entry point
└── index.css             # Global styles with Tailwind CSS
```

### Quick Conventions

| Folder | Pattern | Purpose |
|--------|---------|---------|
| `components/` | Feature Modules | Business domain components with complete functionality |
| `stores/` | Zustand Stores | Centralized state management with computed properties |
| `services/` | API Client Pattern | HTTP communication layer with authentication |
| `types/` | TypeScript Interfaces | Type definitions shared across the application |

**Rule:** Components import types and use stores; API calls are handled through the service layer.

---

## 2. Technology Stack

- **React 18** + **TypeScript** → Component-based UI with type safety
- **Tailwind CSS** → Utility-first styling with responsive design
- **Zustand** → Lightweight state management with computed properties
- **Lucide React** → Consistent icon system
- **date-fns** → Date manipulation and formatting
- **Axios** → HTTP client for API communication
- **Vite** → Fast development and build tooling

---

## 3. Data Flow Architecture

```mermaid
flowchart TD
    API[Call Analytics API] -->|JWT Auth| Service[API Service Layer]
    Service -->|CallRecord[]| Store[Zustand Store]
    Store -->|Computed Metrics| Components[React Components]
    Components -->|User Actions| Store
    Store -->|API Calls| Service
    
    subgraph "Frontend Layers"
        Components
        Store
        Service
    end
    
    subgraph "External"
        API
    end
```

**Flow Description:**
1. **API Service** handles authentication and HTTP communication
2. **Zustand Store** manages application state and computed metrics
3. **React Components** consume store data and trigger actions
4. **User interactions** flow back through store to API calls

---

## 4. Module Organization

### Dashboard Module (`components/dashboard/`)
- **Purpose:** Executive-level KPIs and global metrics
- **Key Components:** `DashboardExecutive`, `MetricCard`, `ImpactBlock`
- **Data Sources:** `/call-analytics/metrics`, `/call-analytics/global-impact`

### Calls Module (`components/calls/`)
- **Purpose:** Individual call record exploration and filtering
- **Key Components:** `CallsDetail`, `CallsTable`, `CallDetailModal`
- **Data Sources:** `/call-analytics/calls` with pagination and filters

### Conversion Module (`components/conversion/`)
- **Purpose:** PROPERTY_LEAD conversion funnel analysis
- **Key Components:** `ConversionAnalysis`, `ConversionFunnel`, `ConversionComparison`
- **Data Sources:** Filtered `/call-analytics/calls` (lead_type=PROPERTY_LEAD)

### Search Module (`components/search/`)
- **Purpose:** SEARCH_LEAD geographic and preference analysis
- **Key Components:** `SearchAnalysis`, `SearchMetrics`, `SearchDistribution`
- **Data Sources:** Filtered `/call-analytics/calls` (lead_type=SEARCH_LEAD)

### Appointments Module (`components/appointments/`)
- **Purpose:** Scheduled appointment tracking and calendar view
- **Key Components:** `AppointmentsModule`, `AppointmentCalendar`, `AppointmentList`
- **Data Sources:** Filtered `/call-analytics/calls` (appointment.type != NOT_SCHEDULED)

### Quality Module (`components/quality/`)
- **Purpose:** CSAT, complaints, and human escalation analysis
- **Key Components:** `QualityModule`, `CSATDistribution`, `ComplaintAnalysis`
- **Data Sources:** `/call-analytics/calls` with quality-focused filtering

---


## 5. Performance Considerations

### Client-Side Optimizations
- **React.memo** for expensive components
- **useMemo** for computed values and filtered data
- **Lazy loading** for module components
- **Virtual scrolling** for large data tables

### API Optimizations
- **Server-side pagination** to reduce payload size
- **Server-side filtering** to minimize client processing
- **Response caching** for frequently accessed metrics
- **Debounced search** to reduce API calls

---

## 6. Development Workflow

### New Feature Checklist
1. **Define Types:** Add interfaces to `src/types/index.ts`
2. **Create Service Methods:** Add API calls to `src/services/api.ts`
3. **Update Store:** Add actions and computed properties to `useCallStore`
4. **Build Components:** Create feature module in `src/components/<module>/`
5. **Add Navigation:** Update `Layout.tsx` with new module
6. **Update Routing:** Add module case to `App.tsx`

### Component Development Pattern
1. **Container Component:** Data fetching and business logic
2. **Presentation Components:** Pure UI components
3. **Filter Components:** User input and filter management
4. **Modal/Detail Components:** Detailed views and interactions

---
