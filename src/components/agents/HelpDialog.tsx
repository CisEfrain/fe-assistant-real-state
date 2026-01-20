import React from 'react';
import { X, HelpCircle, Brain, List, MessageSquare, Code, Eye, Target, Settings, Database, Zap, AlertTriangle, GitBranch } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose, activeTab }) => {
  if (!isOpen) return null;

  const getHelpContent = () => {
    switch (activeTab) {
      case 'summary':
        return {
          title: 'Configuración General del Agente',
          icon: Eye,
          color: 'from-blue-500 to-blue-600',
          content: (
            <div className="space-y-4">
              <p>
                En esta sección configuras la <strong>información básica</strong> de tu asistente: 
                nombre, tipo, canal de comunicación y personalidad general.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Información General</h4>
                  <p className="text-sm text-gray-600">
                    Define el alias (nombre corto), nombre completo, tipo de agente y descripción del propósito.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Estado y Conexión</h4>
                  <p className="text-sm text-gray-600">
                    Controla si el agente está habilitado, su estado (borrador/activo/obsoleto) y el canal de comunicación.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Personalidad</h4>
                  <p className="text-sm text-gray-600">
                    Define cómo debe comportarse tu asistente: su tono, estilo y personalidad en todas las conversaciones.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Variables de Personalización</h4>
                  <p className="text-sm text-gray-600">
                    Crea variables que puedes usar en las instrucciones del asistente con {'{nombre_variable}'}.
                  </p>
                </div>
              </div>
            </div>
          )
        };

      case 'brain':
        return {
          title: 'Cerebro del Agente (Sistema de Prioridades)',
          icon: Brain,
          color: 'from-purple-500 to-purple-600',
          content: (
            <div className="space-y-4">
              <p>
                El <strong>Cerebro del Agente</strong> funciona con un sistema de <strong>Prioridades</strong>. 
                Cada prioridad es una meta principal que el asistente puede completar.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">¿Cómo funcionan las Prioridades?</h4>
                  <p className="text-sm text-gray-600">
                    Las prioridades se activan cuando el usuario dice ciertas frases clave y pueden necesitar 
                    información específica para completarse. El asistente siempre intentará completar la 
                    prioridad más importante primero.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Configuración de Prioridad</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Peso:</strong> Determina la importancia (1-100)</li>
                    <li>• <strong>Frases clave:</strong> Qué debe decir el usuario para activarla</li>
                    <li>• <strong>Datos necesarios:</strong> Información requerida para completarla</li>
                    <li>• <strong>Dependencias:</strong> Otras prioridades que deben completarse primero</li>
                    <li>• <strong>Criterios de finalización:</strong> Cuándo se considera completada</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Comportamiento por Defecto</h4>
                  <p className="text-sm text-gray-600">
                    Define qué debe hacer el asistente cuando ninguna prioridad específica se activa.
                  </p>
                </div>
              </div>
            </div>
          )
        };

      case 'tasks':
        return {
          title: 'Gestión de Funciones del Agente',
          icon: List,
          color: 'from-green-500 to-green-600',
          content: (
            <div className="space-y-4">
              <p>
                Las <strong>Funciones</strong> son las tareas específicas que tu asistente puede realizar. 
                Cada función tiene su propio comportamiento y configuración de IA.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Tipos de Funciones Disponibles</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Capturar Datos:</strong> Recopilar información del cliente</li>
                    <li>• <strong>Búsqueda de Propiedades:</strong> Buscar según criterios</li>
                    <li>• <strong>Agendar Citas:</strong> Programar visitas y llamadas</li>
                    <li>• <strong>Detector de Intención:</strong> Identificar qué quiere el usuario</li>
                    <li>• <strong>Gestión de Reclamos:</strong> Manejar quejas empáticamente</li>
                    <li>• <strong>Preguntas Frecuentes:</strong> Responder consultas comunes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Configuración de Funciones</h4>
                  <p className="text-sm text-gray-600">
                    Cada función puede configurarse con instrucciones específicas, variables dinámicas, 
                    configuración de IA (creatividad, longitud) y conexión a APIs externas.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Estados y Control</h4>
                  <p className="text-sm text-gray-600">
                    Puedes habilitar/deshabilitar funciones, ajustar su comportamiento y eliminar las que no necesites.
                  </p>
                </div>
              </div>
            </div>
          )
        };

      case 'flow':
        return {
          title: 'Flujo Visual de Prioridades',
          icon: GitBranch,
          color: 'from-indigo-500 to-indigo-600',
          content: (
            <div className="space-y-4">
              <p>
                La <strong>Vista de Flujo Visual</strong> muestra las prioridades de tu asistente como un 
                diagrama interactivo, facilitando la comprensión de dependencias y jerarquías.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Visualización de Dependencias</h4>
                  <p className="text-sm text-gray-600">
                    Las flechas muestran las dependencias entre prioridades. Una prioridad solo se activa 
                    cuando sus dependencias han sido completadas.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Colores por Importancia</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Rojo:</strong> Prioridad crítica (80-100)</li>
                    <li>• <strong>Naranja:</strong> Prioridad alta (60-79)</li>
                    <li>• <strong>Amarillo:</strong> Prioridad media (40-59)</li>
                    <li>• <strong>Verde:</strong> Prioridad baja (1-39)</li>
                    <li>• <strong>Gris:</strong> Prioridad deshabilitada</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Controles Interactivos</h4>
                  <p className="text-sm text-gray-600">
                    Usa los controles para cambiar entre diseño vertical y horizontal. 
                    El minimapa te ayuda a navegar en diagramas grandes.
                  </p>
                </div>
              </div>
            </div>
          )
        };
      case 'testing':
        return {
          title: 'Simulador de Conversación',
          icon: MessageSquare,
          color: 'from-blue-500 to-blue-600',
          content: (
            <div className="space-y-4">
              <p>
                Prueba tu asistente en tiempo real. Las respuestas son <strong>simuladas</strong> basándose en 
                las prioridades y configuración que has definido.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Cómo Funciona</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Cada sesión es independiente y puedes reiniciar cuando quieras</li>
                    <li>• Las respuestas se basan en las prioridades configuradas</li>
                    <li>• Puedes probar diferentes escenarios de conversación</li>
                    <li>• El simulador usa la configuración actual del agente</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Controles de Sesión</h4>
                  <p className="text-sm text-gray-600">
                    Usa "Iniciar Nueva Sesión" para comenzar, "Finalizar Sesión" para terminar, 
                    y "Reiniciar" para empezar de nuevo con una conversación limpia.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Métricas de Sesión</h4>
                  <p className="text-sm text-gray-600">
                    Observa estadísticas en tiempo real: número de mensajes, duración de la sesión 
                    y configuración del agente en prueba.
                  </p>
                </div>
              </div>
            </div>
          )
        };

      case 'advanced':
        return {
          title: 'Configuración Técnica Avanzada',
          icon: Code,
          color: 'from-yellow-500 to-yellow-600',
          content: (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">⚠️ Solo para Usuarios Técnicos</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Esta sección permite la edición directa de la configuración del agente en formato JSON. 
                      Los cambios incorrectos pueden afectar el funcionamiento del asistente.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Editor JSON</h4>
                  <p className="text-sm text-gray-600">
                    Edita directamente la configuración del agente, orquestación y tareas en formato JSON. 
                    Asegúrate de validar el formato antes de guardar.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Configuración de Conversación</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Límite de Historial:</strong> Mensajes que el asistente recordará</li>
                    <li>• <strong>TTL de Sesión:</strong> Tiempo de vida de la sesión en segundos</li>
                    <li>• <strong>Modelo de IA:</strong> Modelo usado para conversaciones generales</li>
                    <li>• <strong>Creatividad:</strong> Nivel de creatividad por defecto</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Exportación/Importación</h4>
                  <p className="text-sm text-gray-600">
                    Exporta la configuración completa del agente para backup o migración a otros entornos.
                  </p>
                </div>
              </div>
            </div>
          )
        };

      case 'knowledge':
        return {
          title: 'Base de Conocimiento',
          icon: Database,
          color: 'from-green-500 to-green-600',
          content: (
            <div className="space-y-4">
              <p>
                Aquí guardas la información que tu asistente usará para responder preguntas y dar detalles. 
                Piensa en esto como el <strong>manual de referencia</strong> de tu asistente.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Organización de Artículos</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Categorías:</strong> Organiza por tipo (Propiedades, Servicios, FAQ, etc.)</li>
                    <li>• <strong>Etiquetas:</strong> Usa tags para búsqueda rápida</li>
                    <li>• <strong>Relevancia:</strong> Ajusta la importancia de cada artículo (0-1)</li>
                    <li>• <strong>Búsqueda:</strong> Filtra por categoría o busca texto específico</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Creación de Contenido</h4>
                  <p className="text-sm text-gray-600">
                    Crea artículos con información detallada que el asistente necesita conocer. 
                    Incluye procedimientos, políticas, información de productos y respuestas a preguntas frecuentes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mejores Prácticas</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Usa títulos descriptivos y claros</li>
                    <li>• Mantén el contenido actualizado</li>
                    <li>• Usa etiquetas relevantes para facilitar la búsqueda</li>
                    <li>• Ajusta la relevancia según la importancia del contenido</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Ayuda del Módulo de Asistentes',
          icon: HelpCircle,
          color: 'from-gray-500 to-gray-600',
          content: (
            <div className="space-y-4">
              <p>
                Bienvenido al <strong>Módulo de Gestión de Asistentes Conversacionales</strong>. 
                Aquí puedes configurar y administrar agentes de IA especializados.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Navegación</h4>
                  <p className="text-sm text-gray-600">
                    Usa las pestañas superiores para acceder a diferentes aspectos de la configuración. 
                    Cada pestaña tiene ayuda contextual específica.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Flujo Recomendado</h4>
                  <ol className="text-sm text-gray-600 space-y-1">
                    <li>1. Configura información general en <strong>Resumen</strong></li>
                    <li>2. Define prioridades en <strong>Cerebro del Agente</strong></li>
                    <li>3. Personaliza funciones en <strong>Tareas</strong></li>
                    <li>4. Prueba el comportamiento en <strong>Probar Agente</strong></li>
                    <li>5. Ajusta configuración técnica si es necesario</li>
                  </ol>
                </div>
              </div>
            </div>
          )
        };
    }
  };

  const helpContent = getHelpContent();
  const Icon = helpContent.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className={`px-6 py-4 bg-gradient-to-r ${helpContent.color}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{helpContent.title}</h3>
                  <p className="text-white/80 text-sm">Guía de uso y configuración</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="prose prose-sm max-w-none">
              {helpContent.content}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              💡 Tip: Esta ayuda es contextual para cada pestaña
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};