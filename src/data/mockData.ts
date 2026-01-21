import { InteractionRecord } from '../types';

// Generar datos mock realistas
export const generateMockData = (): InteractionRecord[] => {
  const records: InteractionRecord[] = [];
  const operationTypes: Array<'SELL' | 'RENT'> = ['SELL', 'RENT'];
  const channels: Array<'whatsapp' | 'webchat' | 'widget_testing'> = ['whatsapp', 'webchat', 'widget_testing'];
  const propertyTypes = ['HOUSE', 'APARTMENT', 'CONDO', 'OFFICE'];
  const appointmentTypes: Array<'VISIT' | 'PHONE_CALL' | 'NOT_SCHEDULED'> = ['VISIT', 'PHONE_CALL', 'NOT_SCHEDULED'];
  const csatResponses = ['1', '2', '3', '4', '5'];
  const sources = [
    'vivanuncios', 'inmuebles24', 'metroscubicos', 'lamudi', 'propiedades',
    'icasas', 'listglobally', 'mercadolibre', 'goplaceit', 'rentealo',
    'mapa', 'greenacres', 'nocnok', 'portalterreno', 'vizzit', 'proppit',
    'beleta', 'iadoverseas', 'iadmexico', 'MLS WorldWide', 'beleta_fail',
    'james_edition', 'doorvel', 'lona', 'SANTI'
  ];

  for (let i = 1; i <= 5000; i++) {
    const operationType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const hasAppointment = Math.random() > 0.6;
    const hasEvaluation = Math.random() > 0.15;
    const showCsat = Math.random() > 0.25;
    const hasCsat = showCsat && Math.random() > 0.2;
    const source = sources[Math.floor(Math.random() * sources.length)];

    const price = operationType === 'SELL'
      ? Math.floor(Math.random() * 8000000) + 2000000
      : Math.floor(Math.random() * 30000) + 8000;

    const record: InteractionRecord = {
      phonecall_id: i,
      source: source,
      channel: channel,
      lead_type: 'PROPERTY_LEAD',
      operation_type: operationType,
      broker_status: Math.random() > 0.9 ? 'BLOCKED' : 'ACTIVE',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      quality: {
        show_csat: showCsat,
        csat: hasCsat ? csatResponses[Math.floor(Math.random() * csatResponses.length)] : undefined,
        complaint: Math.random() > 0.95 ? 'Tiempo de espera muy largo' : undefined,
        human_request: Math.random() > 0.85,
        human_resquest_no_response: Math.random() > 0.7 ? undefined : Math.random() > 0.5
      },
      original_property: {
        property_id: Math.floor(Math.random() * 100000) + 1000,
        property_type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
        price: {
          amount: price,
          currency: 'MXN'
        }
      }
    };

    if (hasAppointment) {
      const appointmentType = appointmentTypes[Math.floor(Math.random() * 2)];
      record.appointment = {
        type: appointmentType,
        date: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        title: `Cita con cliente ${i}`
      };
    } else {
      record.appointment = {
        type: 'NOT_SCHEDULED'
      };
    }

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

    records.push(record);
  }

  return records;
};
