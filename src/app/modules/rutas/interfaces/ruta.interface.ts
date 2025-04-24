export interface Ruta {
  id: string;
  customer_address: string;
  customer_name: string;
  customer_phone_number: string;
  latitude: string;
  longitude: string;
  date: string;
}

export interface RutaResponse {
  id: string;
  date: Date;
  stops: Stop[];
  created_at: Date;
  updated_at: Date;
}

export interface Stop {
  id: string;
  client: Client;
  address: Address;
  created_at: Date;
  updated_at: Date;
}

export interface Address {
  id: string;
  line: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Client {
  id: string;
  full_name: string;
  email: string;
  username: string;
  phone: string;
  id_type: null;
  identification: null;
  created_at: Date;
  updated_at: null;
  address: Address;
}
