# Guía de Usuario - Módulo Otros Contactos

## 📖 Introducción

El módulo **Otros Contactos** te permite visualizar y analizar todas las interacciones con clientes que no resultaron en leads de negocio. Esto incluye consultas fuera de alcance, quejas, consultas generales y otras conversaciones que no generaron oportunidades de venta o alquiler.

## 🎯 ¿Para qué sirve?

### Casos de Uso Principales

1. **Análisis de Quejas**: Identificar patrones en reclamos de clientes
2. **Mejora de Servicio**: Detectar áreas de mejora en la atención
3. **Gestión de Expectativas**: Entender qué buscan los clientes fuera de tu oferta
4. **Seguimiento de Escalamientos**: Monitorear casos derivados a supervisores
5. **Análisis de Canales**: Comparar efectividad entre WhatsApp y llamadas

## 🚀 Acceso al Módulo

1. Inicia sesión en IAD Contact Center
2. En el menú lateral izquierdo, haz clic en **"Otros Contactos"** 💬
3. El módulo cargará automáticamente los contactos del último mes

## 📊 Interfaz Principal

### Sección 1: Selector de Período

Controla el rango de fechas para analizar:

- **Desde/Hasta**: Selecciona fechas específicas
- **Botones Rápidos**: 
  - `7d`: Últimos 7 días
  - `30d`: Últimos 30 días
  - `90d`: Últimos 90 días

### Sección 2: Filtros

Refina tu búsqueda con:

#### Canal
- **Todos los canales**: Muestra WhatsApp y llamadas
- **WhatsApp**: Solo interacciones por WhatsApp
- **Llamada**: Solo llamadas telefónicas

#### Tiene Queja
- **Todos**: Muestra todos los contactos
- **Con queja**: Solo contactos que registraron una queja
- **Sin queja**: Solo contactos sin quejas

### Sección 3: Estadísticas

Visualiza métricas clave en tiempo real:

#### Total de Contactos
Cantidad total de interacciones en el período seleccionado.

#### Con Queja
- Número de contactos que registraron quejas
- Porcentaje sobre el total
- **Color rojo** indica alerta

#### WhatsApp
- Cantidad de interacciones por WhatsApp
- Porcentaje sobre el total
- **Color verde** identifica este canal

#### Llamadas
- Cantidad de interacciones telefónicas
- Porcentaje sobre el total
- **Color azul** identifica este canal

#### Duración Promedio
Tiempo promedio de duración de las sesiones (en minutos y segundos).

## 📋 Tabla de Contactos

### Columnas

1. **ID**: Identificador único del contacto (truncado)
2. **Canal**: Badge visual (📱 WhatsApp o 📞 Llamada)
3. **Tiene Queja**: Badge visual (⚠️ Sí o ✓ No)
4. **Comentario**: Resumen del comentario adicional (primeros 50 caracteres)
5. **Fecha**: Fecha y hora de la interacción
6. **Acciones**: Botón "Ver Detalle"

### Paginación

- **Navegación**: Usa los botones `<<`, `<`, números de página, `>`, `>>`
- **Páginas visibles**: Muestra hasta 5 números de página a la vez
- **Indicador**: "Página X de Y" en la parte superior

## 🔍 Ver Detalle de Contacto

Haz clic en **"Ver Detalle"** para abrir el modal con información completa.

### Secciones del Modal

#### 1. Header
- **ID del contacto**: Identificador único
- **Canal**: Badge con el canal de comunicación
- **Fecha y hora**: Timestamp completo de la interacción

#### 2. Información General

##### Comentario Adicional
Descripción detallada del contexto de la interacción (fondo azul).

##### Estado de Queja
- **Sin Quejas** (✓): Fondo verde, indica interacción sin problemas
- **Queja Registrada** (⚠️): Fondo rojo, muestra el texto de la queja

#### 3. Conversación

Timeline completo de la conversación:

- **Mensajes del Usuario**: 
  - Alineados a la izquierda
  - Fondo gris
  - Icono de usuario 👤

- **Mensajes del Asistente**:
  - Alineados a la derecha
  - Fondo morado (gradiente)
  - Icono de mensaje 💬

- **Timestamp**: Hora exacta de cada mensaje

#### 4. Metadata Adicional

Información técnica y contextual renderizada inteligentemente:

##### Campos Especiales

**Número de Teléfono** 📞
```
+5491112345678
```

**Duración de Sesión** ⏱️
```
2m 45s
```

**Tipo de Interacción** 🏷️
- `OUT_OF_SCOPE`: Fuera de alcance (gris)
- `COMPLAINT`: Queja (rojo)
- `GENERAL_INQUIRY`: Consulta general (azul)

**Prioridad** ⚡
- `HIGH`: Alta (rojo)
- `MEDIUM`: Media (amarillo)
- `LOW`: Baja (verde)

**Escalado a** 👥
```
supervisor_team
```

**ID de Queja** #️⃣
```
#12345
```

##### Otros Campos
Cualquier otro campo en metadata se muestra en formato clave-valor.

## 💡 Casos de Uso Prácticos

### Caso 1: Análisis de Quejas del Mes

**Objetivo**: Identificar las principales quejas del último mes.

**Pasos**:
1. Selecciona período: `30d`
2. Aplica filtro: **Tiene Queja** → "Con queja"
3. Revisa la tabla y abre detalles de cada queja
4. Analiza patrones comunes en los comentarios

**Resultado**: Lista de quejas para plan de mejora.

---

### Caso 2: Comparación de Canales

**Objetivo**: Determinar qué canal genera más consultas fuera de alcance.

**Pasos**:
1. Selecciona período: `90d`
2. Observa las estadísticas de WhatsApp vs Llamadas
3. Aplica filtro por canal para análisis detallado
4. Compara duración promedio entre canales

**Resultado**: Insights para optimizar recursos por canal.

---

### Caso 3: Seguimiento de Escalamientos

**Objetivo**: Monitorear casos derivados a supervisores.

**Pasos**:
1. Selecciona período: `7d`
2. Aplica filtro: **Tiene Queja** → "Con queja"
3. Abre detalles de cada contacto
4. Busca en metadata el campo `escalated_to`
5. Verifica el campo `priority`

**Resultado**: Lista de casos escalados para seguimiento.

---

### Caso 4: Identificar Oportunidades Perdidas

**Objetivo**: Encontrar consultas que podrían haberse convertido en leads.

**Pasos**:
1. Selecciona período: `30d`
2. Aplica filtro: **Tiene Queja** → "Sin queja"
3. Revisa comentarios de tipo "out_of_scope"
4. Analiza conversaciones para detectar patrones

**Resultado**: Insights para expandir servicios o mejorar derivaciones.

---

## 🎨 Códigos de Color

### Badges de Canal
- 🟢 **Verde**: WhatsApp
- 🔵 **Azul**: Llamada

### Badges de Queja
- 🔴 **Rojo**: Con queja
- 🟢 **Verde**: Sin queja

### Badges de Prioridad
- 🔴 **Rojo**: Alta
- 🟡 **Amarillo**: Media
- 🟢 **Verde**: Baja

### Badges de Tipo de Interacción
- ⚫ **Gris**: Fuera de alcance
- 🔴 **Rojo**: Queja
- 🔵 **Azul**: Consulta general

## ⚙️ Configuración Avanzada

### Límite de Resultados
Por defecto, se muestran **20 contactos por página**. Este valor está optimizado para rendimiento.

### Ordenamiento
Los contactos se ordenan por **fecha de creación descendente** (más recientes primero).

### Actualización de Datos
Los datos se actualizan automáticamente al:
- Cambiar el período
- Aplicar o quitar filtros
- Cambiar de página

## 🐛 Solución de Problemas

### No se muestran contactos

**Posibles causas**:
1. No hay datos en el período seleccionado
2. Los filtros son muy restrictivos
3. Error de conexión con el API

**Soluciones**:
1. Amplía el rango de fechas
2. Quita algunos filtros
3. Verifica tu conexión a internet
4. Contacta a soporte técnico

---

### El modal no se abre

**Posibles causas**:
1. Error de JavaScript
2. Bloqueador de pop-ups activo

**Soluciones**:
1. Recarga la página (F5)
2. Desactiva bloqueadores de pop-ups
3. Prueba en otro navegador

---

### La paginación no funciona

**Posibles causas**:
1. Error de conexión
2. Datos inconsistentes del API

**Soluciones**:
1. Verifica tu conexión
2. Recarga la página
3. Contacta a soporte técnico

---

## 📱 Uso en Dispositivos Móviles

### Adaptaciones Móviles

- **Filtros**: Se apilan verticalmente
- **Tabla**: Scroll horizontal habilitado
- **Modal**: Ocupa toda la pantalla
- **Estadísticas**: Grid de 1 columna

### Recomendaciones

1. Usa orientación **vertical** para mejor legibilidad
2. Haz **zoom** si necesitas ver detalles pequeños
3. Usa **gestos de deslizamiento** para navegar la tabla

## 🔒 Privacidad y Seguridad

### Datos Sensibles

- **Números de teléfono**: Visibles solo para usuarios autorizados
- **Contenido de quejas**: Tratado como confidencial
- **Metadata**: Puede contener información sensible

### Buenas Prácticas

1. **No compartas** capturas de pantalla con datos personales
2. **Cierra sesión** al terminar de usar la plataforma
3. **Reporta** cualquier dato sensible expuesto incorrectamente

## 📞 Soporte

### ¿Necesitas Ayuda?

- **Email**: soporte@iad.com
- **Documentación Técnica**: Ver `README.md` en el repositorio
- **Reportar Bug**: Crea un issue en el repositorio

---

**Última actualización**: 2025-10-08  
**Versión del módulo**: 1.0.0  
**Autor**: IAD Development Team
