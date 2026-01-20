import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, MapPin, Mail, Briefcase, TrendingUp, Target, Calendar, ArrowRight, Loader2, Info } from 'lucide-react';
import { PONLeadFormData, ExperienciaBR, ProyectoVida } from '../../types/playground';
import { Agent } from '../../types/agents';
import { env } from '../../env';

interface PONEvent {
  id: string;
  name: string;
  type: string;
  webinar?: string;
  webinar_sinapsis?: string;
  event?: string | null;
  event_address?: string | null;
}

interface PONLeadFormProps {
  agent: Agent;
  onSubmit: (formData: PONLeadFormData) => Promise<void>;
  loading?: boolean;
}

export const PONLeadForm: React.FC<PONLeadFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState<PONLeadFormData>({
    nombre: '',
    telefono: '+52',
    ciudad: '',
    email: '',
    experiencia_br: 'No',
    meta_financiera: '',
    proyecto_vida: 'mas_tiempo',
    evento: ''
  });

  const [events, setEvents] = useState<PONEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<PONEvent | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const response = await axios.get(env.N8N_GOHIGHLEVEL_CAMPAIGNS_URL!);
        if (response.data && response.data.events) {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const handleChange = (field: keyof PONLeadFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'evento') {
      const event = events.find(e => e.id === value);
      setSelectedEventDetails(event || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-2xl mx-auto my-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Simulación de Lead PON mediante formulario de Meta</h3>
            <p className="text-blue-100 text-sm">
              Reclutamiento de Asesores Inmobiliarios
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej. Juan Pérez"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+52 123 456 7890"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="juan@ejemplo.com"
              />
            </div>
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad de Residencia *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="text"
                value={formData.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej. Ciudad de México"
              />
            </div>
          </div>

          {/* Experiencia */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experiencia en Bienes Raíces *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                required
                value={formData.experiencia_br}
                onChange={(e) => handleChange('experiencia_br', e.target.value as ExperienciaBR)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Meta Financiera */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Financiera Mensual *
            </label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="text"
                value={formData.meta_financiera}
                onChange={(e) => handleChange('meta_financiera', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej. $50,000 MXN"
              />
            </div>
          </div>

          {/* Proyecto de Vida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proyecto de Vida *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                required
                value={formData.proyecto_vida}
                onChange={(e) => handleChange('proyecto_vida', e.target.value as ProyectoVida)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="mas_tiempo">Tener más tiempo libre</option>
                <option value="mas_dinero">Generar más ingresos</option>
                <option value="legado">Construir un legado</option>
              </select>
            </div>
          </div>

          {/* Evento (Dinámico) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evento (Campaña/Webinar)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={formData.evento || ''}
                onChange={(e) => handleChange('evento', e.target.value)}
                disabled={loadingEvents}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">Selecciona un evento...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              {loadingEvents && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Detalles del Evento Seleccionado */}
          {selectedEventDetails && (
            <div className="md:col-span-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-blue-900">
                    {selectedEventDetails.name}
                  </h4>
                  {selectedEventDetails.webinar_sinapsis && (
                    <p className="text-xs text-blue-700 whitespace-pre-wrap leading-relaxed">
                      {selectedEventDetails.webinar_sinapsis}
                    </p>
                  )}
                  {selectedEventDetails.webinar && (
                    <a 
                      href={selectedEventDetails.webinar} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 underline mt-1"
                    >
                      Ver Webinar <ArrowRight className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Procesando Lead...
              </>
            ) : (
              <>
                Crear Lead y Simular Conversación
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
          <p className="text-xs text-center text-gray-500 mt-3">
            Esto creará un lead en el sistema y simulará el mensaje proactivo que se enviaría por WhatsApp.
          </p>
        </div>
      </form>
    </div>
  );
};
