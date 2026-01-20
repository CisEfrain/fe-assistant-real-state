# Módulo de Gestión de Asistentes Conversacionales

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Funcionalidades Principales](#funcionalidades-principales)
3. [Templates de Agentes](#templates-de-agentes)
4. [Sistema de Tareas](#sistema-de-tareas)
5. [Sistema de Prioridades](#sistema-de-prioridades)
6. [Base de Conocimiento](#base-de-conocimiento)
7. [Simulador de Conversación](#simulador-de-conversación)
8. [Flujo Visual](#flujo-visual)
9. [Configuración Avanzada](#configuración-avanzada)
10. [Modelo de Datos](#modelo-de-datos)
11. [Arquitectura Técnica](#arquitectura-técnica)

---

## 🎯 Descripción General

El **Módulo de Gestión de Asistentes Conversacionales** es una plataforma completa para configurar, administrar y probar agentes de inteligencia artificial especializados en el sector inmobiliario. Permite a usuarios finales crear asistentes personalizados sin conocimientos técnicos profundos, utilizando templates predefinidos y un sistema de configuración intuitivo.

### Características Principales
- **Templates Especializados:** 6 tipos de agentes predefinidos listos para usar
- **Sistema de Tareas:** 11 tipos de funciones configurables para diferentes propósitos
- **Sistema de Prioridades:** Gestión inteligente basada en metas y dependencias
- **Base de Conocimiento:** Artículos organizados por categorías para respuestas precisas
- **Simulador Integrado:** Pruebas en tiempo real del comportamiento del agente
- **Configuración Multi-Canal:** Soporte para WhatsApp y llamadas telefónicas
- **Editor Dual:** Modo básico para usuarios finales y modo avanzado para desarrolladores

---

## 🚀 Funcionalidades Principales

### 1. **Gestión de Agentes**
La plataforma permite crear, configurar y administrar múltiples agentes conversacionales. Cada agente puede especializarse en diferentes aspectos del negocio inmobiliario y configurarse para operar en WhatsApp o llamadas telefónicas.

**Funcionalidades incluidas:**
- Creación desde templates especializados
- Configuración de personalidad y tono conversacional
- Gestión de estado (Borrador, Activo, Obsoleto)
- Control de habilitación y conexión
- Analytics de IAD (opcional)
- Duplicación de agentes existentes

### 2. **Sistema de Configuración por Pestañas**
El editor de agentes está organizado en 5 pestañas principales que cubren todos los aspectos de configuración:

- **Configuración General:** Información básica, estado y personalidad
- **Tareas:** Gestión de funciones específicas del agente
- **Flujo de Comportamiento:** Visualización de prioridades y dependencias
- **Probar Agente:** Simulador de conversación en tiempo real
- **Configuración Avanzada:** Editor JSON y configuración técnica

### 3. **Gestión de Estado y Conexión**
Cada agente tiene múltiples estados que controlan su funcionamiento:

- **Estado del Agente:** Borrador (desarrollo), Activo (producción), Obsoleto (descontinuado)
- **Habilitado/Deshabilitado:** Control de activación del agente
- **Estado de Conexión:** Conectado/Desconectado al canal de comunicación
- **Analytics de IAD:** Habilitación de métricas y análisis avanzados

---

## 🎨 Templates de Agentes

### **Santi - Asistente Virtual IAD**
**Especialización:** Atención telefónica inmobiliaria completa
- **Canal:** Llamadas telefónicas
- **Funciones:** Captura de contacto, validación de propiedades por ID, búsqueda genérica, agendamiento, encuesta CSAT
- **Configuración:** Modelo gpt-4o-mini, creatividad 0.3, respuestas hasta 1000 tokens
- **Prioridades:** 5 prioridades configuradas con flujo completo de atención

### **Agente de Soporte al Cliente**
**Especialización:** Resolución de dudas y gestión de reclamos
- **Canal:** WhatsApp
- **Funciones:** Gestión de reclamos, FAQ de soporte, transferencia a humanos
- **Configuración:** Modelo gpt-4o-mini, creatividad 0.2, sesiones de 2 horas
- **Prioridades:** Reclamos con máxima prioridad, consultas generales secundarias

### **Asesor de Propiedades**
**Especialización:** Consultas específicas y asesoría inmobiliaria
- **Canal:** Llamadas telefónicas
- **Funciones:** Análisis de propiedades, consulta de mercado
- **Configuración:** Modelo gpt-4o-mini, creatividad 0.2, respuestas técnicas
- **Prioridades:** Análisis de propiedades y información de mercado

### **Coordinador de Citas**
**Especialización:** Gestión y coordinación de agenda
- **Canal:** WhatsApp
- **Funciones:** Gestión de agenda, recordatorios de citas
- **Configuración:** Modelo gpt-4o-mini, creatividad 0.2, sesiones de 45 minutos
- **Prioridades:** Coordinación de agenda y gestión de citas existentes

### **Gestor de Reclamos**
**Especialización:** Manejo empático de quejas y problemas
- **Canal:** Llamadas telefónicas
- **Funciones:** Recepción de reclamos, ofrecimiento de soluciones
- **Configuración:** Modelo gpt-4o-mini, creatividad 0.2, sesiones extendidas de 3 horas
- **Prioridades:** Gestión de reclamos con máxima prioridad

### **Asistente de Preguntas Frecuentes**
**Especialización:** Respuestas rápidas a consultas comunes
- **Canal:** WhatsApp
- **Funciones:** Respuestas FAQ optimizadas
- **Configuración:** Modelo gpt-4o-mini, creatividad 0.2, sesiones cortas de 30 minutos
- **Prioridades:** Respuesta a FAQ como prioridad principal

---

## ⚙️ Sistema de Tareas

### **Concepto y Funcionamiento**
Las tareas son las funciones específicas que el agente puede ejecutar. Cada tarea tiene su propia configuración de comportamiento, parámetros de IA y puede conectarse a APIs externas para obtener datos dinámicos.

### **Tipos de Tareas Disponibles**

| Tipo | Nombre | Propósito |
|------|--------|-----------|
| `CAPTURE_CONTACT_DATA` | Capturar Datos de Contacto | Recopila nombre, email y teléfono del cliente |
| `SEARCH_SINGLE_PROPERTY` | Búsqueda de Propiedad Específica | Consulta información de una propiedad por ID |
| `PROPERTY_SEARCH` | Búsqueda de Propiedades | Busca propiedades según criterios del cliente |
| `SCHEDULE_APPOINTMENT` | Agendar Cita | Programa citas y visitas con clientes |
| `CSAT_SURVEY` | Encuesta CSAT | Mide satisfacción del cliente |
| `classifier` | Detector de Intención | Identifica la intención cuando no es clara |
| `COMPLAINT` | Gestión de Reclamos | Maneja reclamos de manera empática |
| `FAQ` | Preguntas Frecuentes | Responde consultas comunes |
| `MODERATION` | Moderación | Filtra contenido inapropiado |
| `CUSTOM` | Personalizada | Función personalizada para casos específicos |

### **Configuración de Tareas**
Cada tarea puede configurarse en dos modos:

**Modo Básico (Usuario Final):**
- Instrucciones de comportamiento en lenguaje natural
- Configuración de creatividad (preciso a creativo)
- Longitud de respuestas (cortas a muy largas)
- Configuración de búsqueda inteligente (para tareas RAG)
- Conexión a APIs externas con autenticación

**Modo Avanzado (Desarrollador):**
- Editor JSON completo de la configuración
- Parámetros técnicos del modelo de IA
- Configuración detallada de APIs
- Metadatos y configuración de sistema

### **Gestión de Tareas**
- **Habilitación/Deshabilitación:** Control individual de cada tarea
- **Priorización:** Orden de ejecución cuando múltiples tareas aplican
- **Duplicación:** Crear copias de tareas existentes para variaciones
- **Eliminación:** Remover tareas no necesarias
- **Filtrado:** Visualizar por tipo o estado de habilitación

---

## 🧠 Sistema de Prioridades

### **Concepto Fundamental**
Las prioridades son las metas principales del asistente. Funcionan como un "cerebro" que evalúa qué debe hacer el agente basándose en lo que dice el usuario y qué información necesita para completar cada meta.

### **Componentes de una Prioridad**

| Campo | Descripción |
|-------|-------------|
| **Nombre** | Identificador amigable de la prioridad |
| **Descripción** | Explicación detallada del propósito |
| **Peso** | Importancia relativa (1-100), mayor peso = mayor prioridad |
| **Frases Clave** | Palabras o frases que activan esta prioridad |
| **Datos Necesarios** | Información requerida para completar la prioridad |
| **Dependencias** | Otras prioridades que deben completarse primero |
| **Criterios de Finalización** | Condiciones para considerar la prioridad completada |
| **Tarea Vinculada** | Función específica que se ejecuta (opcional) |
| **Estado** | Habilitada/Deshabilitada |

### **Flujo de Evaluación**
1. **Usuario envía mensaje** → El sistema evalúa todas las prioridades activas
2. **Activación por frases clave** → Se identifican prioridades que coinciden
3. **Evaluación de dependencias** → Se verifican prioridades prerequisito
4. **Verificación de datos** → Se revisa si se tiene la información necesaria
5. **Ejecución de tarea** → Se ejecuta la función vinculada si existe
6. **Verificación de finalización** → Se evalúan los criterios de completitud

### **Comportamiento por Defecto**
Cuando ninguna prioridad específica se activa o el agente no entiende al usuario, se ejecuta el comportamiento por defecto configurado en el agente.

### **Gestión de Prioridades**
- **Creación:** Nuevas prioridades con configuración completa
- **Edición:** Modificación de todos los parámetros
- **Duplicación:** Crear copias para variaciones
- **Eliminación:** Remover prioridades no necesarias
- **Reordenamiento:** Cambiar orden de evaluación

---

## 📚 Base de Conocimiento

### **Propósito y Funcionamiento**
La base de conocimiento almacena información que el asistente utiliza para responder consultas específicas. Funciona como un manual de referencia organizado por categorías y etiquetas.

### **Categorías Disponibles**

| Categoría | Propósito |
|-----------|-----------|
| **Propiedades** | Información sobre tipos de propiedades, características, precios |
| **Servicios** | Descripción de servicios ofrecidos por la empresa |
| **Políticas** | Políticas internas, términos y condiciones |
| **Procedimientos** | Procesos paso a paso para diferentes situaciones |
| **Preguntas Frecuentes** | Respuestas a consultas comunes |
| **Información Legal** | Aspectos legales y regulatorios |
| **Precios y Tarifas** | Información de costos y tarifas |
| **Ubicaciones** | Información geográfica y de zonas |

### **Gestión de Artículos**
- **Creación:** Nuevos artículos con título, contenido y categorización
- **Edición:** Modificación de contenido, categoría y etiquetas
- **Organización:** Sistema de etiquetas para búsqueda rápida
- **Relevancia:** Puntuación de importancia (0-1) para priorizar resultados
- **Búsqueda:** Filtrado por categoría y búsqueda de texto
- **Eliminación:** Remover artículos obsoletos

---

## 🧪 Simulador de Conversación

### **Funcionalidad Principal**
El simulador permite probar el comportamiento del agente en tiempo real mediante conversaciones reales con el agente configurado, ejecutando las prioridades y tareas definidas.

### **Características del Simulador**
- **Sesiones Independientes:** Cada prueba es una sesión separada con historial propio
- **Respuestas Reales:** El agente procesa mensajes usando su configuración actual
- **Análisis de Respuestas:** Detalles internos de procesamiento para cada respuesta
- **Métricas de Sesión:** Estadísticas de mensajes y duración
- **Control de Sesión:** Iniciar, finalizar y reiniciar sesiones

### **Información de Respuestas**
Para cada respuesta real del agente, el sistema muestra:
- **Prioridad Ejecutada:** Qué meta principal se activó
- **Razonamiento del Agente:** Lógica interna de procesamiento
- **Datos Faltantes:** Información que el agente necesita recopilar
- **Tarea Ejecutada:** Función específica que se utilizó
- **Metadatos:** Información técnica adicional

### **Controles de Sesión**
- **Iniciar Nueva Sesión:** Comienza una conversación limpia
- **Finalizar Sesión:** Termina la sesión actual manteniendo el historial
- **Reiniciar:** Limpia completamente la conversación y comienza de nuevo

---

## 🌊 Flujo Visual

### **Visualización de Prioridades**
El flujo visual presenta las prioridades del agente como un diagrama interactivo que muestra dependencias y jerarquías de manera gráfica.

### **Elementos Visuales**
- **Nodos de Prioridades:** Cada prioridad se representa como una tarjeta con información clave
- **Conexiones:** Flechas que muestran dependencias entre prioridades
- **Colores por Importancia:** Código visual basado en el peso de cada prioridad
- **Estados:** Indicadores visuales de prioridades habilitadas/deshabilitadas

### **Información en Nodos**
Cada nodo muestra:
- Nombre y peso de la prioridad
- Estado de habilitación
- Tarea vinculada (si existe)
- Datos necesarios (primeros 3)
- Número de dependencias

### **Controles Interactivos**
- **Edición Directa:** Click en cualquier nodo para editar la prioridad
- **Navegación:** Controles de zoom y vista completa
- **Creación:** Botón flotante para agregar nuevas prioridades
- **Diseño Automático:** Organización automática del diagrama

---

## ⚙️ Configuración Avanzada

### **Editor JSON**
Para usuarios técnicos, la configuración avanzada permite editar directamente la estructura del agente en formato JSON, dividida en tres secciones:

- **Configuración del Agente:** Información básica, estado y configuración general
- **Orquestación:** Sistema de prioridades y base de conocimiento
- **Tareas:** Funciones específicas con toda su configuración

### **Configuración de Conversación**
Parámetros técnicos que controlan el comportamiento conversacional:

| Parámetro | Descripción | Rango |
|-----------|-------------|-------|
| **Límite de Historial** | Mensajes que el asistente recordará | 1-50 mensajes |
| **TTL de Sesión** | Tiempo de vida de la sesión | 300-86400 segundos |
| **Máximo Historial en Redis** | Mensajes almacenados en caché | 10-200 mensajes |
| **Modelo de IA** | Modelo usado para conversaciones generales | Configurable |
| **Creatividad** | Nivel de creatividad por defecto | 0.0-2.0 |
| **Longitud de Respuestas** | Tokens máximos por defecto | 100-2000 tokens |

### **Exportación e Importación**
- **Exportación:** Descarga completa de la configuración del agente en JSON
- **Backup:** Respaldo automático de configuraciones
- **Migración:** Transferencia de configuraciones entre entornos

---

## 📊 Modelo de Datos

### **Agent (Agente Principal)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único del agente |
| `alias` | string | Nombre corto y amigable |
| `name` | string | Nombre completo descriptivo |
| `description` | string | Descripción del propósito del agente |
| `enabled` | boolean | Estado de habilitación |
| `analyticsEnabled` | boolean | Habilitación de analytics de IAD |
| `type` | AgentType | Tipo especializado del agente |
| `channel` | AgentChannel | Canal de comunicación (whatsapp/call) |
| `connected` | boolean | Estado de conexión al canal |
| `status` | AgentStatus | Estado del agente (draft/active/deprecated) |
| `businessRules` | string[] | Reglas de negocio específicas |
| `businessInformation` | string[] | Información del negocio |
| `agentTone` | string | Personalidad y tono conversacional |
| `conversationPrompt` | string | Instrucciones generales de conversación |
| `conversationConfig` | object | Configuración técnica de conversación |
| `tasks` | Task[] | Lista de funciones disponibles |
| `orchestration` | Orchestration | Sistema de prioridades y conocimiento |

### **Task (Función del Agente)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único de la tarea |
| `name` | string | Nombre descriptivo |
| `description` | string | Propósito de la función |
| `type` | TaskType | Tipo de función |
| `enabled` | boolean | Estado de habilitación |
| `prompt` | Prompt | Configuración de IA |
| `apiConfig` | ApiConfig | Configuración de API externa (opcional) |
| `metadata` | object | Información adicional |

### **Priority (Prioridad del Sistema)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único |
| `name` | string | Nombre descriptivo |
| `description` | string | Explicación detallada |
| `weight` | number | Importancia relativa (1-100) |
| `triggers` | string[] | Frases que activan la prioridad |
| `requiredData` | string[] | Datos necesarios para completar |
| `dependsOn` | string[] | IDs de prioridades prerequisito |
| `completionCriteria` | string | Criterios de finalización |
| `taskId` | string | ID de tarea vinculada (opcional) |
| `enabled` | boolean | Estado de habilitación |

### **KnowledgeItem (Artículo de Conocimiento)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único |
| `title` | string | Título del artículo |
| `content` | string | Contenido completo |
| `category` | string | Categoría del artículo |
| `tags` | string[] | Etiquetas para búsqueda |
| `relevanceScore` | number | Puntuación de relevancia (0-1) |

### **Prompt (Configuración de IA)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único |
| `name` | string | Nombre técnico |
| `template` | string | Instrucciones para la IA |
| `model` | string | Modelo de IA a utilizar |
| `temperature` | number | Nivel de creatividad (0-2) |
| `maxTokens` | number | Longitud máxima de respuesta |
| `rag` | object | Configuración de búsqueda inteligente (opcional) |

---

## 🏗️ Arquitectura Técnica

### **Stack Tecnológico**
- **Frontend:** React 18 + TypeScript para interfaz de usuario
- **State Management:** Zustand con persistencia para gestión de estado
- **UI Components:** Tailwind CSS + Lucide React para diseño
- **Visualización:** ReactFlow para diagramas de flujo
- **API Client:** Axios para comunicación con backend
- **Persistencia:** LocalStorage para datos locales

### **Estructura de Componentes**
```
src/components/agents/
├── AgentsModule.tsx              # Punto de entrada principal
├── AgentsList.tsx               # Lista de agentes y templates
├── AgentTemplateSelector.tsx    # Selector de templates especializados
├── AgentEditor.tsx              # Editor principal con pestañas
├── TaskEditor.tsx               # Editor de funciones individuales
└── tabs/
    ├── AgentSummary.tsx         # Configuración general
    ├── AgentTasks.tsx           # Gestión de funciones
    ├── PriorityFlowView.tsx     # Flujo visual de prioridades
    ├── AgentTesting.tsx         # Simulador de conversación
    └── AgentAdvanced.tsx        # Configuración técnica
```

### **Gestión de Estado**
El store de Zustand maneja:
- **Lista de agentes** con persistencia local
- **Agente actual** en edición
- **Tarea seleccionada** para configuración
- **Estados de carga** y errores
- **Sincronización** con API backend

### **Comunicación con API**
- **Endpoints RESTful** para operaciones CRUD
- **Autenticación JWT** con interceptores automáticos
- **Manejo de errores** con fallback a datos locales
- **Sincronización** bidireccional entre frontend y backend

### **Persistencia de Datos**
- **LocalStorage** para configuraciones locales
- **API Backend** para sincronización en producción
- **Fallback automático** cuando la API no está disponible
- **Validación** de integridad de datos

---

## 🔄 Flujos de Usuario

### **Creación de Agente**
1. **Selección de Template** → Elegir especialización del agente
2. **Configuración Básica** → Personalizar nombre, descripción y canal
3. **Ajuste de Tareas** → Habilitar/deshabilitar funciones según necesidades
4. **Configuración de Prioridades** → Definir metas y comportamiento
5. **Pruebas** → Validar comportamiento en simulador
6. **Activación** → Cambiar estado a activo y habilitar

### **Configuración de Prioridades**
1. **Definición de Meta** → Establecer nombre y descripción
2. **Configuración de Activación** → Definir frases clave
3. **Especificación de Datos** → Seleccionar información necesaria
4. **Establecimiento de Dependencias** → Configurar prerequisitos
5. **Vinculación de Tarea** → Asociar función específica (opcional)
6. **Criterios de Finalización** → Definir cuándo se completa

### **Personalización de Tareas**
1. **Selección de Función** → Elegir tarea a configurar
2. **Configuración de Comportamiento** → Definir instrucciones específicas
3. **Ajuste de IA** → Configurar creatividad y longitud
4. **Conexión a APIs** → Configurar servicios externos (opcional)
5. **Pruebas** → Validar funcionamiento en simulador
6. **Guardado** → Persistir configuración

---

## 📈 Casos de Uso Principales

### **Para Gerentes de Ventas**
- Crear agentes especializados en captura de leads
- Configurar flujos de conversión optimizados
- Monitorear efectividad de diferentes configuraciones
- Ajustar prioridades según objetivos de negocio

### **Para Equipos de Soporte**
- Configurar agentes para gestión de reclamos
- Establecer escalamiento automático a humanos
- Crear base de conocimiento para respuestas consistentes
- Optimizar tiempos de respuesta

### **Para Coordinadores de Operaciones**
- Gestionar agentes de agendamiento
- Configurar recordatorios automáticos
- Optimizar flujos de coordinación
- Integrar con sistemas de calendario

### **Para Desarrolladores**
- Configuración técnica avanzada
- Integración con APIs externas
- Ajuste de parámetros de IA
- Exportación e importación de configuraciones

---

## 🔮 Limitaciones Actuales

### **Funcionalidades No Implementadas**
- **Asistentes de Voz:** Los agentes de voz están planificados pero no implementados
- **Métricas de Rendimiento:** Analytics detallados de efectividad de agentes
- **Colaboración Multi-Usuario:** Edición simultánea por múltiples usuarios

### **Consideraciones Técnicas**
- **Datos Simulados:** El sistema utiliza datos mock para demostración
- **API de Agentes:** Conexión real al backend para pruebas de conversación
- **Persistencia Local:** Configuraciones se guardan localmente como respaldo
- **Validación Básica:** Validación de formato pero no de lógica de negocio

---

**© 2024 IAD - Módulo de Gestión de Asistentes Conversacionales v2.1**

*Documentación actualizada con todas las funcionalidades implementadas del sistema de gestión de agentes, templates especializados, sistema de tareas y prioridades, base de conocimiento y simulador de conversación.*