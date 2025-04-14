import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, Facebook, Linkedin, Edit, MessageSquarePlus, Copy, MessageSquare } from 'lucide-react';
import { getClientById, updateClient, updatePersona, updateSocialMedia } from '@/lib/supabase/database';
import { Client, SocialMedia, Persona } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import EmptyState from '@/components/EmptyState';

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [clientDetails, setClientDetails] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editFacebook, setEditFacebook] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  // Persona form state
  const [editTone, setEditTone] = useState('');
  const [editTargetAudience, setEditTargetAudience] = useState('');
  const [editValues, setEditValues] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  
  const navigate = useNavigate();
  
  // Função para carregar dados do cliente do Supabase
  const loadClientDetails = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const clientData = await getClientById(id);
      
      if (!clientData) {
        console.error('Cliente não encontrado:', id);
        setClientDetails(null);
        return;
      }
      
      // Processar dados para o formato esperado pela UI
      const formattedClient: Client = {
        id: clientData.id,
        name: clientData.name,
        industry: clientData.industry,
        user_id: clientData.user_id,
        created_at: clientData.created_at,
        updated_at: clientData.updated_at,
        recent_captions: clientData.recent_captions || [],
        
        // Processa social_media se existir
        socialMedia: Array.isArray(clientData.social_media) 
          ? clientData.social_media.map(sm => ({
              id: sm.id,
              client_id: sm.client_id,
              platform: sm.platform,
              username: sm.username,
              type: sm.platform // Para compatibilidade com o código existente
            }))
          : [],
          
        // Processa persona se existir  
        persona: clientData.personas && clientData.personas.length > 0
          ? {
              id: clientData.personas[0].id,
              client_id: clientData.personas[0].client_id,
              tone: clientData.personas[0].tone || '',
              target_audience: clientData.personas[0].target_audience || '',
              targetAudience: clientData.personas[0].target_audience || '',
              values: clientData.personas[0].values || '',
              keywords: clientData.personas[0].keywords 
                ? (typeof clientData.personas[0].keywords === 'string' 
                   ? JSON.parse(clientData.personas[0].keywords) 
                   : clientData.personas[0].keywords)
                : []
            }
          : {
              client_id: id,
              tone: getDefaultTone(clientData.industry),
              target_audience: getDefaultTargetAudience(clientData.industry),
              targetAudience: getDefaultTargetAudience(clientData.industry),
              values: getDefaultValues(clientData.industry),
              keywords: getDefaultKeywords(clientData.industry)
            },
                
        // Gerar iniciais a partir do nome
        initials: clientData.name
          .split(' ')
          .map(part => part[0])
          .join('')
          .substring(0, 2)
          .toUpperCase(),
          
        // Descrição padrão
        description: `${clientData.name} é uma empresa de ${clientData.industry.toLowerCase()} comprometida com a excelência e inovação.`
      };

      setClientDetails(formattedClient);
    } catch (error) {
      console.error('Erro ao carregar detalhes do cliente:', error);
      toast.error("Não foi possível obter os detalhes do cliente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Inicializar dados do formulário quando o diálogo for aberto
  useEffect(() => {
    if (clientDetails && isEditDialogOpen) {
      setEditName(clientDetails.name);
      setEditIndustry(clientDetails.industry);
      
      // Preencher redes sociais
      const instagram = clientDetails.socialMedia?.find(sm => 
        (sm.type?.toLowerCase() === 'instagram' || sm.platform?.toLowerCase() === 'instagram'));
      const facebook = clientDetails.socialMedia?.find(sm => 
        (sm.type?.toLowerCase() === 'facebook' || sm.platform?.toLowerCase() === 'facebook'));
      const linkedin = clientDetails.socialMedia?.find(sm => 
        (sm.type?.toLowerCase() === 'linkedin' || sm.platform?.toLowerCase() === 'linkedin'));
      
      setEditInstagram(instagram ? instagram.username : '');
      setEditFacebook(facebook ? facebook.username : '');
      setEditLinkedin(linkedin ? linkedin.username : '');
      
      // Preencher persona
      if (clientDetails.persona) {
        setEditTone(clientDetails.persona.tone || '');
        setEditTargetAudience(clientDetails.persona.targetAudience || clientDetails.persona.target_audience || '');
        setEditValues(clientDetails.persona.values || '');
        
        const keywords = clientDetails.persona.keywords;
        if (keywords) {
          if (Array.isArray(keywords)) {
            setEditKeywords(keywords.join(', '));
          } else if (typeof keywords === 'string') {
            setEditKeywords(keywords);
          }
        } else {
          setEditKeywords('');
        }
      }
    }
  }, [isEditDialogOpen, clientDetails]);
  
  // Atualizar os detalhes do cliente quando o ID mudar ou quando a página for recarregada
  useEffect(() => {
    loadClientDetails();
    
    // Remover temporizador e recarregamento automático para evitar flickering
    // e requisições desnecessárias ao servidor
    
    // Adicionar evento para recarregar dados quando a página ganhar foco
    // apenas se o usuário estiver navegando entre abas e o diálogo de edição NÃO estiver aberto
    const handleFocus = () => {
      // Verifica se o documento estava invisível antes do evento
      // e se o diálogo de edição não está aberto
      if (document.hidden === false && !isEditDialogOpen) {
        console.log("Página ganhou foco - recarregando dados do cliente");
        loadClientDetails();
      } else if (isEditDialogOpen) {
        console.log("Diálogo de edição está aberto - não recarregando dados para evitar perda de informação");
      }
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Limpar evento quando o componente for desmontado
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [id, isEditDialogOpen]);
  
  // Funções para gerar valores padrão com base na indústria
  const getDefaultTone = (industry: string) => {
    switch (industry) {
      case 'Gastronomia': return 'Caloroso e acolhedor';
      case 'Moda': return 'Sofisticado e atual';
      case 'Tecnologia': return 'Profissional e inovador';
      default: return 'Motivador e energético';
    }
  };
  
  const getDefaultKeywords = (industry: string) => {
    switch (industry) {
      case 'Gastronomia': return ['café', 'aconchego', 'sabor', 'experiência'];
      case 'Moda': return ['estilo', 'tendência', 'elegância', 'exclusividade'];
      case 'Tecnologia': return ['inovação', 'solução', 'tecnologia', 'futuro'];
      default: return ['saúde', 'bem-estar', 'motivação', 'fitness'];
    }
  };
  
  const getDefaultTargetAudience = (industry: string) => {
    switch (industry) {
      case 'Gastronomia': return 'Adultos de 25 a 45 anos que valorizam momentos de pausa e qualidade.';
      case 'Moda': return 'Mulheres de 20 a 35 anos que buscam elegância e exclusividade.';
      case 'Tecnologia': return 'Empresas e profissionais que buscam inovação tecnológica.';
      default: return 'Pessoas de 18 a 40 anos interessadas em saúde e bem-estar.';
    }
  };
  
  const getDefaultValues = (industry: string) => {
    switch (industry) {
      case 'Gastronomia': return 'Qualidade, tradição e experiência sensorial.';
      case 'Moda': return 'Sustentabilidade, inovação e exclusividade.';
      case 'Tecnologia': return 'Inovação, eficiência e orientação ao cliente.';
      default: return 'Saúde, bem-estar e superação.';
    }
  };
  
  // Função para obter o ícone da plataforma
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-3 w-3" />;
      case 'facebook':
        return <Facebook className="h-3 w-3" />;
      case 'linkedin':
        return <Linkedin className="h-3 w-3" />;
      default:
        return <MessageSquarePlus className="h-3 w-3" />;
    }
  };
  
  // Renderização durante o carregamento
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  // Renderização quando o cliente não é encontrado
  if (!clientDetails) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <h2 className="text-2xl font-bold mb-2">Cliente não encontrado</h2>
          <p className="text-muted-foreground mb-4">O cliente que você está procurando não existe ou foi removido.</p>
          <Link to="/clients">
            <Button>Voltar para clientes</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  const { name, initials, industry, socialMedia, persona, description } = clientDetails;
  
  // Função para filtrar redes sociais duplicadas
  const getUniqueSocialMedia = () => {
    if (!socialMedia || !Array.isArray(socialMedia) || socialMedia.length === 0) {
      return [];
    }
    
    // Mapear e normalizar primeiro
    const normalizedSocialMedia = socialMedia.map(sm => ({
      ...sm,
      normalizedType: (sm.platform || sm.type || '').toLowerCase()
    }));
    
    // Usar reduce para eliminar duplicatas
    return normalizedSocialMedia.reduce((acc, current) => {
      const isDuplicate = acc.find(item => item.normalizedType === current.normalizedType);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, [] as any[]);
  };
  
  const uniqueSocialMedia = getUniqueSocialMedia();
  
  const handleSaveChanges = async (e?: React.FormEvent) => {
    console.log("Função handleSaveChanges chamada");
    
    // Se recebemos um evento, vamos prevenir o comportamento padrão (submit do form)
    if (e) {
      console.log("Prevenindo comportamento padrão do evento");
      e.preventDefault();
    }
    
    // Validação básica
    if (!clientDetails || !editName || !editIndustry) {
      toast.error("Nome e indústria são obrigatórios");
      return;
    }
    
    if (!id) {
      toast.error("ID do cliente não encontrado");
      return;
    }
    
    // Desabilitar o botão enquanto processamos a atualização
    setIsProcessing(true);
    
    try {
      console.log("=== Iniciando processo de salvamento ===");
      
      // 1. Atualizar dados básicos do cliente primeiro
      console.log("1. Atualizando dados básicos do cliente");
      const clientDataToUpdate = {
        name: editName.trim(),
        industry: editIndustry.trim()
      };
      console.log("Dados a atualizar:", clientDataToUpdate);
      
      const updatedClient = await updateClient(id, clientDataToUpdate);
      
      if (!updatedClient) {
        throw new Error("Falha ao atualizar dados do cliente");
      }
      
      console.log("Cliente atualizado com sucesso:", updatedClient);
      
      // 2. Atualizar persona
      console.log("2. Atualizando persona do cliente");
      const keywordsArray = editKeywords
        ? editKeywords.split(',').map(k => k.trim())
        : [];
        
      const personaData: Partial<Persona> = {
        tone: editTone.trim(),
        target_audience: editTargetAudience.trim(),
        values: editValues.trim(),
        keywords: keywordsArray
      };
      
      console.log("Dados da persona a atualizar:", personaData);
      const updatedPersona = await updatePersona(id, personaData);
      console.log("Persona atualizada:", updatedPersona);
      
      // 3. Atualizar redes sociais
      console.log("3. Atualizando redes sociais");
      const socialMediaData: SocialMedia[] = [];
      
      if (editInstagram.trim()) {
        socialMediaData.push({
          client_id: id,
          platform: 'instagram',
          username: editInstagram.trim()
        });
      }
      
      if (editFacebook.trim()) {
        socialMediaData.push({
          client_id: id,
          platform: 'facebook',
          username: editFacebook.trim()
        });
      }
      
      if (editLinkedin.trim()) {
        socialMediaData.push({
          client_id: id,
          platform: 'linkedin',
          username: editLinkedin.trim()
        });
      }
      
      console.log("Redes sociais a atualizar:", socialMediaData);
      if (socialMediaData.length > 0) {
        const updatedSocial = await updateSocialMedia(id, socialMediaData);
        console.log("Redes sociais atualizadas:", updatedSocial);
      } else {
        console.log("Nenhuma rede social para atualizar");
      }
      
      // Fechar diálogo e recarregar dados
      console.log("Finalizando processo de atualização");
      setIsEditDialogOpen(false);
      // Forçar recarregamento dos dados
      loadClientDetails();
      
      toast.success("O perfil do cliente foi atualizado com sucesso");
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast.error("Não foi possível salvar as alterações do cliente.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const renderRecentCaptions = () => {
    // Verificar se temos legendas recentes no formato correto
    if (!clientDetails || !clientDetails.recent_captions) {
      return (
        <EmptyState
          icon={<MessageSquare className="h-10 w-10" />}
          title="Nenhuma legenda recente"
          description="Gere legendas para este cliente para vê-las aqui"
          actionLabel="Gerar Legendas"
          actionLink={`/caption-generator?client=${id}`}
        />
      );
    }
    
    // Função auxiliar para garantir um array válido de legendas
    const ensureValidCaptionsArray = (data: any): any[] => {
      // Se for null, retornar array vazio
      if (data === null) return [];
      
      // Se já for array, retornar como está
      if (Array.isArray(data)) {
        return data;
      }
      
      // Se for string JSON, tentar converter
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          return [];
        }
      }
      
      // Tentar converter objetos para array
      if (typeof data === 'object') {
        // Se for objeto mas tiver propriedades típicas de uma legenda
        if (data.content || data.id) {
          return [data];
        }
        
        // Tentar extrair valores se for um objeto com índices numéricos
        const values = Object.values(data);
        if (values.length > 0) {
          return values;
        }
      }
      
      // Fallback: retornar array vazio
      return [];
    };
    
    // Garantir que as legendas estão em formato de array
    const captions = ensureValidCaptionsArray(clientDetails.recent_captions);
    
    if (captions.length === 0) {
      return (
        <EmptyState
          icon={<MessageSquare className="h-10 w-10" />}
          title="Nenhuma legenda recente"
          description="Gere legendas para este cliente para vê-las aqui"
          actionLabel="Gerar Legendas"
          actionLink={`/caption-generator?client=${id}`}
        />
      );
    }
    
    return (
      <div className="space-y-4">
        {captions.map((caption, index) => (
          <div key={caption.id || index} className="border rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {getPlatformIcon(caption.platform)}
                <span className="ml-1">{caption.platform || 'geral'}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {caption.created_at ? new Date(caption.created_at).toLocaleDateString('pt-BR') : ''}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{caption.content}</p>
            <div className="flex justify-end space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(caption.content);
                  toast.success("Legenda copiada para a área de transferência");
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Layout>
      <PageHeader
        title={name}
        description={industry}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
          <Link to={`/caption-generator?client=${encodeURIComponent(name)}`}>
            <Button>
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Criar Legenda
            </Button>
          </Link>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client information card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription>{industry}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Descrição</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Redes Sociais</h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSocialMedia && uniqueSocialMedia.map((sm, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center">
                        {getPlatformIcon(sm.platform || sm.type || '')}
                        <span className="ml-1">{sm.username}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for persona and content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="persona">
            <TabsList>
              <TabsTrigger value="persona">Persona</TabsTrigger>
              <TabsTrigger value="content">Conteúdo Recente</TabsTrigger>
            </TabsList>
            
            <TabsContent value="persona" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Persona do Cliente</CardTitle>
                  <CardDescription>
                    Informações sobre o tom, valores e público-alvo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Tom de Voz</h3>
                    <p className="text-sm text-muted-foreground">{persona?.tone}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Público-Alvo</h3>
                    <p className="text-sm text-muted-foreground">{persona?.targetAudience || persona?.target_audience}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Valores</h3>
                    <p className="text-sm text-muted-foreground">{persona?.values}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Palavras-Chave</h3>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(persona?.keywords) ? persona?.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      )) : (
                        <p className="text-sm text-muted-foreground">Nenhuma palavra-chave definida</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="content" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conteúdo Recente</CardTitle>
                  <CardDescription>
                    Legendas e publicações recentes para {name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderRecentCaptions()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Seção de Legendas Recentes */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Legendas Recentes</CardTitle>
              <CardDescription>
                Últimas legendas geradas para este cliente
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/caption-generator?client=${id}`)}
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Gerar Nova Legenda
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderRecentCaptions()}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do perfil do cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Cliente</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => {
                  console.log("Nome alterado:", e.target.value);
                  setEditName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    console.log("Tecla Enter pressionada no campo nome - prevenindo comportamento padrão");
                    e.preventDefault();
                    return false;
                  }
                }}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="industry">Indústria/Segmento</Label>
              <Input
                id="industry"
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    return false;
                  }
                }}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="social-media">Redes Sociais</Label>
              <div className="space-y-2">
                <Input
                  id="edit-instagram"
                  name="edit-instagram"
                  placeholder="Instagram"
                  value={editInstagram}
                  onChange={(e) => setEditInstagram(e.target.value)}
                  autoComplete="off"
                  aria-label="Nome de usuário no Instagram"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return false;
                    }
                  }}
                />
                <Input
                  id="edit-facebook"
                  name="edit-facebook"
                  placeholder="Facebook"
                  value={editFacebook}
                  onChange={(e) => setEditFacebook(e.target.value)}
                  autoComplete="off"
                  aria-label="Nome de usuário no Facebook"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return false;
                    }
                  }}
                />
                <Input
                  id="edit-linkedin"
                  name="edit-linkedin"
                  placeholder="LinkedIn"
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  autoComplete="off"
                  aria-label="Nome de usuário no LinkedIn"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      return false;
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tone">Tom de Voz</Label>
              <Input
                id="tone"
                value={editTone}
                onChange={(e) => setEditTone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    return false;
                  }
                }}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="targetAudience">Público-Alvo</Label>
              <Input
                id="targetAudience"
                value={editTargetAudience}
                onChange={(e) => setEditTargetAudience(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    return false;
                  }
                }}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="values">Valores</Label>
              <Input
                id="values"
                value={editValues}
                onChange={(e) => setEditValues(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    return false;
                  }
                }}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="keywords">Palavras-Chave (separadas por vírgula)</Label>
              <Input
                id="keywords"
                value={editKeywords}
                onChange={(e) => setEditKeywords(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    return false;
                  }
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)} 
              type="button"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={(e) => handleSaveChanges(e)} 
              type="button"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ClientProfile;
