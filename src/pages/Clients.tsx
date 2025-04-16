import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users } from 'lucide-react';
import ClientCard from '@/components/ClientCard';
import EmptyState from '@/components/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { generateId } from '@/lib/utils';
import { toast } from "sonner";
import { Client } from '@/types';
import { getClients, createClient, updateSocialMedia, deleteClient } from '@/lib/supabase/database';
import { supabase, ensureAuthenticated } from '@/lib/supabase/client';

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  
  // New client form state
  const [newClientName, setNewClientName] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [newClientInstagram, setNewClientInstagram] = useState('');
  const [newClientFacebook, setNewClientFacebook] = useState('');
  const [newClientLinkedin, setNewClientLinkedin] = useState('');
  
  // Verificar autenticação ao inicializar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Usar nossa nova função helper
        const user = await ensureAuthenticated();
        console.log('Autenticado com usuário:', user);
        setIsAuthenticated(true);
        
        // Iniciar carregamento dos clientes
        loadClients();
      } catch (error) {
        console.error('Erro ao autenticar:', error);
        setIsAuthenticated(false);
        toast.error('Falha na autenticação. Tente novamente mais tarde.');
      }
    };
    
    checkAuth();
  }, []);
  
  // Carregar clientes do Supabase
  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await getClients();
      
      // Processar os dados para remover duplicatas de redes sociais
      const processedData = data ? data.map(client => {
        // Se não tiver redes sociais, retornar o cliente como está
        if (!client.social_media || !Array.isArray(client.social_media) || client.social_media.length === 0) {
          return client;
        }
        
        // Normalizar e filtrar redes sociais duplicadas
        const normalizedSocialMedia = client.social_media.map(sm => ({
          ...sm,
          normalizedType: (sm.platform || sm.type || '').toLowerCase()
        }));
        
        // Usar reduce para eliminar duplicatas
        const uniqueSocialMedia = normalizedSocialMedia.reduce((acc, current) => {
          const isDuplicate = acc.find(item => item.normalizedType === current.normalizedType);
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, [] as any[]);
        
        // Retornar cliente com redes sociais filtradas
        return {
          ...client,
          social_media: uniqueSocialMedia,
          socialMedia: uniqueSocialMedia // para compatibilidade
        };
      }) : [];
      
      setClients(processedData);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', {
        message: error.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      toast.error(`Erro ao carregar clientes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteClient = async (id: string) => {
    try {
      setIsDeletingClient(true);
      console.log('Iniciando exclusão do cliente:', id);
      
      const result = await deleteClient(id);
      
      if (result) {
        // Atualizar a lista de clientes após excluir
        setClients(prev => prev.filter(client => client.id !== id));
        toast.success('Cliente excluído com sucesso');
      } else {
        throw new Error('Falha ao excluir cliente');
      }
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error);
      toast.error(`Erro ao excluir cliente: ${error.message}`);
    } finally {
      setIsDeletingClient(false);
    }
  };
  
  const handleCreateClient = async () => {
    // Validação dos campos obrigatórios
    if (!newClientName.trim()) {
      toast.error('O nome do cliente é obrigatório');
      return;
    }

    if (!newClientIndustry.trim()) {
      toast.error('A indústria/segmento é obrigatório');
      return;
    }

    try {
      console.log('Iniciando criação do cliente...');
      
      // Garantir que o usuário está autenticado
      const user = await ensureAuthenticated();
      console.log('Usuário autenticado para criação de cliente:', user);
      
      // Inserir cliente diretamente no banco
      console.log('Tentando inserir cliente no banco de dados');
      
      const { data: createdClient, error } = await supabase
        .from('clients')
        .insert([{
          name: newClientName.trim(),
          industry: newClientIndustry.trim(),
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao inserir cliente:', error);
        throw error;
      }
      
      if (!createdClient) {
        throw new Error('Falha ao criar cliente - resposta vazia do servidor');
      }
      
      console.log('Cliente criado com sucesso:', createdClient);

      // Criar redes sociais se fornecidas
      const socialMedia = [];
      
      if (newClientInstagram.trim()) {
        socialMedia.push({
          client_id: createdClient.id,
          platform: 'instagram',
          username: newClientInstagram.trim()
        });
      }
      
      if (newClientFacebook.trim()) {
        socialMedia.push({
          client_id: createdClient.id,
          platform: 'facebook',
          username: newClientFacebook.trim()
        });
      }
      
      if (newClientLinkedin.trim()) {
        socialMedia.push({
          client_id: createdClient.id,
          platform: 'linkedin',
          username: newClientLinkedin.trim()
        });
      }
      
      if (socialMedia.length > 0) {
        console.log('Criando redes sociais:', socialMedia);
        
        // Inserir redes sociais diretamente
        const { error: socialError } = await supabase
          .from('social_media')
          .insert(
            socialMedia.map(sm => ({
              client_id: createdClient.id,
              platform: sm.platform,
              username: sm.username
            }))
          );
          
        if (socialError) {
          console.error('Erro ao criar redes sociais:', socialError);
          // Não interromper a operação se houver erro nas redes sociais
          toast.error('Aviso: Não foi possível salvar as redes sociais');
        }
      }
      
      // Recarregar a lista de clientes para obter os dados atualizados
      await loadClients();
      
      // Limpar formulário
      setNewClientName('');
      setNewClientIndustry('');
      setNewClientInstagram('');
      setNewClientFacebook('');
      setNewClientLinkedin('');
      
      // Fechar diálogo
      setIsNewClientDialogOpen(false);
      
      toast.success('Cliente criado com sucesso');
    } catch (error: any) {
      console.error('Erro detalhado ao criar cliente:', {
        message: error.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao criar cliente. Por favor, tente novamente.';
      
      // Verificar se é um erro de autenticação
      if (error.message && error.message.includes('autenticado')) {
        errorMessage = 'Você precisa estar logado para criar um cliente. Por favor, faça login novamente.';
      } else if (error.message && error.message.includes('violates row-level security')) {
        errorMessage = 'Erro de permissão. Você não tem autorização para criar este cliente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Layout>
      {/* Header fixo e destacado */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md shadow-sm border-b border-border mb-8 py-4 px-2 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold text-primary dark:text-accent-foreground tracking-tight">Clientes</h1>
          <span className="text-muted-foreground text-base">Gerencie seus clientes e visualize suas personas</span>
        </div>
        <Button onClick={() => setIsNewClientDialogOpen(true)} className="mt-4 md:mt-0 bg-gradient-to-r from-primary to-accent text-white shadow-md hover:scale-105 transition-transform px-6 py-2 text-base font-semibold rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>
      {/* Busca com feedback */}
      <div className="flex mb-8 animate-fade-in-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, segmento ou rede social..."
            className="pl-10 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/60 bg-background/80 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar clientes"
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition"
              onClick={() => setSearchQuery('')}
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>
      </div>
      {/* Grid responsivo dos cards */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 animate-fade-in">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary border-t-2"></div>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in-up">
          {filteredClients.map((client) => (
            <ClientCard 
              key={client.id} 
              client={client} 
              onDelete={handleDeleteClient}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-16 w-16 text-accent/30 animate-fade-in" />}
          title={searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          description={searchQuery 
            ? "Tente usar outros termos ou limpe a busca para ver todos os clientes."
            : "Você ainda não cadastrou nenhum cliente. Clique em 'Novo Cliente' para começar!"
          }
          actionLabel={!searchQuery ? "Adicionar Cliente" : undefined}
          onClick={() => !searchQuery && setIsNewClientDialogOpen(true)}
        />
      )}
      {/* Modal de novo cliente aprimorado */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="rounded-2xl shadow-2xl animate-fade-in-up max-w-lg w-full bg-background">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary dark:text-accent-foreground">Novo Cliente</DialogTitle>
            <DialogDescription className="text-muted-foreground">Adicione um novo cliente para gerenciar seu conteúdo</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => { e.preventDefault(); handleCreateClient(); }}
            className="space-y-6"
            aria-label="Formulário de novo cliente"
          >
            <div className="space-y-3">
              <Label htmlFor="name">Nome do Cliente *</Label>
              <Input
                id="name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="rounded-lg shadow-sm text-base bg-background"
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="industry">Indústria/Segmento *</Label>
              <Input
                id="industry"
                value={newClientIndustry}
                onChange={(e) => setNewClientIndustry(e.target.value)}
                className="rounded-lg shadow-sm text-base bg-background"
                required
                aria-required="true"
              />
            </div>
            <div className="space-y-3">
              <Label>Redes Sociais</Label>
              <Input
                id="instagram"
                name="instagram"
                placeholder="Instagram"
                value={newClientInstagram}
                onChange={(e) => setNewClientInstagram(e.target.value)}
                autoComplete="off"
                aria-label="Nome de usuário no Instagram"
                className="rounded-lg shadow-sm bg-background"
              />
              <Input
                id="facebook"
                name="facebook"
                placeholder="Facebook"
                value={newClientFacebook}
                onChange={(e) => setNewClientFacebook(e.target.value)}
                autoComplete="off"
                aria-label="Nome de usuário no Facebook"
                className="rounded-lg shadow-sm bg-background"
              />
              <Input
                id="linkedin"
                name="linkedin"
                placeholder="LinkedIn"
                value={newClientLinkedin}
                onChange={(e) => setNewClientLinkedin(e.target.value)}
                autoComplete="off"
                aria-label="Nome de usuário no LinkedIn"
                className="rounded-lg shadow-sm bg-background"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-white shadow hover:scale-105 transition-transform text-base py-3">Salvar Cliente</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Clients;
