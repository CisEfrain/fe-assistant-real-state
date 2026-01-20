import { InteractionRecord } from '../types';

// Generar datos mock realistas
export const generateMockData = (): InteractionRecord[] => {
  const records: InteractionRecord[] = [];
  const leadTypes: Array<'PROPERTY_LEAD' | 'SEARCH_LEAD'> = ['PROPERTY_LEAD', 'SEARCH_LEAD'];
  const operationTypes: Array<'SELL' | 'RENT'> = ['SELL', 'RENT'];
  const channels: Array<'whatsapp' | 'webchat' | 'widget_testing'> = ['whatsapp', 'webchat', 'widget_testing'];
  const propertyTypes = ['HOUSE', 'APARTMENT', 'CONDO', 'OFFICE'];
  const appointmentTypes: Array<'VISIT' | 'PHONE_CALL' | 'NOT_SCHEDULED'> = ['VISIT', 'PHONE_CALL', 'NOT_SCHEDULED'];
  const csatResponses = ['1', '2', '3', '4', '5']; // Valores numéricos del 1 al 5
  const states = ['CDMX', 'Estado de México', 'Jalisco', 'Nuevo León', 'Puebla'];
  const districts = ['Benito Juárez', 'Miguel Hidalgo', 'Coyoacán', 'Tlalpan', 'Cuauhtémoc'];
  const sources = [
    'vivanuncios', 'inmuebles24', 'metroscubicos', 'lamudi', 'propiedades', 
    'icasas', 'listglobally', 'mercadolibre', 'goplaceit', 'rentealo', 
    'mapa', 'greenacres', 'nocnok', 'portalterreno', 'vizzit', 'proppit', 
    'beleta', 'iadoverseas', 'iadmexico', 'MLS WorldWide', 'beleta_fail', 
    'james_edition', 'doorvel', 'lona', 'SANTI'
  ];

  for (let i = 1; i <= 5000; i++) {
    const leadType = leadTypes[Math.floor(Math.random() * leadTypes.length)];
    const operationType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const hasAppointment = Math.random() > 0.6; // 60% sin cita, 40% con cita
    const hasEvaluation = leadType === 'PROPERTY_LEAD' && Math.random() > 0.15; // 85% con evaluación
    const showCsat = Math.random() > 0.25; // 75% reciben encuesta
    const hasCsat = showCsat && Math.random() > 0.2; // 80% de los que reciben encuesta la responden
    const source = sources[Math.floor(Math.random() * sources.length)];
    
    const price = operationType === 'SELL' 
      ? Math.floor(Math.random() * 8000000) + 2000000 // 2M - 10M para venta
      : Math.floor(Math.random() * 30000) + 8000; // 8K - 38K para renta

    const record: InteractionRecord = {
      phonecall_id: i,
      source: source,
      channel: channel,
      lead_type: leadType,
      operation_type: operationType,
      broker_status: Math.random() > 0.9 ? 'BLOCKED' : 'ACTIVE',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Últimos 30 días
      quality: {
        show_csat: showCsat,
        csat: hasCsat ? csatResponses[Math.floor(Math.random() * csatResponses.length)] : undefined,
        complaint: Math.random() > 0.95 ? 'Tiempo de espera muy largo' : undefined,
        human_request: Math.random() > 0.85, // 15% pide humano
        human_resquest_no_response: Math.random() > 0.7 ? undefined : Math.random() > 0.5
      }
    };

    // Agregar propiedad original para PROPERTY_LEAD
    if (leadType === 'PROPERTY_LEAD') {
      record.original_property = {
        property_id: Math.floor(Math.random() * 100000) + 1000,
        property_type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
        price: {
          amount: price,
          currency: 'MXN'
        }
      };
    }

    // Agregar cita si aplica
    if (hasAppointment) {
      const appointmentType = appointmentTypes[Math.floor(Math.random() * 2)]; // Solo VISIT o PHONE_CALL si hay cita
      record.appointment = {
        type: appointmentType,
        date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(), // Próximos 14 días
        title: `Cita con cliente ${i}`
      };
    } else {
      record.appointment = {
        type: 'NOT_SCHEDULED'
      };
    }

    // Agregar evaluación para PROPERTY_LEAD
    if (hasEvaluation) {
      record.evaluation = {
        seeker: Math.random() > 0.7 ? 'MYSELF' : 'OTHER',
        status: 'SEARCHING',
        purchase_planning_time: operationType === 'SELL' ? 'LT_THREE_MONTHS' : undefined,
        mortgage_credit: operationType === 'SELL' ? 'INFONAVIT' : undefined,
        credit_validation: operationType === 'SELL' ? (Math.random() > 0.6 ? 'PREAPPROVED' : 'UNSTARTED') : undefined,
        additional_options: Math.random() > 0.5 ? 'YES' : 'NO',
        support_needed: Math.random() > 0.3 ? 'IMMEDIATE' : 'JUST_INFO',
        mean_of_communication: Math.random() > 0.5 ? 'whatsapp' : 'PHONE',
        pet_policy: ['ALLOWED', 'NOT_ALLOWED', 'UNDEFINED'][Math.floor(Math.random() * 3)],
        qualification: ['HOT', 'MODERATE', 'UNLIKELY'][Math.floor(Math.random() * 3)],
        additional_comment: 'Cliente interesado, seguimiento programado',
        tentative_moving_date: operationType === 'RENT' ? '2024-03-15' : undefined,
        renting_requirements: operationType === 'RENT' ? ['aval', 'póliza'] : undefined
      };
    }

    // Agregar búsqueda para SEARCH_LEAD
    if (leadType === 'SEARCH_LEAD') {
      record.search = {
        country: 'México',
        state: states[Math.floor(Math.random() * states.length)],
        district: districts[Math.floor(Math.random() * districts.length)],
        neighborhood: 'Roma Norte',
        property_type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
        minPrice: operationType === 'SELL' ? 2000000 : 10000,
        maxPrice: operationType === 'SELL' ? 5000000 : 25000,
        confirmation_method: Math.random() > 0.5 ? 'whatsapp' : 'TELEPHONE',
        qualification: ['HOT', 'MODERATE', 'UNLIKELY'][Math.floor(Math.random() * 3)]
      };
    }

    records.push(record);
  }

  return records;
};
