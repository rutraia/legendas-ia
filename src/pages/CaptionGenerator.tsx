import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Sparkles, 
  Clock, 
  Save, 
  Copy, 
  Share, 
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { getClientDetails } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from "sonner";
import { generateId } from '@/lib/utils';
import { Client, Caption } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardDescription } from '@/components/ui/card';
import EmptyState from '@/components/EmptyState';
import { getClientById, getClients } from '@/lib/supabase/database';
import { supabase } from '@/lib/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { v4 as uuidv4 } from 'uuid';
import { createCaptionSecurely } from '../lib/supabase/services/caption-service';

// Extendendo o tipo Caption para compatibilidade com o código existente
type ExtendedCaption = Caption & {
  text?: string;
  prompt?: string;
  client?: string | Client;
  createdAt?: string;
}

// Função auxiliar para log melhorado no console
const logObject = (label: string, obj: any) => {
  console.log(`${label}:`, JSON.stringify(obj, null, 2));
};

// Função auxiliar para extrair a legenda de diferentes formatos de resposta
const extractCaptionFromResponse = (data: any): string | null => {
  console.log("Extraindo legenda da resposta:", data);
  
  // Caso 1: { output: "texto da legenda" }
  if (data && typeof data.output === 'string') {
    console.log("Formato encontrado: data.output");
    return data.output;
  }
  
  // Caso 2: { caption: "texto da legenda" }
  if (data && typeof data.caption === 'string') {
    console.log("Formato encontrado: data.caption");
    return data.caption;
  }
  
  // Caso 3: { json: { output: "texto da legenda" } }
  if (data && data.json && typeof data.json.output === 'string') {
    console.log("Formato encontrado: data.json.output");
    return data.json.output;
  }
  
  // Caso 4: { data: { output: "texto da legenda" } }
  if (data && data.data && typeof data.data.output === 'string') {
    console.log("Formato encontrado: data.data.output");
    return data.data.output;
  }
  
  // Caso 5: { data: { caption: "texto da legenda" } }
  if (data && data.data && typeof data.data.caption === 'string') {
    console.log("Formato encontrado: data.data.caption");
    return data.data.caption;
  }
  
  // Caso 6: { result: "texto da legenda" }
  if (data && typeof data.result === 'string') {
    console.log("Formato encontrado: data.result");
    return data.result;
  }
  
  // Caso 7: o próprio objeto é uma string
  if (typeof data === 'string') {
    console.log("Formato encontrado: string direta");
    return data;
  }
  
  console.log("Nenhum formato conhecido encontrado na resposta");
  return null;
};

const getInitials = (name: string): string => {
  if (!name) return "CL";
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const CaptionGenerator = () => {
  const [searchParams] = useSearchParams();
  const [clientFromUrl, setClientFromUrl] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook' | 'linkedin'>('instagram');
  const [prompt, setPrompt] = useState('');
  const [creativeLevel, setCreativeLevel] = useState([50]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaptions, setGeneratedCaptions] = useState<ExtendedCaption[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n-n8n.bybaju.easypanel.host/webhook/legenda');
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [clientDetails, setClientDetails] = useState<Client | null>(null);
  const [persona, setPersona] = useState<{
    tone_of_voice?: string;
    tone?: string;
    keywords?: string[];
    target_audience?: string;
    targetAudience?: string;
    values?: string;
  } | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  
  // Adicionar estados para controlar o diálogo de salvamento
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [saveToRecent, setSaveToRecent] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Obter cliente da URL
  useEffect(() => {
    const clientId = searchParams.get('client');
    if (clientId) {
      setClientFromUrl(clientId);
    }
  }, [searchParams]);
  
  // Atualizar a URL quando o cliente é selecionado
  useEffect(() => {
    if (selectedClient) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("client", selectedClient.id);
      window.history.pushState({}, "", currentUrl.toString());
    }
  }, [selectedClient]);
  
  // Adicionar um effeito para monitorar a disponibilidade de clientes
  useEffect(() => {
    if (availableClients.length > 0) {
      console.log("=== Lista de clientes disponíveis atualizada ===");
      console.log("Total de clientes: ", availableClients.length);
      availableClients.forEach((client, index) => {
        console.log(`${index + 1}. ${client.name} (${client.id})`);
      });
    } else if (!isLoadingClients) {
      console.log("Nenhum cliente disponível após carregamento");
    }
  }, [availableClients, isLoadingClients]);
  
  // Efeito existente para buscar clientes
  useEffect(() => {
    // Verificar sessão do usuário
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Usuário autenticado:", session.user.id);
        } else {
          console.warn("Usuário não autenticado");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      }
    };
    
    checkSession();
    
    // Carregar webhook do localStorage
    const savedWebhookUrl = localStorage.getItem('webhookUrl');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
    
    // Buscar clientes do Supabase
    fetchClients();
  }, []);
  
  const fetchClients = async () => {
    setIsLoadingClients(true);
    try {
      console.log("🔍 Buscando clientes da base de dados...");
      const clients = await getClients();
      console.log("📋 Clientes obtidos do Supabase:", clients);
      
      if (clients && Array.isArray(clients)) {
        // Imprimir detalhes de cada cliente para depuração
        clients.forEach((client, index) => {
          console.log(`📑 Cliente #${index + 1}:`, {
            id: client.id,
            name: client.name,
            created_at: client.created_at,
            hasPersona: client.personas && client.personas.length > 0,
            hasSocialMedia: client.social_media && client.social_media.length > 0,
            recent_captions: client.recent_captions ? 
              (Array.isArray(client.recent_captions) ? 
                `${client.recent_captions.length} captions` : 
                `formato não-array: ${typeof client.recent_captions}`) : 
              'nenhuma'
          });
        });
        
        // Processar e definir clientes disponíveis
        const processedClients = clients.map(client => ({
          id: client.id,
          name: client.name,
          industry: client.industry,
          initials: getInitials(client.name),
          // ... existing code ...
        }));
        
        console.log("=== Clientes processados (lista final) ===");
        console.log("Total de clientes processados:", processedClients.length);
        processedClients.forEach((client, index) => {
          console.log(`${index + 1}. ${client.name} (${client.id})`);
        });
        setAvailableClients(processedClients);
        
        // Se tiver client ID na URL, encontre o cliente correspondente
        if (clientFromUrl) {
          console.log("Buscando cliente da URL:", clientFromUrl);
          const clientFromUrlObject = processedClients.find(c => c.id === clientFromUrl);
          if (clientFromUrlObject) {
            console.log("Cliente da URL encontrado:", clientFromUrlObject);
            setSelectedClient(clientFromUrlObject);
          } else {
            console.log("Cliente da URL não encontrado nos dados processados");
          }
        }
      } else {
        console.error("Formato de dados de clientes inválido:", clients);
        toast.error("Erro ao carregar clientes");
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      console.log("=== FIM: Busca de clientes concluída ===");
      console.log("Estado final - isLoadingClients:", false);
      console.log("Estado final - availableClients:", availableClients.length);
      setIsLoadingClients(false);
    }
  };
  
  useEffect(() => {
    if (selectedClient) {
      console.log("Cliente selecionado:", selectedClient);
      loadClientDetails(selectedClient.id);
    }
  }, [selectedClient]);
  
  const loadClientDetails = async (clientId: string) => {
    console.log("🔄 Carregando detalhes do cliente:", clientId);
    
    try {
      // Buscar detalhes do cliente
      const client = await getClientById(clientId);
      console.log("📄 Detalhes do cliente obtidos:", client);
      
      if (!client) {
        console.error("❌ Cliente não encontrado na base de dados com ID:", clientId);
        setClientDetails(null);
        setPersona(null);
        return;
      }
      
      // Processar detalhes do cliente
      let socialMedia = [];
      
      // Processar social_media
      if (client.social_media) {
        if (Array.isArray(client.social_media)) {
          socialMedia = client.social_media;
        } else if (typeof client.social_media === 'object' && client.social_media !== null) {
          socialMedia = [client.social_media];
        }
      }
      
      const formattedDetails = {
        ...client,
        socialMedia: socialMedia
      };
      
      console.log("Detalhes formatados do cliente:", formattedDetails);
      setClientDetails(formattedDetails);
      
      // Define as informações de persona
      // Primeiro verificar se há personas retornadas como um array
      if (client.personas && Array.isArray(client.personas) && client.personas.length > 0) {
        console.log("Persona encontrada no array de personas:", client.personas[0]);
        // Normalizar campos para garantir compatibilidade
        const normalizedPersona = {
          ...client.personas[0],
          tone_of_voice: client.personas[0].tone_of_voice || client.personas[0].tone || '',
          target_audience: client.personas[0].target_audience || client.personas[0].targetAudience || '',
        };
        setPersona(normalizedPersona);
      } 
      // Caso contrário, verificar se há uma única persona como objeto
      else if (client.personas && typeof client.personas === 'object' && client.personas !== null) {
        console.log("Persona encontrada como objeto único:", client.personas);
        // Normalizar campos
        const normalizedPersona = {
          ...client.personas,
          tone_of_voice: client.personas.tone_of_voice || client.personas.tone || '',
          target_audience: client.personas.target_audience || client.personas.targetAudience || '',
        };
        setPersona(normalizedPersona);
      }
      // Verificar se há uma persona direta no objeto cliente
      else if (client.persona) {
        console.log("Persona encontrada como objeto único:", client.persona);
        // Normalizar campos
        const normalizedPersona = {
          ...client.persona,
          tone_of_voice: client.persona.tone_of_voice || client.persona.tone || '',
          target_audience: client.persona.target_audience || client.persona.targetAudience || '',
        };
        setPersona(normalizedPersona);
      } 
      // Se não houver persona, criar uma padrão
      else {
        console.log("Criando persona padrão baseada na indústria:", client.industry);
        // Cria uma persona padrão baseada na indústria se não houver persona
        const defaultPersona = {
          tone_of_voice: client.industry === "café" ? "Acolhedor e casual" : 
                   client.industry === "tecnologia" ? "Profissional e inovador" : 
                   "Neutro e informativo",
          keywords: client.industry === "café" ? ["aconchegante", "qualidade", "artesanal"] : 
                   client.industry === "tecnologia" ? ["inovação", "eficiência", "solução"] : 
                   ["qualidade", "serviço", "valor"],
          target_audience: client.industry === "café" ? "Amantes de café e frequentadores de cafeterias" : 
                        client.industry === "tecnologia" ? "Profissionais e empresas que buscam soluções tecnológicas" : 
                        "Consumidores gerais",
          values: client.industry === "café" ? "Qualidade, sustentabilidade e experiência do cliente" : 
                 client.industry === "tecnologia" ? "Inovação, eficiência e confiabilidade" : 
                 "Qualidade, confiança e atendimento ao cliente"
        };
        setPersona(defaultPersona);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do cliente:', error);
      toast.error('Erro ao carregar detalhes do cliente');
    }
  };
  
  const handleGenerate = async () => {
    if (!prompt || !selectedPlatform || !selectedClient) {
      toast("Preencha todos os campos", {
        description: "Prompt, plataforma e cliente são obrigatórios."
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Objeto de persona padrão caso não exista nenhum
      const currentPersona = persona || {
        tone_of_voice: "Neutro e informativo",
        keywords: ["qualidade", "serviço"],
        target_audience: "Público geral",
        values: "Qualidade e confiança"
      };

      console.log("Enviando payload com persona:", currentPersona);

      const payload = {
        prompt,
        platform: selectedPlatform,
        client: selectedClient.id,
        clientName: selectedClient.name,
        clientDetails: clientDetails ? {
          name: clientDetails.name,
          industry: clientDetails.industry
        } : {
          name: selectedClient.name,
          industry: selectedClient.industry
        },
        persona: currentPersona
      };

      console.log("Payload completo sendo enviado:", payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Resposta recebida:", responseText);

      let formattedCaptions;

      try {
        // Primeiro tentar tratar como JSON
        const data = JSON.parse(responseText);
        
        if (data.captions && Array.isArray(data.captions)) {
          // Formato de array de captions
          formattedCaptions = data.captions.map((captionText, index) => ({
            id: `gen-${Date.now()}-${index}`,
            client_id: selectedClient.id,
            content: captionText,
            text: captionText,
            client: selectedClient.id as any,
            platform: selectedPlatform,
            status: 'draft',
            created_at: new Date().toISOString(),
            prompt
          }));
        } else {
          // JSON mas não tem array de captions
          const captionText = data.output || data.caption || data.text || 
                              (typeof data === 'string' ? data : JSON.stringify(data));
          
          formattedCaptions = [{
            id: generateId(),
            client_id: selectedClient.id,
            content: captionText,
            text: captionText,
            client: selectedClient.id as any,
            platform: selectedPlatform,
            status: 'draft',
            created_at: new Date().toISOString(),
            prompt
          }];
        }
      } catch (jsonError) {
        // Não é JSON, usar como texto bruto
        console.log("Resposta não é JSON válido, usando como texto puro", jsonError);
        formattedCaptions = [{
          id: generateId(),
          client_id: selectedClient.id,
          content: responseText,
          text: responseText,
          client: selectedClient.id as any,
          platform: selectedPlatform,
          status: 'draft',
          created_at: new Date().toISOString(),
          prompt
        }];
      }

      setGeneratedCaptions(formattedCaptions);
      
      toast.success(`Legenda${formattedCaptions.length > 1 ? 's' : ''} gerada(s) com sucesso`);
    } catch (error) {
      console.error("Erro ao gerar legendas:", error);
      toast.error("Erro ao gerar legendas", {
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido"
      });
      
      // Aplicar fallback
      if (selectedClient) {
        handleFallbackCaption();
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleResponseText = async (responseText: string): Promise<string | null> => {
    try {
      if (!responseText || !responseText.trim()) {
        console.warn("Resposta vazia do servidor");
        return null;
      }
      
      if (responseText.trim().startsWith('<') || responseText.includes('<html')) {
        console.warn("Resposta contém HTML, provavelmente um erro");
        return null;
      }
      
      try {
        const data = JSON.parse(responseText);
        logObject("Dados parseados", data);
        
        return extractCaptionFromResponse(data);
      } catch (parseError) {
        console.error("Erro ao parsear JSON:", parseError);
        
        if (responseText.trim() && !responseText.includes("<html")) {
          return responseText;
        }
        return null;
      }
    } catch (error) {
      console.error("Erro geral ao processar resposta:", error);
      return null;
    }
  };
  
  const handleFallbackCaption = () => {
    if (!selectedClient) return;
    
    // Se já temos legendas, não criar fallback
    if (generatedCaptions.length > 0) return;
    
    console.log("Criando legenda de fallback para o cliente:", selectedClient);
    
    const clientName = selectedClient?.name || "Empresa";
    const fallbackText = `✨ ${prompt || "Novidade"}\n\nA ${clientName} tem orgulho em compartilhar esta novidade com você. Nosso compromisso é oferecer sempre o melhor!\n\n#${clientName.replace(/\s+/g, '')} #Novidade #Qualidade`;
    
    const fallbackCaption: ExtendedCaption = {
      id: generateId(),
      client_id: selectedClient.id,
      content: fallbackText,
      text: fallbackText,
      client: selectedClient.id as any,
      platform: selectedPlatform,
      status: 'draft',
      created_at: new Date().toISOString(),
      prompt: prompt || "Novidade da empresa"
    };
    
    console.log("Legenda de fallback criada:", fallbackCaption);
    setGeneratedCaptions([fallbackCaption]);
    
    toast.info("Uma legenda padrão foi criada porque não foi possível obter a legenda personalizada");
  };
  
  // Adicionar método para verificar se temos legendas válidas após a geração
  useEffect(() => {
    // Se terminamos de gerar mas não temos legendas, chamar fallback
    if (!isGenerating && generatedCaptions.length === 0 && selectedClient) {
      console.log("Nenhuma legenda foi gerada. Aplicando fallback...");
      handleFallbackCaption();
    }
  }, [isGenerating]);
  
  // Função para exibir o diálogo de salvamento
  const handleShowSaveOptions = () => {
    if (!selectedClient || generatedCaptions.length === 0) {
      console.log("Não é possível salvar: cliente não selecionado ou sem legendas geradas");
      return;
    }
    setShowSaveDialog(true);
  };

  // Função para executar o salvamento com base nas opções selecionadas
  const handleSaveCaption = async () => {
    if (!selectedClient || generatedCaptions.length === 0) {
      console.log("Não é possível salvar: cliente não selecionado ou sem legendas geradas");
      return;
    }
    
    // Definir aqui as variáveis para que estejam disponíveis no escopo do finally
    let librarySuccess = false;
    let recentSuccess = false;

    setIsSaving(true);
    try {
      // Exibir loading toast
      const loadingToastId = toast.loading("Salvando legenda...");
      
      console.log("=== Iniciando processo de salvamento de legenda ===");
      console.log("Cliente selecionado:", selectedClient);
      console.log("Legenda a ser salva:", generatedCaptions[0]);
      console.log("Opções de salvamento:", { saveToLibrary, saveToRecent });
      
      // Validar URL da imagem, se fornecida
      let validImageUrl = imageUrl || '';
      if (imageUrl) {
        try {
          const url = new URL(imageUrl);
          if (!url.pathname.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
            console.warn("URL de imagem fornecida não parece ser uma imagem válida:", imageUrl);
          }
        } catch (urlError) {
          console.error("URL de imagem inválida:", urlError);
          validImageUrl = ''; // Resetar se URL inválida
        }
      }
      
      // Garantir que estejamos autenticados
      console.log("Verificando autenticação...");
      
      // Verificar sessão do usuário
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Dados da sessão atual:", sessionData?.session ? "Autenticado" : "Não autenticado");
      
      // Se não estiver autenticado, tentar login automático
      if (!sessionData?.session) {
        console.log("Usuário não autenticado, tentando login automático...");
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'arturboaz@outlook.com',
            password: 'teste123'
          });
          
          if (authError) {
            console.error("Erro no login automático:", authError);
            toast.dismiss(loadingToastId);
            toast.error("Falha na autenticação automática. Faça login manualmente.");
            setIsSaving(false);
            return;
          }
          
          console.log("Login automático realizado com sucesso:", authData);
        } catch (loginError) {
          console.error("Erro ao tentar login automático:", loginError);
          toast.dismiss(loadingToastId);
          toast.error("Falha na autenticação. Recarregue a página e tente novamente.");
          setIsSaving(false);
          return;
        }
      }
      
      // Preparar dados da legenda para salvar
      const captionToSave = {
        client_id: selectedClient.id,
        content: generatedCaptions[0].content || generatedCaptions[0].text || '',
        platform: selectedPlatform,
        status: 'draft' as const,
        image_url: validImageUrl
      };

      console.log("Objeto de legenda preparado para salvar:", captionToSave);
      
      // Verificar se temos um client_id válido
      if (!captionToSave.client_id) {
        console.error("ID do cliente inválido:", captionToSave.client_id);
        toast.dismiss(loadingToastId);
        toast.error("ID do cliente inválido");
        setIsSaving(false);
        return;
      }
      
      // Verificar se temos conteúdo válido
      if (!captionToSave.content.trim()) {
        console.error("Conteúdo da legenda está vazio");
        toast.dismiss(loadingToastId);
        toast.error("O conteúdo da legenda não pode estar vazio");
        setIsSaving(false);
        return;
      }

      // Salvar na biblioteca, se selecionado
      if (saveToLibrary) {
        console.log("Salvando na biblioteca...");
        try {
          if (!selectedClient || !selectedClient.id) {
            throw new Error("Cliente não selecionado ou ID do cliente inválido");
          }
          
          const createdCaption = await createCaptionSecurely({
            client_id: selectedClient.id,
            content: generatedCaptions[0].content,
            platform: selectedPlatform,
            status: 'draft',
            image_url: validImageUrl
          });
          
          if (createdCaption) {
            console.log("Legenda salva na biblioteca com sucesso:", createdCaption);
            librarySuccess = true;
          }
        } catch (libraryError) {
          console.error("Erro direto na inserção na biblioteca:", libraryError);
        }
      }
      
      // Salvar nos recentes do cliente, se selecionado
      if (saveToRecent) {
        console.log(`Salvando legenda para cliente: ${selectedClient.id}`);
        try {
          // Preparar legenda para recentes (formato simplificado)
          const recentCaption = {
            id: uuidv4(),
            content: captionToSave.content,
            platform: captionToSave.platform,
            created_at: new Date().toISOString()
          };
          
          // Buscar cliente atual
          const { data: currentClient, error: getError } = await supabase
            .from('clients')
            .select('recent_captions')
            .eq('id', selectedClient.id)
            .single();
            
          if (getError) {
            console.error("Erro ao buscar cliente:", getError);
            throw getError;
          }
          
          // Preparar array de legendas recentes
          let currentCaptions = [];
          
          if (currentClient?.recent_captions) {
            try {
              // Converter para array independente do formato original
              if (Array.isArray(currentClient.recent_captions)) {
                currentCaptions = currentClient.recent_captions;
              } else if (typeof currentClient.recent_captions === 'string') {
                const parsed = JSON.parse(currentClient.recent_captions);
                currentCaptions = Array.isArray(parsed) ? parsed : [parsed];
              } else if (typeof currentClient.recent_captions === 'object') {
                currentCaptions = [currentClient.recent_captions];
              }
            } catch (e) {
              console.warn("Erro ao processar legendas existentes:", e);
              currentCaptions = [];
            }
          }
          
          // Nova legenda no início, limitando a 5 legendas
          const updatedCaptions = [recentCaption, ...currentCaptions.slice(0, 4)];
          
          // Atualizar cliente com nova lista de legendas
          const { error: updateError } = await supabase
            .from('clients')
            .update({ recent_captions: updatedCaptions })
            .eq('id', selectedClient.id);
          
          if (updateError) {
            console.error("Erro ao atualizar legendas recentes:", updateError);
            throw updateError;
          }
          
          recentSuccess = true;
          console.log("Legendas recentes salvas com sucesso");
        } catch (error) {
          console.error("Erro ao salvar legenda nos recentes:", error);
          toast.error("Não foi possível salvar nos recentes do cliente");
        }
      }
      
      // Remover toast de loading
      toast.dismiss(loadingToastId);
      
      // Mostrar feedback com base nos resultados
      if (librarySuccess && recentSuccess) {
        toast.success('Legenda salva com sucesso', {
          action: {
            label: "Ver na biblioteca",
            onClick: () => navigate('/caption-library')
          },
          description: "A legenda foi adicionada à biblioteca e ao perfil do cliente"
        });
      } else if (librarySuccess) {
        toast.success('Legenda salva na biblioteca', {
          action: {
            label: "Ver na biblioteca",
            onClick: () => navigate('/caption-library')
          }
        });
      } else if (recentSuccess) {
        toast.success('Legenda salva no perfil do cliente', {
          action: {
            label: "Ver perfil",
            onClick: () => navigate(`/clients/${selectedClient.id}`)
          }
        });
      } else {
        toast.error('Não foi possível salvar a legenda', {
          description: "Ocorreu um erro ao tentar salvar. Por favor, tente novamente."
        });
      }
      
      // Fechar o diálogo
      setShowSaveDialog(false);
    } catch (error) {
      console.error('=== Erro detalhado ao salvar legenda ===');
      if (error instanceof Error) {
        console.error('Tipo de erro:', error.constructor.name);
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
      } else {
        console.error('Erro desconhecido:', error);
      }
      
      toast.error('Erro ao salvar legenda', {
        description: error instanceof Error 
          ? `${error.message} (${error.constructor.name})` 
          : "Não foi possível salvar a legenda por um erro desconhecido"
      });
    } finally {
      setIsSaving(false);
      console.log("=== Resultado final do salvamento ===");
      console.log("Salvamento na biblioteca:", librarySuccess ? "✅ Sucesso" : "❌ Falha");
      console.log("Salvamento nos recentes:", recentSuccess ? "✅ Sucesso" : "❌ Falha");
    }
  };
  
  // Botão para ver perfil do cliente após salvar
  const handleViewClientProfile = () => {
    if (selectedClient) {
      navigate(`/clients/${selectedClient.id}`);
    }
  };
  
  const handleCopyCaption = () => {
    if (generatedCaptions.length === 0) return;
    
    const textToCopy = generatedCaptions.map(c => c.text || c.content).join('\n');
    navigator.clipboard.writeText(textToCopy);
    
    toast.success("Legendas copiadas para a área de transferência");
  };
  
  const handleShareCaption = () => {
    if (generatedCaptions.length === 0) return;
    
    toast.info("Função de compartilhamento será implementada em breve");
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const ensureValidJsonbArray = (data: any): any[] => {
    // Se for null, retornar array vazio
    if (data === null) return [];
    
    // Se já for array, retornar como está
    if (Array.isArray(data)) return data;
    
    // Se for string JSON, tentar converter
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error("Erro ao analisar string JSON:", e);
        return [];
      }
    }
    
    // Tentar converter objetos para array
    if (typeof data === 'object') {
      // Se for objeto mas tiver propriedades típicas de uma legenda
      if (data.content || data.id) return [data];
      
      // Tentar extrair valores se for um objeto com índices numéricos
      const values = Object.values(data);
      if (values.length > 0) return values;
    }
    
    // Fallback: retornar array vazio
    return [];
  };
  
  const saveCaption = async () => {
    if (!selectedClient.id) return toast.error("Selecione um cliente para salvar a legenda.");
    if (!generatedCaptions.length) return toast.error("Gere uma legenda para salvar.");
    if (!selectedClient) return toast.error("Cliente não encontrado.");

    try {
      setIsSaving(true);
      
      // Buscar legendas recentes atuais
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('recent_captions')
        .eq('id', selectedClient.id)
        .single();
      
      if (clientError) {
        console.error("Erro ao buscar legendas recentes:", clientError);
        toast.error("Erro ao salvar a legenda.");
        setIsSaving(false);
        return;
      }
      
      // Preparar novas legendas recentes
      let currentCaptions = [];
      if (clientData?.recent_captions) {
        try {
          if (Array.isArray(clientData.recent_captions)) {
            currentCaptions = clientData.recent_captions;
          } else if (typeof clientData.recent_captions === 'string') {
            currentCaptions = JSON.parse(clientData.recent_captions);
          } else if (typeof clientData.recent_captions === 'object') {
            currentCaptions = [clientData.recent_captions];
          }
        } catch (e) {
          console.error("Erro ao processar legendas existentes:", e);
        }
      }
      
      // Garantir que currentCaptions é um array
      if (!Array.isArray(currentCaptions)) {
        currentCaptions = [];
      }
      
      // Adicionar nova legenda ao início e limitar a 5
      const newCaption = {
        id: uuidv4(),
        content: generatedCaptions[0].content,
        platform: selectedPlatform,
        created_at: new Date().toISOString(),
      };
      
      const updatedCaptions = [newCaption, ...currentCaptions].slice(0, 5);
      
      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('clients')
        .update({ recent_captions: updatedCaptions })
        .eq('id', selectedClient.id);
      
      if (updateError) {
        console.error("Erro ao atualizar legendas recentes:", updateError);
        toast.error("Erro ao salvar a legenda.");
      } else {
        toast.success("Legenda salva com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar legenda:", error);
      toast.error("Erro ao salvar a legenda.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Layout>
      <PageHeader
        title="Gerador de Legendas"
        description="Crie legendas para suas redes sociais"
      >
        <div className="flex gap-2">
          {selectedClient && (
            <Button 
              variant="outline"
              onClick={() => navigate(`/clients/${selectedClient.id}`)}
              className="flex items-center gap-1"
            >
              Ir para o Perfil do Cliente
            </Button>
          )}
          {/* <Button 
            variant="outline"
            onClick={() => navigate('/caption-library')}
            className="flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            Biblioteca
          </Button> */}
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select 
                  value={selectedClient?.id || ""} 
                  onValueChange={(value) => {
                    console.log("Seletor: Cliente selecionado com ID:", value);
                    const client = availableClients.find(c => c.id === value);
                    console.log("Cliente encontrado:", client ? "Sim" : "Não", client);
                    if (client) {
                      setSelectedClient(client);
                    }
                  }}
                  disabled={isLoadingClients}
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder={isLoadingClients ? "Carregando clientes..." : "Selecione um cliente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingClients ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Carregando clientes...</span>
                      </div>
                    ) : availableClients.length > 0 ? (
                      <>
                        {(() => {
                          console.log("Renderizando lista de", availableClients.length, "clientes no seletor");
                          return null;
                        })()}
                        {availableClients.map((client) => {
                          console.log("Renderizando cliente no seletor:", client.id, client.name);
                          return (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        {(() => {
                          console.log("Nenhum cliente disponível para renderizar no seletor");
                          return null;
                        })()}
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          <p>Nenhum cliente disponível</p>
                          <Button 
                            variant="link" 
                            size="sm"
                            className="mt-1 w-full"
                            onClick={() => navigate('/clients/new')}
                          >
                            Criar um novo cliente
                          </Button>
                        </div>
                      </>
                    )}
                  </SelectContent>
                </Select>
                
                {!isLoadingClients && availableClients.length === 0 && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Nenhum cliente encontrado</AlertTitle>
                    <AlertDescription>
                      Você precisa criar um cliente para gerar legendas. 
                      <Button 
                        variant="link" 
                        size="sm"
                        className="px-0 py-0 h-auto"
                        onClick={() => navigate('/clients/new')}
                      >
                        Criar cliente
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {/* Exibir informações da persona do cliente quando selecionado */}
              {clientDetails && (
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100">
                  <div className="space-y-2">
                    <h4 className="font-medium">Persona do Cliente</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-medium">Tom de Voz:</p>
                        <p className="text-muted-foreground">{persona?.tone_of_voice || persona?.tone || "Não definido"}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Valores:</p>
                        <p className="text-muted-foreground">{persona?.values || "Não definido"}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Público-Alvo:</p>
                        <p className="text-muted-foreground">{persona?.target_audience || persona?.targetAudience || "Não definido"}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Palavras-Chave:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona?.keywords && Array.isArray(persona.keywords) && persona.keywords.length > 0 ? (
                            persona.keywords.map((keyword: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Não definido</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-blue-600">
                      Estas informações da persona serão usadas para personalizar a legenda
                    </p>
                  </div>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedPlatform === 'instagram' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center"
                    onClick={() => setSelectedPlatform('instagram')}
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                  <Button
                    variant={selectedPlatform === 'facebook' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center"
                    onClick={() => setSelectedPlatform('facebook')}
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant={selectedPlatform === 'linkedin' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center"
                    onClick={() => setSelectedPlatform('linkedin')}
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prompt">O que você deseja comunicar?</Label>
                <Textarea
                  id="prompt"
                  placeholder="Descreva o que você quer comunicar na legenda. As informações da persona do cliente serão usadas automaticamente para personalizar o tom e estilo da legenda."
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              {/*
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="creative-level">Nível de Criatividade</Label>
                  <span className="text-sm text-muted-foreground">{creativeLevel[0]}%</span>
                </div>
                <Slider
                  id="creative-level"
                  min={0}
                  max={100}
                  step={10}
                  value={creativeLevel}
                  onValueChange={setCreativeLevel}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservador</span>
                  <span>Criativo</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-url">URL da Imagem (opcional)</Label>
                <div className="flex gap-2">
                  <input
                    id="image-url"
                    name="image-url"
                    type="url"
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    aria-label="URL da Imagem"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicionar uma imagem para ser salva junto com a legenda na biblioteca
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook (n8n)</Label>
                <div className="flex gap-2">
                  <input
                    id="webhook-url"
                    name="webhook-url"
                    type="url"
                    placeholder="https://your-n8n-instance.com/webhook/..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={webhookUrl}
                    onChange={(e) => {
                      setWebhookUrl(e.target.value);
                      localStorage.setItem('webhookUrl', e.target.value);
                    }}
                    aria-label="URL do Webhook"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  O payload enviado inclui as informações da persona do cliente. Configure seu webhook para utilizar estes dados no modelo de linguagem.
                </p>
              </div>
              <Alert className="text-xs border">
                <AlertTitle>Formato do novo payload</AlertTitle>
                <AlertDescription>
                  <code className="block bg-muted p-2 rounded text-[10px] overflow-auto max-h-32">
                    {`{
  "client": "Nome do Cliente",
  "prompt": "Texto do prompt",
  "platform": "instagram|facebook|linkedin|all",
  "creativityLevel": 50,
  "persona": {
    "tone": "Tom de voz do cliente",
    "values": "Valores da marca",
    "targetAudience": "Descrição do público-alvo",
    "keywords": ["palavra1", "palavra2", ...]
  },
  "clientInfo": {
    "industry": "Indústria do cliente",
    "socialMedia": [{ "type": "instagram", "username": "@usuario" }, ...]
  }
}`}
                  </code>
                </AlertDescription>
              </Alert>
              */}
              {!webhookUrl ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Webhook necessário</AlertTitle>
                  <AlertDescription>
                    Configure a URL do webhook do n8n nas opções avançadas para gerar legendas.
                  </AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                className="w-full"
                disabled={isGenerating || !selectedClient || !prompt || !webhookUrl}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Legenda
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Legenda Gerada</span>
                {selectedPlatform && (
                  <Badge className="flex items-center">
                    {getPlatformIcon(selectedPlatform)}
                    <span className="ml-1">
                      {selectedPlatform === 'instagram' ? 'Instagram' : 
                       selectedPlatform === 'facebook' ? 'Facebook' : 
                       selectedPlatform === 'linkedin' ? 'LinkedIn' : 'Todas Plataformas'}
                    </span>
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <p className="text-center text-muted-foreground">
                    Gerando legenda personalizada para <strong>{clientDetails?.name || selectedClient?.name || 'Cliente'}</strong>...
                  </p>
                </div>
              ) : generatedCaptions.length > 0 ? (
                <div className="space-y-4">
                  {generatedCaptions.map((caption, index) => (
                    <div key={index} className="border rounded-md p-4 space-y-4">
                      <p className="whitespace-pre-wrap">{caption.text || caption.content}</p>
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline" onClick={handleCopyCaption}>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleShowSaveOptions}>
                          <Save className="h-4 w-4 mr-1" />
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleViewClientProfile} disabled={!selectedClient}>
                          <Share className="h-4 w-4 mr-1" />
                          Ver Cliente
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma legenda gerada</h3>
                  <p className="text-muted-foreground">
                    Selecione um cliente, uma plataforma e descreva o que você deseja comunicar para gerar uma legenda personalizada.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/20 mt-auto">
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!generatedCaptions.length}
                  onClick={handleCopyCaption}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!generatedCaptions.length}
                  onClick={handleShowSaveOptions}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!generatedCaptions.length || !selectedClient}
                  onClick={handleViewClientProfile}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Ver Cliente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Adicionar o diálogo de confirmação de salvamento */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar legenda</DialogTitle>
            <DialogDescription>
              Escolha onde deseja salvar esta legenda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-library" 
                checked={saveToLibrary} 
                onCheckedChange={(checked) => setSaveToLibrary(checked as boolean)}
              />
              <label
                htmlFor="save-library"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Salvar na biblioteca de legendas
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>A legenda será salva no banco de dados e aparecerá na página de biblioteca de legendas</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-recent" 
                checked={saveToRecent} 
                onCheckedChange={(checked) => setSaveToRecent(checked as boolean)}
              />
              <label
                htmlFor="save-recent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Salvar nos recentes do cliente
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>A legenda aparecerá na seção de legendas recentes no perfil do cliente</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle>Dica</AlertTitle>
              <AlertDescription className="text-xs">
                Para melhor organização, recomendamos salvar em ambos os locais.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveCaption} 
              disabled={isSaving || (!saveToLibrary && !saveToRecent)}
              className="min-w-[100px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CaptionGenerator;
