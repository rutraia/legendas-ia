import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  MessageSquarePlus, 
  Users, 
  Calendar, 
  Clock, 
  Instagram, 
  Facebook, 
  Linkedin,
  BookMarked,
  ChevronRight,
  Loader2 
} from 'lucide-react';
import ClientCard from '@/components/ClientCard';
import CaptionCard, { CaptionCardItem } from '@/components/CaptionCard';
import { getClients, getCaptions } from '@/lib/supabase/database';
import { Skeleton } from '@/components/ui/skeleton';

// Interface para as legendas vindas do Supabase
interface SupabaseCaption {
  id: string;
  client_id: string;
  content: string;
  platform: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  image_url?: string | null;
  scheduled_for?: string;
  clients?: {
    name: string;
    [key: string]: any;
  };
  client?: {
    name: string;
    [key: string]: any;
  };
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [captions, setCaptions] = useState<SupabaseCaption[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Carregar clientes
        const clientsData = await getClients();
        setClients(clientsData || []);
        
        // Carregar legendas
        const captionsData = await getCaptions();
        setCaptions(captionsData || []);
      } catch (err: any) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  // Filter for recent items
  const recentCaptions = captions.slice(0, 2);
  const recentClients = clients.slice(0, 2);
  
  // Count scheduled captions
  const scheduledCaptions = captions.filter(c => c.scheduled_for || c.status === 'scheduled').length;
  
  // Get unique platforms
  const platforms = new Set<string>();
  captions.forEach(caption => {
    if (caption.platform) {
      platforms.add(caption.platform.toLowerCase());
    }
  });
  
  const renderStatCard = (title: string, value: React.ReactNode, icon: React.ReactNode) => (
    <div className="flex flex-col p-3">
      <span className="text-muted-foreground text-sm">{title}</span>
      {isLoading ? (
        <Skeleton className="h-8 w-16 mt-1" />
      ) : (
        <div className="flex items-baseline">
          <span className="text-2xl font-bold mr-1">{value}</span>
          {icon}
        </div>
      )}
    </div>
  );
  
  // Função para adaptar as legendas do formato do banco de dados para o formato esperado pelo componente
  const adaptCaptionToCardFormat = (caption: SupabaseCaption): CaptionCardItem => ({
    id: caption.id,
    text: caption.content,
    client: caption.client?.name || caption.clients?.name || 'Cliente desconhecido',
    createdAt: caption.created_at || '',
    platform: caption.platform,
    imageUrl: caption.image_url,
    scheduledFor: caption.scheduled_for
  });
  
  return (
    <Layout>
      <PageHeader
        title="Dashboard"
        description="Bem-vindo ao seu painel de controle"
      />
      
      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/caption-generator" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <MessageSquarePlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Criar Legendas</h3>
                <p className="text-sm text-muted-foreground">Gerar novas legendas para suas redes sociais</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/clients" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Gerenciar Clientes</h3>
                <p className="text-sm text-muted-foreground">Visualizar e editar perfis de clientes</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/calendar" className="block">
          <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="p-6 flex items-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Calendário</h3>
                <p className="text-sm text-muted-foreground">Visualizar e gerenciar seu calendário de conteúdo</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>
      
      {/* Stats Overview */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {renderStatCard("Clientes", clients.length, <Users className="h-4 w-4 text-muted-foreground" />)}
              {renderStatCard("Legendas", captions.length, <BookMarked className="h-4 w-4 text-muted-foreground" />)}
              {renderStatCard("Agendados", scheduledCaptions, <Clock className="h-4 w-4 text-muted-foreground" />)}
              
              <div className="flex flex-col p-3">
                <span className="text-muted-foreground text-sm">Plataformas</span>
                <div className="flex gap-2 mt-1">
                  {platforms.has('instagram') && <Instagram className="h-5 w-5 text-[#E1306C]" />}
                  {platforms.has('facebook') && <Facebook className="h-5 w-5 text-[#1877F2]" />}
                  {platforms.has('linkedin') && <Linkedin className="h-5 w-5 text-[#0A66C2]" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Recent Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Clients */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Clientes Recentes</h2>
            <Link to="/clients">
              <Button variant="ghost" className="flex items-center text-sm h-8 px-2">
                Ver todos
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                Erro ao carregar clientes: {error}
              </div>
            ) : recentClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            ) : (
              recentClients.map((client) => (
                <ClientCard 
                  key={client.id} 
                  client={{
                    id: client.id,
                    name: client.name,
                    initials: client.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'N/A',
                    industry: client.industry || 'N/A',
                    socialMedia: client.social_media || [],
                    lastActivity: client.updated_at ? new Date(client.updated_at).toLocaleDateString('pt-BR') : 'N/A'
                  }} 
                />
              ))
            )}
          </div>
        </section>
        
        {/* Recent Captions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Legendas Recentes</h2>
            <Link to="/caption-library">
              <Button variant="ghost" className="flex items-center text-sm h-8 px-2">
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                Erro ao carregar legendas: {error}
              </div>
            ) : recentCaptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma legenda encontrada
              </div>
            ) : (
              recentCaptions.map((caption) => (
                <CaptionCard 
                  key={caption.id} 
                  caption={adaptCaptionToCardFormat(caption)} 
                />
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
