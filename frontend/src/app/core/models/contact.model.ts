export type ContactType = 'email' | 'phone' | 'whatsapp';

export interface Contact {
  id: number;
  person_id: number;
  type: ContactType;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface ContactPayload {
  type: ContactType;
  value: string;
}

export const contactTypeLabels: Record<ContactType, string> = {
  email: 'E-mail',
  phone: 'Telefone',
  whatsapp: 'WhatsApp',
};

export const contactTypeOptions: readonly { value: ContactType; label: string }[] = [
  { value: 'email', label: contactTypeLabels.email },
  { value: 'phone', label: contactTypeLabels.phone },
  { value: 'whatsapp', label: contactTypeLabels.whatsapp },
];
