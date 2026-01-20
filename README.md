# IAD Contact Center - Plataforma de Monitoreo IA

## 🎯 Descripción del Producto

**IAD Contact Center** es una plataforma integral de monitoreo y análisis para el agente de inteligencia artificial "Santi", diseñada para supervisar y optimizar el rendimiento en la atención de interacciones entrantes a través de **WhatsApp** y **llamadas telefónicas**.

La plataforma proporciona insights detallados sobre conversión, calidad conversacional, satisfacción del cliente y eficiencia operativa, permitiendo a los equipos directivos tomar decisiones basadas en datos para mejorar continuamente el servicio automatizado.

## 🚀 Demo en Vivo

**URL de la aplicación:** https://imaginative-crepe-5235f0.netlify.app

## 📋 Funcionalidades Principales

### 1. 📊 Dashboard Ejecutivo
- **Métricas globales** de rendimiento del agente IA
- **Comparación multi-canal** (WhatsApp vs Llamadas)
- **Impacto económico** con valor total de propiedades gestionadas
- **Indicadores clave** de satisfacción y escalamiento
- **Bloque de impacto global** con métricas de valor estratégico

### 2. 📱 Detalle de Interacciones
- **Tabla completa** con 5,000+ registros de interacciones
- **Filtros avanzados** por canal, tipo de lead, operación, cita, etc.
- **Búsqueda inteligente** por ID o fuente
- **Paginación profesional** con navegación intuitiva
- **Modal detallado** con información completa de cada interacción
- **Estadísticas en tiempo real** por categorías

### 3. 📈 Análisis de Conversión
- **Funnel de conversión** completo para PROPERTY_LEAD con 5 etapas
- **Análisis dual** por número de leads y valor económico
- **Filtros avanzados** por operación, tipo de propiedad, precio, urgencia
- **Comparación detallada** SELL vs RENT con insights automáticos
- **Visualización de tasas** de conversión y captura de valor

### 4. 🔍 Análisis de Leads de Búsqueda
- **Métricas geográficas** con distribución por estados y municipios
- **Análisis de preferencias** de comunicación (WhatsApp vs Teléfono)
- **Distribución de interés** (HOT, MODERATE, UNLIKELY)
- **Filtros específicos** por ubicación, tipo de propiedad y calificación
- **Insights automáticos** con tendencias principales

### 5. 📅 Gestión de Citas Agendadas
- **Calendario interactivo** con navegación mensual
- **Visualización de citas** por fecha con tipos diferenciados
- **Métricas de conversión** y tiempo promedio hasta agendamiento
- **Lista detallada** de citas con información completa
- **Filtros por urgencia** y tipo de cita

### 6. ⭐ Calidad Conversacional
- **Análisis de satisfacción** con distribución CSAT y visualización de estrellas
- **Gestión de reclamos** con motivos principales y seguimiento
- **Análisis de escalamiento** humano con métricas de efectividad
- **Cobertura de encuestas** y análisis de usuarios sin CSAT
- **Insights y recomendaciones** de mejora automáticas

### 7. 💬 Otros Contactos
- **Interacciones no procesadas como leads** (consultas fuera de alcance, quejas, consultas generales)
- **Filtros avanzados** por canal (WhatsApp/Llamada) y estado de queja
- **Visualización completa de conversaciones** en timeline estilo chat
- **Metadata flexible** con renderizado inteligente según tipo de dato
- **Estadísticas en tiempo real** de distribución y duración promedio
- **Gestión de quejas** con seguimiento y escalamiento

## 🎨 Características Técnicas

### Stack Tecnológico
- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS con sistema de diseño corporativo
- **State Management:** Zustand
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Deployment:** Netlify

### Arquitectura
- **Componentes modulares** organizados por funcionalidad
- **Store centralizado** con Zustand para gestión de estado
- **Datos simulados** con 5,000 registros representativos
- **Diseño responsive** con breakpoints optimizados
- **Animaciones y micro-interacciones** para mejor UX

### Sistema de Diseño
- **Colores corporativos:** Orange (#FFA500) y Purple (#6952FA)
- **Gradientes específicos** por tipo de operación y canal
- **Iconografía consistente** con Lucide React
- **Tipografía optimizada** con jerarquía clara
- **Espaciado sistemático** basado en múltiplos de 8px

## 📊 Modelo de Datos

### InteractionRecord (Estructura Principal)
```typescript
interface InteractionRecord {
  phonecall_id: number;
  source: string;
  channel: 'whatsapp' | 'call';                    // 🆕 Multi-canal
  lead_type: 'PROPERTY_LEAD' | 'SEARCH_LEAD' | 'LOCATION_LEAD';
  operation_type: 'SELL' | 'RENT';
  broker_status: string;
  original_property?: PropertyInfo;
  appointment?: AppointmentInfo;
  evaluation?: EvaluationInfo;
  search?: SearchInfo;
  quality: QualityInfo;
  show_csat: boolean;
  created_at: string;
}
```

### Tipos de Lead Soportados
1. **PROPERTY_LEAD:** Consultas sobre propiedades específicas
2. **SEARCH_LEAD:** Búsquedas de propiedades con criterios
3. **LOCATION_LEAD:** Leads basados en ubicación (BIN)

### Canales de Comunicación
- **whatsapp:** Interacciones vía WhatsApp Business
- **call:** Llamadas telefónicas tradicionales

## 🎯 Casos de Uso Principales

### Para Directivos y Gerentes
- **Monitoreo en tiempo real** del rendimiento del agente IA
- **Análisis de ROI** con valor económico capturado
- **Identificación de oportunidades** de mejora
- **Comparación de efectividad** entre canales

### Para Equipos de Operaciones
- **Seguimiento detallado** de cada interacción
- **Gestión de escalamientos** y reclamos
- **Optimización de procesos** de conversión
- **Análisis de calidad** conversacional

### Para Equipos de Producto
- **Insights de comportamiento** del usuario
- **Análisis de preferencias** de comunicación
- **Identificación de patrones** de búsqueda
- **Métricas de satisfacción** y mejora continua

## 📈 Métricas Clave (KPIs)

### Conversión
- **Tasa de conversión global:** % de interacciones que generan cita
- **Valor capturado:** $ total de propiedades con cita vs total consultado
- **Conversión por canal:** Comparativa WhatsApp vs Llamadas

### Calidad
- **CSAT positivo:** % de satisfacción cuando show_csat = true
- **Tasa de reclamos:** % de interacciones con complaint
- **Escalamiento humano:** % que requiere intervención humana

### Eficiencia
- **Cobertura 24/7:** % de leads atendidos fuera de horario humano
- **Tiempo de respuesta:** Métricas de velocidad de atención
- **Automatización:** % de interacciones resueltas sin intervención

## 🔧 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [repository-url]

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting del código

## 🌟 Características Destacadas

### Diseño UX/UI
- **Interfaz intuitiva** con navegación lateral
- **Visualizaciones interactivas** con hover states
- **Responsive design** optimizado para todos los dispositivos
- **Animaciones fluidas** que mejoran la experiencia

### Rendimiento
- **Carga rápida** con Vite y optimizaciones
- **Paginación eficiente** para grandes volúmenes de datos
- **Filtrado en tiempo real** sin latencia
- **Caching inteligente** de cálculos complejos

### Escalabilidad
- **Arquitectura modular** fácil de extender
- **Componentes reutilizables** bien documentados
- **Estado centralizado** con Zustand
- **Preparado para APIs reales** con capa de servicios

## 🔮 Roadmap Futuro

### Próximas Funcionalidades
- **Integración con APIs reales** de IAD
- **Exportación de reportes** en PDF/Excel
- **Alertas y notificaciones** en tiempo real
- **Dashboard personalizable** por usuario
- **Análisis predictivo** con ML
- **Integración con CRM** existente

### Mejoras Técnicas
- **Tests automatizados** con Jest/Cypress
- **Storybook** para componentes
- **PWA** para uso offline
- **WebSockets** para datos en tiempo real

## 👥 Equipo y Contacto

**Desarrollado para IAD** - Plataforma de monitoreo del agente IA "Santi"

### Soporte Técnico
- **Documentación:** Ver `ARCHITECTURE.md` para detalles técnicos
- **Issues:** Reportar problemas en el repositorio
- **Actualizaciones:** Seguir el changelog para nuevas versiones

---

## 📄 Licencia

Este proyecto es propiedad de IAD y está destinado para uso interno de la organización.

**© 2024 IAD - Todos los derechos reservados**