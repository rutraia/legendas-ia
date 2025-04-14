import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Filter, 
  Calendar,
  MessageSquarePlus,
  Loader2
} from 'lucide-react';
import CaptionCard from '@/components/CaptionCard';
import EmptyState from '@/components/EmptyState';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { getCaptions } from '@/lib/supabase/database';
import { toast } from 'sonner';
import { Caption } from '@/types';

const CaptionLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [captionsList, setCaptionsList] = useState<Caption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPlatforms, setFilterPlatforms] = useState<string[]>([]);
  const [filterScheduled, setFilterScheduled] = useState<'all' | 'scheduled' | 'unscheduled'>('all');
  
  useEffect(() => {
    // Função para carregar as legendas do Supabase
    const loadCaptions = async () => {
      setIsLoading(true);
      try {
        const data = await getCaptions();
        console.log("Legendas carregadas do Supabase:", data);
        
        if (data) {
          // Processar as legendas para o formato esperado
          const formattedCaptions = data.map(caption => {
            // Verificar se temos client info completo
            const clientName = caption.clients?.name || 'Cliente';
            
            return {
              ...caption,
              client: clientName,
              text: caption.content,  // Para compatibilidade com o componente CaptionCard
            };
          });
          
          setCaptionsList(formattedCaptions);
        }
      } catch (error) {
        console.error('Erro ao carregar legendas:', error);
        toast.error('Erro ao carregar legendas');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCaptions();
  }, []);
  
  const handleFilterPlatformChange = (platform: string) => {
    if (filterPlatforms.includes(platform)) {
      setFilterPlatforms(filterPlatforms.filter(p => p !== platform));
    } else {
      setFilterPlatforms([...filterPlatforms, platform]);
    }
  };
  
  const filteredCaptions = captionsList.filter(caption => {
    // Text search - now searching in content
    const captionText = caption.content || '';
    const clientName = caption.clients?.name || caption.client || '';
    
    const textMatch = captionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     clientName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Platform filter
    const platformMatch = filterPlatforms.length === 0 || filterPlatforms.includes(caption.platform);
    
    // Scheduled filter - adapt to our data model which might not have scheduledFor
    const scheduledMatch = filterScheduled === 'all';
    /* Implementar quando tivermos agendamento
    const scheduledMatch = 
      filterScheduled === 'all' ||
      (filterScheduled === 'scheduled' && caption.scheduledFor) ||
      (filterScheduled === 'unscheduled' && !caption.scheduledFor);
    */
    
    return textMatch && platformMatch && scheduledMatch;
  });
  
  return (
    <Layout>
      <PageHeader
        title="Biblioteca de Legendas"
        description="Gerencie todas as suas legendas em um só lugar"
      >
        <Link to="/caption-generator">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Legenda
          </Button>
        </Link>
      </PageHeader>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar legendas..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrar por plataforma</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-instagram" 
                      checked={filterPlatforms.includes('instagram')}
                      onCheckedChange={() => handleFilterPlatformChange('instagram')}
                    />
                    <Label htmlFor="filter-instagram" className="flex items-center">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-facebook" 
                      checked={filterPlatforms.includes('facebook')}
                      onCheckedChange={() => handleFilterPlatformChange('facebook')}
                    />
                    <Label htmlFor="filter-facebook" className="flex items-center">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="filter-linkedin" 
                      checked={filterPlatforms.includes('linkedin')}
                      onCheckedChange={() => handleFilterPlatformChange('linkedin')}
                    />
                    <Label htmlFor="filter-linkedin" className="flex items-center">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Label>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Agendamento</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {filterScheduled === 'all' && 'Todos'}
                        {filterScheduled === 'scheduled' && 'Agendados'}
                        {filterScheduled === 'unscheduled' && 'Não agendados'}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setFilterScheduled('all')}>
                        Todos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterScheduled('scheduled')}>
                        Agendados
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterScheduled('unscheduled')}>
                        Não agendados
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10"
            onClick={() => {
              setFilterPlatforms([]);
              setFilterScheduled('all');
              setSearchQuery('');
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando legendas...</span>
        </div>
      ) : filteredCaptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaptions.map((caption) => (
            <CaptionCard key={caption.id} caption={caption} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquarePlus className="h-8 w-8 text-muted-foreground" />}
          title={searchQuery || filterPlatforms.length > 0 || filterScheduled !== 'all' ? "Nenhuma legenda encontrada" : "Sua biblioteca está vazia"}
          description={searchQuery || filterPlatforms.length > 0 || filterScheduled !== 'all' ? "Tente ajustar seus filtros de busca" : "Comece criando sua primeira legenda"}
          actionLabel={!(searchQuery || filterPlatforms.length > 0 || filterScheduled !== 'all') ? "Criar Legenda" : undefined}
          actionLink="/caption-generator"
        />
      )}
    </Layout>
  );
};

export default CaptionLibrary;
