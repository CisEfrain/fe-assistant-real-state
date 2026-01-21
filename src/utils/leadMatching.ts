import { InteractionRecord } from '../types';
import { Lead } from '../types/leads';

export const extractContactFromMetadata = (metadata: Record<string, unknown> | undefined) => {
  if (!metadata) return { name: '', phone: '', email: '' };

  const name = String(metadata?.name || metadata?.nombre || '');
  const phone = String(metadata?.phone || metadata?.telefono || metadata?.phone_number || '');
  const email = String(metadata?.email || '');

  return { name, phone, email };
};

export const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const findLeadByContact = (
  leads: Lead[],
  phone?: string,
  email?: string
): Lead | null => {
  if (!leads || leads.length === 0) return null;

  const normalizedPhone = phone ? normalizePhone(phone) : '';
  const normalizedEmail = email ? normalizeEmail(email) : '';

  return leads.find(lead => {
    const leadPhone = normalizePhone(lead.contact.phone || '');
    const leadEmail = normalizeEmail(lead.contact.email || '');

    const phoneMatch = normalizedPhone && leadPhone.includes(normalizedPhone.slice(-10));
    const emailMatch = normalizedEmail && leadEmail === normalizedEmail;

    return phoneMatch || emailMatch;
  }) || null;
};

export const findLeadByInteraction = (
  leads: Lead[],
  interaction: InteractionRecord
): Lead | null => {
  const { phone, email } = extractContactFromMetadata(interaction.metadata);
  return findLeadByContact(leads, phone, email);
};

export const getLeadConversations = (
  interactions: InteractionRecord[],
  lead: Lead
): InteractionRecord[] => {
  const leadPhone = normalizePhone(lead.contact.phone || '');
  const leadEmail = normalizeEmail(lead.contact.email || '');

  return interactions.filter(interaction => {
    const { phone, email } = extractContactFromMetadata(interaction.metadata);
    const interactionPhone = normalizePhone(phone);
    const interactionEmail = normalizeEmail(email);

    const phoneMatch = leadPhone && interactionPhone.includes(leadPhone.slice(-10));
    const emailMatch = leadEmail && interactionEmail === leadEmail;

    return phoneMatch || emailMatch;
  });
};

export const aggregateLeadsFromInteractions = (
  interactions: InteractionRecord[]
): Partial<Lead>[] => {
  const leadMap = new Map<string, Partial<Lead>>();

  interactions.forEach(interaction => {
    const { phone, email, name } = extractContactFromMetadata(interaction.metadata);
    const key = phone || email || 'unknown';

    if (!leadMap.has(key)) {
      leadMap.set(key, {
        id: key,
        contact: { name, phone, email },
        status: 'NEW',
        leadType: interaction.lead_type,
        operationType: interaction.operation_type,
        source: interaction.channel,
        createdAt: interaction.created_at,
        lastUpdated: interaction.created_at,
        activities: []
      });
    }

    const existingLead = leadMap.get(key)!;
    if (new Date(interaction.created_at) > new Date(existingLead.lastUpdated || '')) {
      existingLead.lastUpdated = interaction.created_at;
      if (interaction.appointment?.type && interaction.appointment.type !== 'NOT_SCHEDULED') {
        existingLead.appointment = interaction.appointment;
        existingLead.status = 'APPOINTMENT_SCHEDULED';
      }
    }
  });

  return Array.from(leadMap.values());
};
