import { supabase } from '../client';
import { ensureAuthenticated } from '../client';
import { Caption } from '@/types';

/**
 * Serviço para operações relacionadas a legendas no Supabase
 * Este serviço garante que as políticas de RLS sejam respeitadas
 */

/**
 * Cria uma nova legenda com segurança
 * Garante que o user_id seja passado corretamente para satisfazer políticas RLS
 */
export async function createCaptionSecurely(caption: Omit<Caption, 'id'>) {
  console.log('=== Iniciando criação segura de legenda ===');
  
  try {
    // Garantir que o usuário esteja autenticado
    const user = await ensureAuthenticated();
    
    if (!user || !user.id) {
      throw new Error('Usuário não autenticado ou ID de usuário não disponível');
    }
    
    // Verificar dados obrigatórios
    if (!caption.client_id) {
      throw new Error('ID do cliente é obrigatório');
    }
    
    if (!caption.content || !caption.content.trim()) {
      throw new Error('Conteúdo da legenda é obrigatório');
    }
    
    if (!caption.platform) {
      throw new Error('Plataforma é obrigatória');
    }
    
    // Verificar se o cliente existe e pertence ao usuário atual
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, user_id')
      .eq('id', caption.client_id)
      .eq('user_id', user.id)  // Verificar se o cliente pertence ao usuário atual
      .single();
    
    if (clientError || !clientData) {
      console.error('Cliente não encontrado ou não pertence ao usuário:', clientError);
      throw new Error('Cliente não encontrado ou você não tem permissão para acessá-lo');
    }
    
    // Criar um título a partir do conteúdo para garantir que não seja nulo
    const title = caption.title || 
                  (caption.content ? 
                    caption.content.substring(0, 50) + (caption.content.length > 50 ? '...' : '') : 
                    'Nova legenda');
                    
    // Preparar dados da legenda com o user_id e title
    const captionData = {
      ...caption,
      user_id: user.id,  // Adicionar user_id para satisfazer RLS
      created_at: new Date().toISOString(),
      title    // Garantir que title nunca seja nulo
    };
    
    console.log('Dados da legenda a serem inseridos:', captionData);
    
    // Realizar a inserção
    const { data, error } = await supabase
      .from('captions')
      .insert([captionData])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar legenda:', error);
      
      if (error.message.includes('row-level security')) {
        throw new Error('Erro de permissão: verifique as políticas de segurança do banco de dados');
      }
      
      throw error;
    }
    
    console.log('Legenda criada com sucesso:', data);
    return data;
  } catch (error: any) {
    console.error('Erro no serviço de legendas:', error);
    throw error;
  }
}

/**
 * Obtém todas as legendas do usuário atual
 */
export async function getUserCaptions() {
  try {
    const user = await ensureAuthenticated();
    
    const { data, error } = await supabase
      .from('captions')
      .select(`
        *,
        clients (id, name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar legendas do usuário:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro no serviço getUserCaptions:', error);
    return [];
  }
}

/**
 * Atualiza uma legenda garantindo permissões de usuário
 */
export async function updateCaptionSecurely(id: string, captionData: Partial<Caption>) {
  try {
    const user = await ensureAuthenticated();
    
    // Verificar se a legenda pertence ao usuário
    const { data: existingCaption, error: checkError } = await supabase
      .from('captions')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (checkError || !existingCaption) {
      throw new Error('Legenda não encontrada ou você não tem permissão para editá-la');
    }
    
    // Atualizar a legenda
    const { data, error } = await supabase
      .from('captions')
      .update(captionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar legenda:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erro no serviço updateCaptionSecurely:', error);
    throw error;
  }
} 