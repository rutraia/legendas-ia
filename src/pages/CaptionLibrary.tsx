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
  Calendar as CalendarLucideIcon,
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
import { getCaptions, updateCaption, getClients } from '@/lib/supabase/database';
import { toast } from 'sonner';
import { Caption, Client } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover as DatePopover,
  PopoverContent as DatePopoverContent,
  PopoverTrigger as DatePopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';

interface CaptionCardItem {
  id: string;
  text: string;
  client: string;
  platform: string;
  createdAt: string;
  scheduledFor?: string;
  [key: string]: any;
}

const CaptionLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [captionsList, setCaptionsList] = useState<Caption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPlatforms, setFilterPlatforms] = useState<string[]>([]);
  const [filterScheduled, setFilterScheduled] = useState<'all' | 'scheduled' | 'unscheduled'>('all');
  const [selectedCaption, setSelectedCaption] = useState<Caption | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);

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
            const clientName = caption.clients?.name || caption.client || 'Cliente';
            
            return {
              ...caption,
              client: clientName,
              text: caption.content,  // Para compatibilidade com o componente CaptionCard
              createdAt: caption.created_at || new Date().toISOString(),
              scheduledFor: caption.scheduled_for
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
    
    // Carregar clientes
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const clients = await getClients();
        if (clients && Array.isArray(clients)) {
          setAvailableClients(clients);
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setIsLoadingClients(false);
      }
    };
    
    fetchClients();
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
    let clientNameStr = '';
    
    if (typeof caption.client === 'string') {
      clientNameStr = caption.client;
    } else if (caption.clients?.name) {
      clientNameStr = caption.clients.name;
    } else {
      clientNameStr = 'Cliente';
    }
    
    const textMatch = captionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     clientNameStr.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Platform filter
    const platformMatch = filterPlatforms.length === 0 || filterPlatforms.includes(caption.platform);
    
    // Scheduled filter
    const scheduledMatch = 
      filterScheduled === 'all' ||
      (filterScheduled === 'scheduled' && caption.scheduled_for) ||
      (filterScheduled === 'unscheduled' && !caption.scheduled_for);
    
    return textMatch && platformMatch && scheduledMatch;
  });

  // Função para abrir o diálogo de agendamento
  const handleScheduleCaption = (caption: Caption) => {
    setSelectedCaption(caption);
    setDate(caption.scheduled_for ? new Date(caption.scheduled_for) : undefined);
    setIsScheduleDialogOpen(true);
  };

  // Função para salvar a data de agendamento
  const handleSaveSchedule = async () => {
    if (!selectedCaption) return;

    const loadingToast = toast.loading('Atualizando agendamento...');
    
    try {
      const updatedCaption = {
        ...selectedCaption,
        scheduled_for: date ? date.toISOString() : null
      };
      
      await updateCaption(updatedCaption);
      
      // Atualizar a lista local
      setCaptionsList(prevList => prevList.map(c => 
        c.id === selectedCaption.id ? {...c, scheduled_for: date?.toISOString()} : c
      ));
      
      toast.dismiss(loadingToast);
      toast.success(date ? 'Conteúdo agendado com sucesso' : 'Agendamento removido');
      setIsScheduleDialogOpen(false);
      
      // Adicionar ao localStorage para compatibilidade com o calendário existente
      if (date) {
        // Obter legendas existentes do localStorage
        const currentCaptions = localStorage.getItem('captions')
          ? JSON.parse(localStorage.getItem('captions') || '[]')
          : [];
        
        // Verificar se a legenda já existe no localStorage
        const existingIndex = currentCaptions.findIndex((c: any) => c.id === selectedCaption.id);
        
        // Preparar o objeto para o localStorage
        const localCaption = {
          id: selectedCaption.id,
          text: selectedCaption.content,
          client: typeof selectedCaption.client === 'string' ? selectedCaption.client : 'Cliente',
          createdAt: selectedCaption.created_at || new Date().toISOString(),
          platform: selectedCaption.platform,
          scheduledFor: date.toISOString()
        };
        
        // Atualizar ou adicionar a legenda no localStorage
        if (existingIndex >= 0) {
          currentCaptions[existingIndex] = localCaption;
        } else {
          currentCaptions.push(localCaption);
        }
        
        // Salvar no localStorage
        localStorage.setItem('captions', JSON.stringify(currentCaptions));
      }
    } catch (error) {
      console.error('Erro ao agendar legenda:', error);
      toast.dismiss(loadingToast);
      toast.error('Erro ao agendar conteúdo. Tente novamente.');
    }
  };

  // Handler para abrir o diálogo de edição
  const handleEditCaption = (caption: Caption) => {
    setSelectedCaption(caption);
    setEditContent(caption.content || "");
    setEditDate(caption.scheduled_for ? new Date(caption.scheduled_for) : undefined);
    setIsEditDialogOpen(true);
  };

  // Handler para salvar edição
  const handleSaveEdit = async () => {
    if (!selectedCaption) return;
    const loadingToast = toast.loading('Salvando edição...');
    try {
      const updatedCaption = {
        id: selectedCaption.id, // garantir que o id está presente
        content: editContent,
        scheduled_for: editDate ? editDate.toISOString() : null
      };
      await updateCaption(updatedCaption); // garantir que só os campos válidos são enviados
      setCaptionsList(prevList => prevList.map(c => 
        c.id === selectedCaption.id 
          ? { ...c, content: editContent, scheduled_for: editDate ? editDate.toISOString() : null } 
          : c
      ));
      toast.dismiss(loadingToast);
      toast.success('Legenda editada com sucesso');
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Erro ao salvar edição');
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Programação de Conteúdo"
        description="Gerencie e programe todas as suas legendas em um só lugar"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/calendar'}>
            <CalendarLucideIcon className="h-4 w-4 mr-2" />
            Ver Calendário
          </Button>
          <Link to="/caption-generator">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conteúdo
            </Button>
          </Link>
        </div>
      </PageHeader>
      
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar conteúdo..."
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
          <span className="ml-2">Carregando conteúdos...</span>
        </div>
      ) : filteredCaptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCaptions.map((caption) => {
            // Preparar objeto compatível com CaptionCardItem
            const captionCardItem: CaptionCardItem = {
              id: caption.id,
              text: caption.content || '',
              client: typeof caption.client === 'string' ? caption.client : (caption.clients?.name || 'Cliente'),
              createdAt: caption.created_at || new Date().toISOString(),
              platform: caption.platform,
              scheduledFor: caption.scheduled_for
            };
            
            return (
              <CaptionCard 
                key={caption.id} 
                caption={captionCardItem}
                onEdit={(id, text) => handleEditCaption(caption)}
                onDelete={async (id) => {
                  // Remover do banco de dados se necessário (implemente sua lógica aqui)
                  setCaptionsList(prev => prev.filter(c => c.id !== id));
                  toast.success('Legenda apagada com sucesso');
                }}
                onSchedule={() => handleScheduleCaption(caption)}
                scheduled={!!caption.scheduled_for}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquarePlus className="h-8 w-8 text-muted-foreground" />}
          title={searchQuery || filterPlatforms.length > 0 || filterScheduled !== 'all' ? "Nenhum conteúdo encontrado" : "Sua programação está vazia"}
          description={searchQuery || filterPlatforms.length > 0 || filterScheduled !== 'all' ? "Tente ajustar seus filtros de busca" : "Comece criando seu primeiro conteúdo"}
          actionLabel={!(searchQuery || filterPlatforms.length > 0 || filterScheduled !== 'all') ? "Criar Conteúdo" : undefined}
          actionLink="/caption-generator"
        />
      )}

      {/* Diálogo de agendamento */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Conteúdo</DialogTitle>
            <DialogDescription>
              Selecione a data para agendar este conteúdo no calendário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedCaption && (
              <div className="flex flex-col space-y-2">
                <Label>Conteúdo</Label>
                <div className="border rounded-md p-2 text-sm">
                  {selectedCaption.content}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Label>Cliente:</Label>
                  <span className="text-sm">{typeof selectedCaption.client === 'string' ? selectedCaption.client : 'Cliente'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label>Plataforma:</Label>
                  <div className="flex items-center">
                    {selectedCaption.platform === 'instagram' && <Instagram className="h-4 w-4 mr-1 text-[#E1306C]" />}
                    {selectedCaption.platform === 'facebook' && <Facebook className="h-4 w-4 mr-1 text-[#1877F2]" />}
                    {selectedCaption.platform === 'linkedin' && <Linkedin className="h-4 w-4 mr-1 text-[#0A66C2]" />}
                    <span className="text-sm capitalize">{selectedCaption.platform}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border-t pt-4">
              <Label>Data de publicação</Label>
              <div className="flex justify-center pt-2">
                <DatePopover>
                  <DatePopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarLucideIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </DatePopoverTrigger>
                  <DatePopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </DatePopoverContent>
                </DatePopover>
              </div>
              
              {date && (
                <div className="text-center mt-2 text-sm text-muted-foreground">
                  {format(date, "EEEE", { locale: ptBR })}
                </div>
              )}
              
              {selectedCaption?.scheduled_for && !date && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2 text-destructive border-destructive/50 hover:bg-destructive/10"
                  onClick={() => setDate(undefined)}
                >
                  Remover agendamento
                </Button>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveSchedule}>
              Salvar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Legenda</DialogTitle>
            <DialogDescription>
              Altere o conteúdo e a data de agendamento desta legenda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="edit-content">Conteúdo</Label>
            <Input
              id="edit-content"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            <Label>Data de publicação</Label>
            <DatePopover>
              <DatePopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !editDate && "text-muted-foreground"
                  )}
                >
                  <CalendarLucideIcon className="mr-2 h-4 w-4" />
                  {editDate ? format(editDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </DatePopoverTrigger>
              <DatePopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={editDate}
                  onSelect={setEditDate}
                  initialFocus
                />
              </DatePopoverContent>
            </DatePopover>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CaptionLibrary;
