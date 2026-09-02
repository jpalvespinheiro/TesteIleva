import { Contact } from './contact.model';

export interface Address {
  cep: string;
  street: string | null;
  number: string;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
}

export interface AddressLookup {
  cep: string;
  street: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
}

export interface Person {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  address: Address;
  contacts_count?: number;
  contacts?: Contact[];
  created_at: string;
  updated_at: string;
}

export interface PersonPayload {
  name: string;
  cpf: string;
  phone: string;
  address: {
    cep: string;
    number: string;
    complement: string | null;
  };
}

export interface PersonFilters {
  name: string;
  cpf: string;
  phone: string;
}
