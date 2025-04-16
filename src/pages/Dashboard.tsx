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
        title={<span className="flex items-center gap-2 text-2xl font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">Dashboard <span className="text-base font-normal text-muted-foreground">/ visão geral</span></span>}
        description={<span className="text-muted-foreground text-lg animate-fade-in-up">Bem-vindo ao seu painel de controle! Veja rapidamente seus dados e acesse as principais funções.</span>}
      />
      
      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8 animate-fade-in-up">
        <Link to="/caption-generator" className="block group">
          <Card className="h-full hover:border-primary/80 transition-all cursor-pointer shadow-lg group-hover:scale-[1.02] group-hover:shadow-xl bg-gradient-to-br from-primary/5 to-background/80">
            <CardContent className="p-7 flex items-center">
              <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mr-5 shadow">
                <MessageSquarePlus className="h-7 w-7 text-primary animate-fade-in" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary">Criar Legendas</h3>
                <p className="text-sm text-muted-foreground">Gerar novas legendas para suas redes sociais</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/clients" className="block group">
          <Card className="h-full hover:border-accent/80 transition-all cursor-pointer shadow-lg group-hover:scale-[1.02] group-hover:shadow-xl bg-gradient-to-br from-accent/10 to-background/80">
            <CardContent className="p-7 flex items-center">
              <div className="h-14 w-14 bg-accent/10 rounded-full flex items-center justify-center mr-5 shadow">
                <Users className="h-7 w-7 text-accent animate-fade-in" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-accent">Clientes</h3>
                <p className="text-sm text-muted-foreground">Gerencie seus clientes e suas personas</p>
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
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[120px]">
              {renderStatCard(
                "Clientes",
                <span className="text-3xl font-bold text-primary animate-fade-in-up">{clients.length}</span>,
                <Users className="h-6 w-6 text-primary bg-primary/10 rounded-full p-1 shadow-md animate-fade-in" />
              )}
              {renderStatCard(
                "Agendados",
                <span className="text-3xl font-bold text-primary animate-fade-in-up">{scheduledCaptions}</span>,
                <Clock className="h-6 w-6 text-primary bg-primary/10 rounded-full p-1 shadow-md animate-fade-in" />
              )}
              <div className="flex flex-col p-3 justify-center items-center bg-gradient-to-br from-primary/10 to-accent/40 rounded-xl shadow-md animate-fade-in">
                <span className="text-muted-foreground text-sm mb-2">Plataformas</span>
                <div className="flex gap-4 mt-1">
                  {platforms.has('instagram') && <Instagram className="h-7 w-7 text-[#E1306C] bg-white dark:bg-background rounded-full shadow animate-fade-in" />}
                  {platforms.has('facebook') && <Facebook className="h-7 w-7 text-[#1877F2] bg-white dark:bg-background rounded-full shadow animate-fade-in" />}
                  {platforms.has('linkedin') && <Linkedin className="h-7 w-7 text-[#0A66C2] bg-white dark:bg-background rounded-full shadow animate-fade-in" />}
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
        <section className="animate-fade-in-up">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Programação Recentes
              </CardTitle>
              <Link to="/caption-library">
                <Button variant="ghost" className="flex items-center text-sm h-8 px-2">
                  Ver todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                {isLoading ? (
                  <>
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </>
                ) : error ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Erro ao carregar programações: {error}
                  </div>
                ) : recentCaptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma programação encontrada
                  </div>
                ) : (
                  recentCaptions.map((caption) => (
                    <CaptionCard key={caption.id} caption={adaptCaptionToCardFormat(caption)} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
