import { Client } from '@/components/ClientCard';
import { Caption } from '@/components/CaptionCard';
import { generateId } from './utils';

// Interfaces
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  platform: string;
  client: string;
}

// Sample clients data
export const clients: Client[] = [
  {
    id: generateId(),
    name: 'Café Aroma',
    initials: 'CA',
    industry: 'Gastronomia',
    socialMedia: [
      { type: 'instagram', username: '@cafearoma' },
      { type: 'facebook', username: '@cafearoma' }
    ],
    lastActivity: '12/04/2025'
  },
  {
    id: generateId(),
    name: 'Moda Bella',
    initials: 'MB',
    industry: 'Moda',
    socialMedia: [
      { type: 'instagram', username: '@modabella' },
      { type: 'facebook', username: '@modabella' },
      { type: 'linkedin', username: '@modabella-oficial' }
    ],
    lastActivity: '10/04/2025'
  },
  {
    id: generateId(),
    name: 'Tech Solutions',
    initials: 'TS',
    industry: 'Tecnologia',
    socialMedia: [
      { type: 'linkedin', username: '@techsolutions' },
      { type: 'instagram', username: '@techsolutions_br' }
    ],
    lastActivity: '08/04/2025'
  },
  {
    id: generateId(),
    name: 'Fitness Club',
    initials: 'FC',
    industry: 'Saúde e Bem-estar',
    socialMedia: [
      { type: 'instagram', username: '@fitnessclub' },
      { type: 'facebook', username: '@fitnesscluboficial' }
    ],
    lastActivity: '11/04/2025'
  }
];

// Sample captions data
export const captions: Caption[] = [
  {
    id: generateId(),
    text: 'O café perfeito para começar a semana com energia e disposição! ☕ #CaféAroma #SegundaFeira #BomDia',
    client: 'Café Aroma',
    createdAt: '2025-04-10',
    platform: 'instagram',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    scheduledFor: '2025-04-15'
  },
  {
    id: generateId(),
    text: 'Nossa nova coleção de verão acaba de chegar! Peças exclusivas para você arrasar na estação mais quente do ano. 🌞👗 #ModaBella #NovaColecao #Verao2025',
    client: 'Moda Bella',
    createdAt: '2025-04-08',
    platform: 'instagram',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050'
  },
  {
    id: generateId(),
    text: 'Transformando desafios em soluções inovadoras. Conheça nossos cases de sucesso e descubra como podemos impulsionar o seu negócio. 💡💻 #TechSolutions #Inovacao #Tecnologia',
    client: 'Tech Solutions',
    createdAt: '2025-04-11',
    platform: 'linkedin'
  },
  {
    id: generateId(),
    text: 'Treinar não é apenas sobre mudar seu corpo, é sobre mudar sua mentalidade. 💪 Venha fazer parte da nossa comunidade! #FitnessClub #Motivacao #Saude',
    client: 'Fitness Club',
    createdAt: '2025-04-09',
    platform: 'facebook',
    scheduledFor: '2025-04-17'
  }
];

// Helper functions for client data persistence
export const saveClientsToStorage = (updatedClients: Client[]) => {
  localStorage.setItem('clients', JSON.stringify(updatedClients));
};

export const getClientsFromStorage = (): Client[] => {
  const storedClients = localStorage.getItem('clients');
  if (storedClients) {
    return JSON.parse(storedClients);
  }
  return clients; // Fallback to mock data if nothing in storage
};

// Sample client detailed data - used for client profile
export const getClientDetails = (id: string) => {
  // First check in localStorage
  const allClients = getClientsFromStorage();
  const client = allClients.find(c => c.id === id);
  
  if (!client) return null;
  
  // Verificar se o cliente tem informações personalizadas de persona
  const customPersona = (client as any).customPersona;
  
  // Gerar personas padrão com base na indústria (fallback)
  const defaultTone = client.industry === 'Gastronomia' ? 'Caloroso e acolhedor' : 
    client.industry === 'Moda' ? 'Sofisticado e atual' :
    client.industry === 'Tecnologia' ? 'Profissional e inovador' : 'Motivador e energético';
    
  const defaultKeywords = client.industry === 'Gastronomia' ? ['café', 'aconchego', 'sabor', 'experiência'] : 
    client.industry === 'Moda' ? ['estilo', 'tendência', 'elegância', 'exclusividade'] :
    client.industry === 'Tecnologia' ? ['inovação', 'solução', 'tecnologia', 'futuro'] : 
    ['saúde', 'bem-estar', 'motivação', 'fitness'];
    
  const defaultTargetAudience = client.industry === 'Gastronomia' ? 'Adultos de 25 a 45 anos que valorizam momentos de pausa e qualidade.' : 
    client.industry === 'Moda' ? 'Mulheres de 20 a 35 anos que buscam elegância e exclusividade.' :
    client.industry === 'Tecnologia' ? 'Empresas e profissionais que buscam inovação tecnológica.' : 
    'Pessoas de 18 a 40 anos interessadas em saúde e bem-estar.';
    
  const defaultValues = client.industry === 'Gastronomia' ? 'Qualidade, tradição e experiência sensorial.' : 
    client.industry === 'Moda' ? 'Sustentabilidade, inovação e exclusividade.' :
    client.industry === 'Tecnologia' ? 'Inovação, eficiência e orientação ao cliente.' : 
    'Saúde, bem-estar e superação.';
  
  return {
    ...client,
    description: `${client.name} é uma empresa de ${client.industry.toLowerCase()} comprometida com a excelência e inovação.`,
    persona: {
      // Usar dados personalizados se disponíveis, senão usar os padrões
      tone: customPersona?.tone || defaultTone,
      keywords: customPersona?.keywords || defaultKeywords,
      targetAudience: customPersona?.targetAudience || defaultTargetAudience,
      values: customPersona?.values || defaultValues
    },
    recentCaptions: captions.filter(caption => caption.client === client.name)
  };
};

// Sample calendar events
export function getCalendarEvents(): CalendarEvent[] {
  // Obter legendas do localStorage, se disponíveis
  const storedCaptions = localStorage.getItem('captions');
  const allCaptions = storedCaptions ? JSON.parse(storedCaptions) : captions;
  
  // Filtrar apenas as legendas que têm data de agendamento
  return allCaptions
    .filter((caption: Caption) => caption.scheduledFor)
    .map((caption: Caption) => ({
      id: caption.id,
      title: caption.text.substring(0, 30) + (caption.text.length > 30 ? '...' : ''),
      date: caption.scheduledFor,
      platform: caption.platform,
      client: caption.client,
    }));
}
