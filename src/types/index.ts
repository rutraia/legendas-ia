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
  title: string;
  created_at?: string;
  updated_at?: string;
  scheduled_for?: string;
  client?: Client;
  clients?: Client;
  image_url?: string | null;
  // Propriedades para compatibilidade com componentes existentes
  text?: string;
  createdAt?: string;
  scheduledFor?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  platform: string;
  client: string;
  // Propriedades adicionais para legendas agendadas
  content?: string;       // Conteúdo completo da legenda
  client_id?: string;     // ID do cliente
  status?: ContentStatus; // Status da publicação
  created_at?: string;    // Data de criação
}

// Status do conteúdo para padronizar em toda a aplicação
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed';

// Interface unificada para conteúdo agendado
export interface ScheduledContent extends Omit<Caption, 'id'> {
  id?: string;  // Opcional para criação (será gerado pelo backend)
  client_id: string;
  client_name?: string; // Nome do cliente para exibição
  content: string;      // Texto do conteúdo
  platform: string;     // instagram, facebook, linkedin
  status: ContentStatus;
  title: string;        // Título curto para o calendário (obrigatório)
  created_at: string;   // ISO string
  updated_at?: string;  // ISO string
  scheduled_for: string; // ISO string
  image_url?: string | null;
} 