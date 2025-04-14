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
      <PageHeader
        title="Clientes"
        description="Gerencie os perfis dos seus clientes"
      >
        <Button onClick={() => setIsNewClientDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </PageHeader>
      
      {/* Search and filter */}
      <div className="flex mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar clientes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Clients grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          icon={<Users className="h-8 w-8 text-muted-foreground" />}
          title={searchQuery ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          description={searchQuery 
            ? "Tente usar termos diferentes na sua busca" 
            : "Comece a adicionar clientes para criar conteúdo personalizado"
          }
          actionLabel={!searchQuery ? "Adicionar Cliente" : undefined}
          onClick={() => !searchQuery && setIsNewClientDialogOpen(true)}
        />
      )}
      
      {/* New Client Dialog */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Adicione um novo cliente para gerenciar seu conteúdo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cliente</Label>
              <Input
                id="name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Indústria/Segmento</Label>
              <Input
                id="industry"
                value={newClientIndustry}
                onChange={(e) => setNewClientIndustry(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Redes Sociais</Label>
              <Input
                id="instagram"
                name="instagram"
                placeholder="Instagram"
                value={newClientInstagram}
                onChange={(e) => setNewClientInstagram(e.target.value)}
                autoComplete="off"
                aria-label="Nome de usuário no Instagram"
              />
              <Input
                id="facebook"
                name="facebook"
                placeholder="Facebook"
                value={newClientFacebook}
                onChange={(e) => setNewClientFacebook(e.target.value)}
                autoComplete="off"
                aria-label="Nome de usuário no Facebook"
              />
              <Input
                id="linkedin"
                name="linkedin"
                placeholder="LinkedIn"
                value={newClientLinkedin}
                onChange={(e) => setNewClientLinkedin(e.target.value)}
                autoComplete="off"
                aria-label="Nome de usuário no LinkedIn"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewClientDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateClient}>
              Criar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Clients;
