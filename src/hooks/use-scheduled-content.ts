import { useState, useEffect, useCallback } from 'react';
import { getCaptions, updateCaption } from '@/lib/supabase/database';
import { createCaptionSecurely } from '../lib/supabase/services/caption-service';
import { ScheduledContent, ContentStatus, Client } from '@/types';
import { toast } from 'sonner';

interface UseScheduledContentProps {
  initialFilter?: {
    client_id?: string;
    platform?: string;
    status?: ContentStatus;
  }
}

export const useScheduledContent = ({ initialFilter }: UseScheduledContentProps = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<ScheduledContent[]>([]);
  const [filters, setFilters] = useState(initialFilter || {});
  const [clients, setClients] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Função para carregar conteúdos do Supabase
  const loadContents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCaptions(filters);
      
      if (data) {
        // Processar os dados para o formato esperado
        const formattedContents = data.map(caption => {
          // Verificar se temos client info completo
          const clientName = caption.clients?.name || "Cliente";
          
          return {
            ...caption,
            client_name: clientName,
            status: (caption.status || 'draft') as ContentStatus,
            title: caption.content.slice(0, 50) + (caption.content.length > 50 ? '...' : '')
          } as ScheduledContent;
        });
        
        setContents(formattedContents);
        
        // Criar um mapa de id -> nome para clientes
        const clientMap: Record<string, string> = {};
        formattedContents.forEach(content => {
          if (content.client_id && content.client_name) {
            clientMap[content.client_id] = content.client_name;
          }
        });
        setClients(prev => ({ ...prev, ...clientMap }));
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error);
      toast.error('Erro ao carregar conteúdos agendados');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Carregar conteúdos iniciais
  useEffect(() => {
    loadContents();
  }, [loadContents]);

  // Criar um novo conteúdo agendado
  const addContent = async (content: Omit<ScheduledContent, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newContent = await createCaptionSecurely(content);
      
      if (!newContent) {
        throw new Error('Falha ao adicionar conteúdo agendado');
      }
      
      setContents(prev => [newContent, ...prev]);
      toast.success('Conteúdo agendado com sucesso');
      
      setIsLoading(false);
      return newContent;
    } catch (error: any) {
      console.error('Erro ao adicionar conteúdo:', error);
      setError(error.message || 'Erro ao adicionar conteúdo agendado');
      toast.error('Erro ao agendar conteúdo');
      
      setIsLoading(false);
      return null;
    }
  };

  // Atualizar um conteúdo existente
  const updateContent = async (id: string, updates: Partial<ScheduledContent>) => {
    try {
      const updatedContent = await updateCaption({ id, ...updates });
      if (updatedContent) {
        // Atualizar estado local
        setContents(prev => 
          prev.map(content => 
            content.id === id 
              ? { 
                  ...content, 
                  ...updatedContent,
                  client_name: clients[updatedContent.client_id] || content.client_name || 'Cliente',
                  title: updates.title || content.title
                } 
              : content
          )
        );
        
        // Sincronizar com localStorage para o calendário
        const contentToSync = contents.find(c => c.id === id);
        if (contentToSync) {
          syncWithLocalStorage({
            ...contentToSync,
            ...updatedContent,
            client_name: clients[updatedContent.client_id] || contentToSync.client_name || 'Cliente'
          });
        }
        
        return updatedContent;
      }
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      throw error;
    }
    return null;
  };

  // Sincronização com localStorage para calendário
  const syncWithLocalStorage = (content: ScheduledContent) => {
    try {
      if (!content.scheduled_for) return;
      
      // Formato esperado pelo localStorage para o calendário
      const localContent = {
        id: content.id,
        text: content.content,
        client: content.client_id,
        clientName: content.client_name || 'Cliente',
        createdAt: content.created_at,
        platform: content.platform,
        scheduledFor: content.scheduled_for,
        imageUrl: content.image_url
      };
      
      // Obter conteúdos existentes
      const storedCaptions = localStorage.getItem('captions');
      let captions = storedCaptions ? JSON.parse(storedCaptions) : [];
      
      // Verificar se o conteúdo já existe
      const existingIndex = captions.findIndex((c: any) => c.id === content.id);
      
      if (existingIndex >= 0) {
        // Atualizar existente
        captions[existingIndex] = localContent;
      } else {
        // Adicionar novo
        captions.push(localContent);
      }
      
      // Salvar no localStorage
      localStorage.setItem('captions', JSON.stringify(captions));
    } catch (error) {
      console.warn('Erro ao sincronizar com localStorage:', error);
    }
  };

  // Carregar dados iniciais do localStorage para sincronização
  useEffect(() => {
    try {
      const storedCaptions = localStorage.getItem('captions');
      if (storedCaptions) {
        const localCaptions = JSON.parse(storedCaptions);
        
        // Criar mapa para clientes
        const clientMap: Record<string, string> = {};
        localCaptions.forEach((caption: any) => {
          if (caption.client && caption.clientName) {
            clientMap[caption.client] = caption.clientName;
          }
        });
        
        if (Object.keys(clientMap).length > 0) {
          setClients(prev => ({ ...prev, ...clientMap }));
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar do localStorage:', error);
    }
  }, []);

  return {
    isLoading,
    contents,
    addContent,
    updateContent,
    reload: loadContents,
    setFilters,
    error
  };
}; 