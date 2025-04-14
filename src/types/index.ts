// Interfaces centralizadas para evitar importações circulares

// Usando os tipos do Supabase ou definindo manualmente se não estiverem disponíveis
export type Client = {
  id: string;
  user_id?: string;
  name: string;
  industry: string;
  created_at?: string;
  updated_at?: string;
  persona?: Persona;
  socialMedia?: SocialMedia[];
  // Propriedades adicionais para UI
  avatarUrl?: string;
  initials?: string;
  lastActivity?: string;
  description?: string;
  recent_captions?: {
    id: string;
    content: string;
    platform: string;
    created_at: string;
  }[];
};

export interface SocialMedia {
  id?: string;
  client_id: string;
  platform: string;
  username: string;
  created_at?: string;
  updated_at?: string;
  // Propriedade para compatibilidade com código legado
  type?: string;
}

export interface Persona {
  id?: string;
  client_id: string;
  tone?: string;
  target_audience?: string;
  values?: string;
  keywords?: string[] | string;
  created_at?: string;
  updated_at?: string;
  // Propriedade para compatibilidade com código legado
  targetAudience?: string;
}

export interface Caption {
  id: string;
  client_id: string;
  content: string;
  platform: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  client?: Client;
  image_url?: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  platform: string;
  client: string;
} 