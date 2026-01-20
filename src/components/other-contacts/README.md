# Módulo Other Contacts

## 📋 Descripción

El módulo **Other Contacts** gestiona y visualiza interacciones que no fueron procesadas como leads (PROPERTY_LEAD, SEARCH_LEAD, LOCATION_LEAD). Incluye consultas fuera de alcance, quejas, consultas generales y otras interacciones que no generaron oportunidades de negocio.

## 🎯 Casos de Uso

### Interacciones Incluidas
- **Out of Scope**: Consultas sobre servicios no ofrecidos
- **Complaints**: Quejas y reclamos de clientes
- **General Inquiry**: Consultas generales (horarios, información básica)
- **Otros**: Cualquier interacción no clasificada como lead

## 🏗️ Arquitectura

### Componentes

#### 1. **OtherContactsDetail.tsx** (Vista Principal)
Componente contenedor que orquesta toda la funcionalidad del módulo.

**Características:**
- Selector de período con botones rápidos (7/30/90 días)
- Filtros avanzados (canal, tiene queja)
- Estadísticas en tiempo real
- Integración con tabla y modal

**Props:** Ninguna (usa Zustand store)

**Estado Local:**
```typescript
- selectedContact: OtherContactRecord | null
- isModalOpen: boolean
- channelFilter: 'whatsapp' | 'call' | ''
- complaintFilter: boolean | ''
```

#### 2. **OtherContactsTable.tsx** (Tabla Paginada)
Tabla con paginación server-side y ordenamiento.

**Props:**
```typescript
interface OtherContactsTableProps {
  contacts: OtherContactRecord[];
  onContactSelect: (contact: OtherContactRecord) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}
```

**Columnas:**
- ID (truncado a 12 caracteres)
- Canal (badge con icono)
- Tiene Queja (badge rojo/verde)
- Comentario (truncado a 50 caracteres)
- Fecha (formato dd/MM/yyyy HH:mm)
- Acciones (botón Ver Detalle)

#### 3. **OtherContactDetailModal.tsx** (Modal de Detalle)
Modal completo con toda la información del contacto.

**Props:**
```typescript
interface OtherContactDetailModalProps {
  contact: OtherContactRecord;
  isOpen: boolean;
  onClose: () => void;
}
```

**Secciones:**
1. **Header**: ID, canal, fecha
2. **Información General**: Comentario adicional, estado de queja
3. **Conversación**: Timeline estilo chat
4. **Metadata**: Renderizado dinámico e inteligente

## 📊 Tipos de Datos

### OtherContactRecord
```typescript
interface OtherContactRecord {
  id: string;
  additional_comment: string;
  has_complaint: boolean;
  complaint: string;
  conversation: ConversationMessage[];
  metadata: Record<string, any>;
  channel: 'whatsapp' | 'call';
  created_at: string;
}
```

### ConversationMessage
```typescript
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
```

### OtherContactFilters
```typescript
interface OtherContactFilters {
  channel?: 'whatsapp' | 'call';
  has_complaint?: boolean;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}
```

## 🔌 API Integration

### Endpoint
```
GET /interaction-analytics/other-contacts
```

### Parámetros de Query
- `channel`: whatsapp | call
- `has_complaint`: boolean
- `start_date`: ISO date string
- `end_date`: ISO date string
- `page`: número de página (default: 1)
- `limit`: items por página (default: 20)
- `sort_by`: campo para ordenar (default: created_at)
- `sort_order`: ASC | DESC (default: DESC)

### Respuesta
```typescript
{
  data: OtherContactRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## 🎨 Renderizado de Metadata

El modal implementa renderizado inteligente de metadata según el tipo de campo:

### Campos Especiales

#### `phone_number`
```typescript
<Phone icon /> +5491112345678
```

#### `session_duration_seconds`
```typescript
<Clock icon /> 2m 45s
```

#### `interaction_type`
```typescript
<Badge color={type}>OUT_OF_SCOPE</Badge>
```

#### `priority`
```typescript
<Badge color={priority}>HIGH</Badge>
```

#### `escalated_to` / `referred_to`
```typescript
<User icon /> supervisor_team
```

#### `complaint_id`
```typescript
<Hash icon /> #12345
```

### Campos Genéricos
- **Objetos/Arrays**: JSON formateado con syntax highlighting
- **Strings/Numbers**: Renderizado directo
- **Null/Undefined**: "N/A"

## 📈 Estadísticas Calculadas

### En Tiempo Real
1. **Total de Contactos**: Suma total de registros
2. **Contactos con Queja**: Filtrados por `has_complaint: true`
3. **Distribución por Canal**: 
   - WhatsApp: `channel === 'whatsapp'`
   - Llamadas: `channel === 'call'`
4. **Duración Promedio**: Promedio de `metadata.session_duration_seconds`

### Porcentajes
Todos los porcentajes se calculan sobre el total correspondiente:
```typescript
percentage = (count / total) * 100
```

## 🎯 Flujo de Datos

```
User Action → Component
              ↓
         Store Action (fetchOtherContacts)
              ↓
         API Service (getOtherContacts)
              ↓
         Backend API
              ↓
         Response → Store Update
              ↓
         Component Re-render
```

## 🔧 Store Actions

### `fetchOtherContacts(filters?: OtherContactFilters)`
Carga contactos desde el API con filtros opcionales.

**Actualiza:**
- `otherContacts`: Array de registros
- `otherContactsTotal`: Total de registros
- `otherContactsPage`: Página actual
- `otherContactsLimit`: Items por página
- `otherContactsTotalPages`: Total de páginas
- `loading`: Estado de carga
- `isOnline`: Estado de conexión

### `setOtherContactsPage(page: number)`
Cambia la página actual para paginación.

## 🎨 Diseño y UX

### Colores Corporativos
- **Primary**: Gray (#6B7280)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

### Badges
- **Canal WhatsApp**: `bg-green-100 text-green-800`
- **Canal Llamada**: `bg-blue-100 text-blue-800`
- **Con Queja**: `bg-red-100 text-red-800`
- **Sin Queja**: `bg-green-100 text-green-800`

### Animaciones
- **Hover**: `transition-all duration-200`
- **Loading**: Spinner animado
- **Modal**: Fade in/out con overlay

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptaciones
- **Filtros**: Stack vertical en mobile
- **Tabla**: Scroll horizontal en mobile
- **Modal**: Full screen en mobile
- **Estadísticas**: Grid 1 columna en mobile, 4 en desktop

## 🧪 Testing Considerations

### Unit Tests
- Renderizado de componentes
- Formateo de metadata
- Cálculo de estadísticas
- Manejo de estados vacíos

### Integration Tests
- Flujo completo de filtrado
- Paginación
- Apertura/cierre de modal
- Llamadas a API

### E2E Tests
- Navegación al módulo
- Aplicación de filtros
- Visualización de detalles
- Navegación entre páginas

## 🚀 Performance

### Optimizaciones Implementadas
- **React.memo**: Componentes de tabla
- **useMemo**: Cálculos de estadísticas
- **Paginación server-side**: Reduce payload
- **Lazy loading**: Modal solo cuando se necesita

### Métricas Objetivo
- **First Paint**: < 1s
- **Time to Interactive**: < 2s
- **API Response**: < 500ms
- **Re-render**: < 100ms

## 🔒 Seguridad

### Validaciones
- **Input sanitization**: Todos los inputs de usuario
- **XSS Protection**: Renderizado seguro de metadata
- **CSRF**: Tokens en requests
- **Auth**: JWT en headers

### Datos Sensibles
- **phone_number**: Enmascarado en logs
- **complaint**: No se expone en URLs
- **metadata**: Validación de estructura

## 📝 Mantenimiento

### Agregar Nuevo Campo de Metadata
1. Agregar case en `renderMetadataValue()` en `OtherContactDetailModal.tsx`
2. Definir formato y color
3. Agregar icono si corresponde
4. Documentar en este README

### Agregar Nuevo Filtro
1. Agregar estado local en `OtherContactsDetail.tsx`
2. Agregar input en sección de filtros
3. Incluir en objeto `filters` del `useEffect`
4. Actualizar interfaz `OtherContactFilters` si es necesario

### Modificar Paginación
1. Ajustar `otherContactsLimit` en store (default: 20)
2. Actualizar lógica de navegación en `OtherContactsTable.tsx`
3. Considerar impacto en performance

## 🐛 Troubleshooting

### Problema: No se cargan contactos
**Solución:**
1. Verificar que el API esté disponible
2. Revisar filtros de fecha (deben ser válidos)
3. Comprobar permisos de usuario
4. Ver console para errores de red

### Problema: Modal no se abre
**Solución:**
1. Verificar que `selectedContact` no sea null
2. Comprobar `isModalOpen` state
3. Revisar z-index del modal

### Problema: Paginación no funciona
**Solución:**
1. Verificar que `totalPages` > 1
2. Comprobar que `onPageChange` se llama correctamente
3. Revisar que el API devuelve `totalPages`

## 📚 Referencias

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [date-fns](https://date-fns.org/)

---

**Última actualización**: 2025-10-08  
**Versión**: 1.0.0  
**Autor**: IAD Development Team
