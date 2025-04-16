import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Linkedin, CalendarIcon, Pencil, Trash2, Clock, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { getClients, getScheduledCaptions, updateCaption } from '@/lib/supabase/database';
import { supabase } from '@/lib/supabase/client';
import { Client, ContentStatus, Caption } from '@/types';

// Interface para conteúdo programado
interface ScheduledPost {
  id: string;
  title: string;
  description: string;
  platform: string;
  client_id: string;
  client_name: string;
  status: ContentStatus;
  scheduled_for: string;
  created_at: string;
  updated_at?: string;
}

const ContentSchedule = () => {
  const { toast } = useToast();
  
  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  
  // Estados para os filtros
  const [filters, setFilters] = useState({
    client: '',
    platform: '',
    status: 'scheduled' as ContentStatus | ''
  });
  
  // Form para agendar novo conteúdo
  const [scheduleForm, setScheduleForm] = useState({
    client: "",
    platform: "instagram",
    title: "",
    description: "",
    scheduledDate: new Date(),
  });
  
  // Carregar conteúdos agendados do Supabase
  const loadScheduledPosts = async () => {
    setIsLoading(true);
    try {
      const scheduledEvents = await getScheduledCaptions();
      
      // Filtrar os eventos de acordo com os filtros aplicados
      const filteredEvents = scheduledEvents.filter(event => {
        let match = true;
        
        if (filters.client && event.client_id !== filters.client) {
          match = false;
        }
        
        if (filters.platform && event.platform !== filters.platform) {
          match = false;
        }
        
        if (filters.status && event.status !== filters.status) {
          match = false;
        }
        
        return match;
      });
      
      // Converter para o formato de exibição
      const displayPosts: ScheduledPost[] = filteredEvents.map(event => ({
        id: event.id,
        title: event.title || 'Postagem sem título',
        description: event.content || '',
        platform: event.platform,
        client_id: event.client_id,
        client_name: event.client || 'Cliente',
        status: (event.status || 'scheduled') as ContentStatus,
        scheduled_for: event.scheduled_for || event.date,
        created_at: event.created_at || new Date().toISOString()
      }));
      
      setScheduledPosts(displayPosts);
      console.log('Postagens programadas carregadas:', displayPosts.length);
    } catch (error) {
      console.error('Erro ao carregar postagens programadas:', error);
      toast.error('Erro ao carregar postagens programadas');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar conteúdos ao iniciar e quando os filtros mudarem
  useEffect(() => {
    loadScheduledPosts();
  }, [filters]);
  
  // Carregar clientes do Supabase
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const clients = await getClients();
        if (clients && Array.isArray(clients)) {
          setAvailableClients(clients);
        } else {
          toast.error("Erro ao carregar clientes");
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        toast.error("Erro ao carregar clientes");
      } finally {
        setIsLoadingClients(false);
      }
    };
    
    fetchClients();
  }, []);
  
  // Aplicar filtros
  const applyFilters = () => {
    // Os filtros já são aplicados no useEffect
    console.log('Aplicando filtros:', filters);
  };
  
  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      client: '',
      platform: '',
      status: 'scheduled'
    });
  };
  
  // Formatar data para exibição
  const formatScheduleDate = (dateString?: string) => {
    if (!dateString) return 'Data não definida';
    
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const daysDiff = differenceInDays(date, now);
      
      let prefix = '';
      if (isAfter(date, now)) {
        if (daysDiff === 0) prefix = 'Hoje, ';
        else if (daysDiff === 1) prefix = 'Amanhã, ';
        else prefix = `Em ${daysDiff} dias, `;
      } else {
        prefix = 'Já passou! ';
      }
      
      return prefix + format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };
  
  // Obter ícone da plataforma
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-[#E1306C]" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 text-[#1877F2]" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-[#0A66C2]" />;
      default:
        return null;
    }
  };
  
  // Obter badge para status
  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'scheduled':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Agendado</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" />Publicado</Badge>;
      case 'failed':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Falhou</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };
  
  // Abrir diálogo para agendar novo conteúdo
  const handleOpenScheduleDialog = () => {
    setScheduleForm({
      client: "",
      platform: "instagram",
      title: "",
      description: "",
      scheduledDate: new Date(),
    });
    
    setIsScheduleDialogOpen(true);
  };
  
  // Salvar novo conteúdo agendado
  const handleScheduleSubmit = async () => {
    // Validações iniciais
    if (!scheduleForm.client) {
      toast.error("Por favor, selecione um cliente");
      return;
    }
    
    if (!scheduleForm.title) {
      toast.error("Por favor, digite um título para a postagem");
      return;
    }
    
    // Mostrar toast de carregamento
    const loadingToast = toast.loading("Agendando postagem...");
    
    try {
      // Preparar nova postagem
      const newPost = {
        title: scheduleForm.title,
        content: scheduleForm.description,
        platform: scheduleForm.platform,
        client_id: scheduleForm.client,
        status: 'scheduled' as ContentStatus,
        scheduled_for: scheduleForm.scheduledDate.toISOString()
      };
      
      // Inserir na tabela captions (mantemos a mesma tabela para compatibilidade)
      const { data, error } = await supabase
        .from('captions')
        .insert([{
          ...newPost,
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.dismiss(loadingToast);
      toast.success("Postagem agendada com sucesso!");
      
      // Recarregar postagens
      loadScheduledPosts();
      setIsScheduleDialogOpen(false);
    } catch (error) {
      console.error('Erro ao agendar postagem:', error);
      toast.dismiss(loadingToast);
      toast.error("Erro ao agendar postagem");
    }
  };
  
  // Abrir diálogo de edição
  const handleEditPost = (post: ScheduledPost) => {
    setSelectedPost(post);
    
    // Preparar formulário com dados da postagem selecionada
    setScheduleForm({
      client: post.client_id,
      platform: post.platform,
      title: post.title,
      description: post.description,
      scheduledDate: parseISO(post.scheduled_for)
    });
    
    setIsEditDialogOpen(true);
  };
  
  // Atualizar postagem existente
  const handleUpdatePost = async () => {
    if (!selectedPost) return;
    
    const loadingToast = toast.loading("Atualizando postagem...");
    
    try {
      const updatedData = {
        title: scheduleForm.title,
        content: scheduleForm.description,
        platform: scheduleForm.platform,
        scheduled_for: scheduleForm.scheduledDate.toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('captions')
        .update(updatedData)
        .eq('id', selectedPost.id);
      
      if (error) throw error;
      
      toast.dismiss(loadingToast);
      toast.success("Postagem atualizada com sucesso!");
      loadScheduledPosts();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar postagem:', error);
      toast.dismiss(loadingToast);
      toast.error("Erro ao atualizar postagem");
    }
  };
  
  // Marcar como publicado
  const handleMarkAsPublished = async (post: ScheduledPost) => {
    try {
      // Atualizar status
      const { error } = await supabase
        .from('captions')
        .update({ 
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);
      
      if (error) throw error;
      
      toast.success("Postagem marcada como publicada!");
      loadScheduledPosts();
    } catch (error) {
      console.error('Erro ao marcar como publicado:', error);
      toast.error("Erro ao atualizar status da postagem");
    }
  };
  
  // Excluir postagem
  const handleDeletePost = async (post: ScheduledPost) => {
    if (confirm(`Tem certeza que deseja excluir a postagem "${post.title}"?`)) {
      try {
        const { error } = await supabase
          .from('captions')
          .delete()
          .eq('id', post.id);
        
        if (error) throw error;
        
        toast.success("Postagem excluída com sucesso!");
        loadScheduledPosts();
      } catch (error) {
        console.error('Erro ao excluir postagem:', error);
        toast.error("Erro ao excluir postagem");
      }
    }
  };
  
  return (
    <Layout>
      <PageHeader 
        title="Programação de Conteúdo" 
        description="Programe e gerencie as postagens futuras para cada cliente"
        icon={<CalendarIcon className="h-6 w-6" />}
      />
      
      <div className="grid gap-4 mb-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Postagens Programadas</CardTitle>
              <Button onClick={handleOpenScheduleDialog}>Nova Programação</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1">
                <Label htmlFor="clientFilter">Cliente</Label>
                <Select
                  value={filters.client}
                  onValueChange={(value) => setFilters({...filters, client: value})}
                >
                  <SelectTrigger id="clientFilter">
                    <SelectValue placeholder="Todos os clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os clientes</SelectItem>
                    {availableClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="platformFilter">Plataforma</Label>
                <Select
                  value={filters.platform}
                  onValueChange={(value) => setFilters({...filters, platform: value})}
                >
                  <SelectTrigger id="platformFilter">
                    <SelectValue placeholder="Todas as plataformas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as plataformas</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Label htmlFor="statusFilter">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({...filters, status: value as ContentStatus | ''})}
                >
                  <SelectTrigger id="statusFilter">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="failed">Falhou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Plataforma</TableHead>
                      <TableHead>Data Programada</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledPosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <AlertCircle className="h-6 w-6" />
                            <p>Nenhuma postagem programada encontrada</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={handleOpenScheduleDialog}
                            >
                              Criar nova programação
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      scheduledPosts.map(post => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>{post.client_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getPlatformIcon(post.platform)}
                              <span className="capitalize">{post.platform}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatScheduleDate(post.scheduled_for)}</TableCell>
                          <TableCell>{getStatusBadge(post.status)}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditPost(post)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            
                            {post.status !== 'published' && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleMarkAsPublished(post)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeletePost(post)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Diálogo para nova programação */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agendar Nova Postagem</DialogTitle>
            <DialogDescription>
              Programe uma postagem para ser publicada em data e horário específicos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={scheduleForm.client}
                onValueChange={(value) => setScheduleForm({...scheduleForm, client: value})}
                disabled={isLoadingClients}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingClients ? (
                    <SelectItem value="loading" disabled>Carregando clientes...</SelectItem>
                  ) : (
                    availableClients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="platform">Plataforma</Label>
              <Select
                value={scheduleForm.platform}
                onValueChange={(value) => setScheduleForm({...scheduleForm, platform: value})}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Selecione uma plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Título da Postagem</Label>
              <Input
                id="title"
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
                placeholder="Um título que identifique a postagem"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição da Postagem</Label>
              <Textarea
                id="description"
                value={scheduleForm.description}
                onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                placeholder="Descreva o conteúdo da postagem"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="scheduledDate">Data e Hora</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={format(scheduleForm.scheduledDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : new Date();
                  setScheduleForm({...scheduleForm, scheduledDate: date});
                }}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleScheduleSubmit}>Agendar Postagem</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Postagem Agendada</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da postagem programada.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-client">Cliente</Label>
              <Select
                value={scheduleForm.client}
                onValueChange={(value) => setScheduleForm({...scheduleForm, client: value})}
                disabled={true} // Não permitir mudar o cliente
              >
                <SelectTrigger id="edit-client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {availableClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-platform">Plataforma</Label>
              <Select
                value={scheduleForm.platform}
                onValueChange={(value) => setScheduleForm({...scheduleForm, platform: value})}
              >
                <SelectTrigger id="edit-platform">
                  <SelectValue placeholder="Selecione uma plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título da Postagem</Label>
              <Input
                id="edit-title"
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
                placeholder="Um título que identifique a postagem"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição da Postagem</Label>
              <Textarea
                id="edit-description"
                value={scheduleForm.description}
                onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                placeholder="Descreva o conteúdo da postagem"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-scheduledDate">Data e Hora</Label>
              <Input
                id="edit-scheduledDate"
                type="datetime-local"
                value={format(scheduleForm.scheduledDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : new Date();
                  setScheduleForm({...scheduleForm, scheduledDate: date});
                }}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdatePost}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ContentSchedule; 