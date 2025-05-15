export interface Cliente {
  customer_id: string;
  customer_name: string;
  identification: string;
  addressString: string;
  phone: string;
  customer_image: string;
  isRecentVisit: boolean;
  address?: Address;
  client?: Client;
}

export interface ClienteResponse {
  id: string;
  client: Client;
  last_visited: Date;
  was_visited_recently: boolean;
  client_thumbnail: string;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  full_name: string;
  email: string;
  username: string;
  phone: string;
  id_type: string;
  identification: string;
  created_at: Date;
  updated_at: Date;
  address: Address;
}

export interface Address {
  id: string;
  line?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}
