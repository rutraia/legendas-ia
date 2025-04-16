import { supabase } from './client';
import { ensureAuthenticated } from './client';
import { Client, Caption, Persona, SocialMedia } from '@/types';
import { CalendarEvent, ContentStatus } from '../../types';

// Funções para Clientes
export async function getClients() {
  console.log('=== Iniciando busca de clientes no Supabase ===');
  try {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        personas (*),
        social_media (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('Nenhum cliente encontrado na consulta principal');
    } else {
      console.log(`Encontrados ${data.length} clientes na consulta principal`);
      
      // Log detalhado dos clientes encontrados
      data.forEach((client, index) => {
        console.log(`Cliente ${index+1}: ${client.name} (ID: ${client.id})`);
        console.log(`- Personas: ${client.personas ? (Array.isArray(client.personas) ? client.personas.length : 'Objeto') : 'Nenhuma'}`);
        console.log(`- Social Media: ${client.social_media ? (Array.isArray(client.social_media) ? client.social_media.length : 'Objeto') : 'Nenhuma'}`);
      });
    }

    return data;
  } catch (error: any) {
    console.error('Erro ao buscar clientes. Tentando abordagem alternativa:', error);
    
    // Fallback: buscar apenas clientes sem relações
    try {
      console.log('Executando consulta fallback para clientes');
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar clientes com fallback:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('Nenhum cliente encontrado na consulta fallback');
        return [];
      }
      
      console.log(`Encontrados ${data.length} clientes na consulta fallback`);
      
      // Log detalhado dos clientes encontrados no fallback
      data.forEach((client, index) => {
        console.log(`Cliente ${index+1}: ${client.name} (ID: ${client.id})`);
      });
      
      return data;
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError);
      return []; // Retorna array vazio em vez de propagar o erro
    }
  }
}

export async function getClientById(id: string) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        personas (*),
        social_media (*),
        captions (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar cliente com relações:', error);
    
    // Fallback: buscar apenas o cliente sem relações
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar cliente com fallback:', error);
        return null;
      }
      
      return data;
    } catch (fallbackError) {
      console.error('Erro no fallback getClientById:', fallbackError);
      return null;
    }
  }
}

export async function createClient(client: Omit<Client, 'id'>) {
  console.log('=== Iniciando criação de cliente simplificada ===');
  console.log('Dados recebidos:', client);
  
  try {
    // Tentar obter a sessão do usuário atual
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Dados da sessão:', sessionData);
    
    // Verificar se há um usuário autenticado
    if (!sessionData.session) {
      console.error('ERRO: Sessão não encontrada - usuário não autenticado');
      throw new Error('Você precisa estar logado para criar um cliente.');
    }
    
    const user_id = sessionData.session.user.id;
    console.log('ID do usuário da sessão:', user_id);
    
    // Criar objeto de cliente com user_id
    const clientData = {
      ...client,
      user_id
    };
    
    console.log('Objeto do cliente com user_id:', clientData);
    
    // Inserir o cliente no banco de dados
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) {
      console.error('=== Erro ao criar cliente ===');
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('=== Cliente criado com sucesso ===');
    console.log('Dados do cliente criado:', data);
    return data;
  } catch (error: any) {
    console.error('=== Erro na chamada do Supabase ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

export async function updateClient(id: string, client: Partial<Client>) {
  console.log('=== Iniciando atualização de cliente ===');
  console.log('ID do cliente:', id);
  console.log('Dados a serem atualizados:', client);
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(client)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('=== Erro ao atualizar cliente ===');
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('=== Cliente atualizado com sucesso ===');
    console.log('Dados atualizados:', data);
    return data;
  } catch (error: any) {
    console.error('=== Erro na chamada do Supabase ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

export async function deleteClient(id: string) {
  console.log('=== Iniciando exclusão de cliente ===');
  console.log('ID do cliente:', id);
  
  try {
    // Primeiro, excluir registros relacionados
    // Excluir social_media
    const { error: socialMediaError } = await supabase
      .from('social_media')
      .delete()
      .eq('client_id', id);
    
    if (socialMediaError) {
      console.error('Erro ao excluir redes sociais:', socialMediaError);
      // Continue mesmo com erro
    }
    
    // Excluir personas
    const { error: personasError } = await supabase
      .from('personas')
      .delete()
      .eq('client_id', id);
    
    if (personasError) {
      console.error('Erro ao excluir personas:', personasError);
      // Continue mesmo com erro
    }
    
    // Excluir captions
    const { error: captionsError } = await supabase
      .from('captions')
      .delete()
      .eq('client_id', id);
    
    if (captionsError) {
      console.error('Erro ao excluir legendas:', captionsError);
      // Continue mesmo com erro
    }
    
    // Finalmente, excluir o cliente
    const { error: clientError } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (clientError) {
      console.error('Erro ao excluir cliente:', clientError);
      throw clientError;
    }
    
    console.log('=== Cliente excluído com sucesso ===');
    return true;
  } catch (error: any) {
    console.error('=== Erro na exclusão do cliente ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Funções para Personas
export async function updatePersona(clientId: string, persona: Partial<Persona>) {
  console.log('=== Iniciando atualização de persona ===');
  console.log('ID do cliente:', clientId);
  console.log('Dados da persona a serem atualizados:', persona);
  
  try {
    // Primeiro verificamos se já existe uma persona para este cliente
    const { data: existingPersonas, error: queryError } = await supabase
      .from('personas')
      .select('*')
      .eq('client_id', clientId);
      
    if (queryError) {
      console.error('Erro ao verificar personas existentes:', queryError);
    }
    
    const personaData = {
      client_id: clientId,
      ...persona
    };
    
    // Se já existe uma persona, incluímos o ID para atualizar em vez de criar nova
    if (existingPersonas && existingPersonas.length > 0) {
      console.log('Persona existente encontrada, ID:', existingPersonas[0].id);
      personaData.id = existingPersonas[0].id;
    } else {
      console.log('Nenhuma persona existente encontrada, criando nova');
    }
    
    const { data, error } = await supabase
      .from('personas')
      .upsert(personaData)
      .select()
      .single();

    if (error) {
      console.error('=== Erro ao atualizar persona ===');
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('=== Persona atualizada com sucesso ===');
    console.log('Dados atualizados:', data);
    return data;
  } catch (error: any) {
    console.error('=== Erro na chamada do Supabase para persona ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

// Funções para Legendas
export async function getCaptions(filters?: {
  client_id?: string;
  platform?: string;
  status?: string;
}) {
  let query = supabase
    .from('captions')
    .select(`
      *,
      clients (*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.client_id) {
    query = query.eq('client_id', filters.client_id);
  }

  if (filters?.platform) {
    query = query.eq('platform', filters.platform);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar legendas:', error);
    return [];
  }

  return data;
}

export async function createCaption(caption: Omit<Caption, 'id'>) {
  console.log('=== Iniciando criação de legenda ===');
  console.log('Dados da legenda:', caption);
  
  try {
    // Verificar se temos um client_id válido
    if (!caption.client_id) {
      console.error('Erro: client_id é obrigatório para criar uma legenda.');
      throw new Error('ID do cliente é obrigatório para criar uma legenda');
    }
    
    // Verificar se temos conteúdo
    if (!caption.content || !caption.content.trim()) {
      console.error('Erro: content é obrigatório para criar uma legenda.');
      throw new Error('Conteúdo da legenda é obrigatório');
    }
    
    // Verificar se temos plataforma válida
    if (!caption.platform) {
      console.error('Erro: platform é obrigatória para criar uma legenda.');
      throw new Error('Plataforma é obrigatória para criar uma legenda');
    }
    
    // Garantir que o usuário esteja autenticado usando a função auxiliar
    try {
      await ensureAuthenticated();
    } catch (authError) {
      console.error('Erro ao autenticar usuário:', authError);
      throw new Error('Você precisa estar logado para criar uma legenda');
    }
    
    // Verificar se o cliente existe e se o usuário tem permissão para acessá-lo
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, user_id')
        .eq('id', caption.client_id)
        .single();
        
      if (clientError || !clientData) {
        console.error('Erro: cliente não encontrado:', caption.client_id);
        console.error('Detalhes do erro:', clientError);
        throw new Error(`Cliente com ID ${caption.client_id} não encontrado`);
      }
      
      // Verificar se o usuário atual é o dono do cliente
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user.id;
      
      if (clientData.user_id !== currentUserId) {
        console.error('Erro: usuário não tem permissão para este cliente');
        throw new Error('Você não tem permissão para criar legendas para este cliente');
      }
      
      console.log('Cliente verificado com sucesso:', clientData);
    } catch (clientCheckError) {
      console.error('Erro ao verificar cliente:', clientCheckError);
      throw new Error('Falha ao verificar o cliente associado à legenda');
    }
    
    // Obter o ID do usuário atual
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user.id;
    
    if (!currentUserId) {
      throw new Error('Não foi possível identificar o usuário atual');
    }
    
    // Normalizar o objeto da legenda
    const normalizedCaption = {
      client_id: caption.client_id,
      content: caption.content.trim(),
      platform: caption.platform,
      status: caption.status || 'draft',
      image_url: caption.image_url || null,
      scheduled_for: caption.scheduled_for || null,
      created_at: new Date().toISOString(),
      user_id: currentUserId  // Adicionar o ID do usuário - fundamental para RLS
    };
    
    console.log('Dados normalizados da legenda:', normalizedCaption);
    
    // Inserir a legenda no banco de dados
    try {
      const { data, error } = await supabase
        .from('captions')
        .insert([normalizedCaption])
        .select()
        .single();
        
      if (error) {
        console.error('=== Erro ao criar legenda ===');
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        if (error.message && error.message.includes('row-level security')) {
          throw new Error('Erro de permissão: você não tem autorização para criar legendas para este cliente');
        }
        
        // Verificar tipos específicos de erro
        if (error.code === '23503') {
          throw new Error('Referência inválida: o cliente pode não existir ou estar inacessível');
        } else if (error.code === '23505') {
          throw new Error('Uma legenda idêntica já existe');
        } else if (error.code === '42P01') {
          throw new Error('Erro na estrutura do banco de dados: a tabela de legendas pode não existir');
        }
        
        throw error;
      }

      console.log('=== Legenda criada com sucesso ===');
      console.log('Dados da legenda criada:', data);
      return data;
    } catch (insertError: any) {
      console.error('Erro ao inserir legenda:', insertError);
      throw insertError;
    }
  } catch (error: any) {
    console.error('=== Erro na chamada do Supabase ao criar legenda ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    
    // Verificar problemas de conexão/rede
    if (error.message && error.message.includes('fetch')) {
      console.error('Possível problema de conexão com o servidor Supabase');
      throw new Error('Falha na conexão com o banco de dados. Verifique sua conexão de internet.');
    }
    
    throw error;
  }
}

export async function updateCaption(caption: Partial<Caption> & { id: string }) {
  console.log('=== Iniciando atualização de legenda ===');
  console.log('ID da legenda:', caption.id);
  console.log('Dados da legenda:', caption);

  try {
    const { data, error } = await supabase
      .from('captions')
      .update(caption)
      .eq('id', caption.id)
      .select()
      .single();

    if (error) {
      console.error('=== Erro ao atualizar legenda ===');
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('=== Legenda atualizada com sucesso ===');
    console.log('Dados atualizados:', data);
    return data;
  } catch (error: any) {
    console.error('=== Erro na chamada do Supabase para atualizar legenda ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    
    throw error;
  }
}

// Funções para Redes Sociais
export async function updateSocialMedia(clientId: string, socialMedia: SocialMedia[]) {
  console.log('=== Iniciando atualização de redes sociais ===');
  console.log('ID do cliente:', clientId);
  console.log('Dados das redes sociais:', socialMedia);

  try {
    // Primeiro, excluir todas as redes sociais existentes para este cliente
    console.log('Excluindo redes sociais existentes para o cliente:', clientId);
    const { error: deleteError } = await supabase
      .from('social_media')
      .delete()
      .eq('client_id', clientId);

    if (deleteError) {
      console.error('=== Erro ao excluir redes sociais existentes ===');
      console.error('Detalhes do erro:', {
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        code: deleteError.code
      });
      throw deleteError;
    }

    // Verificar se existem redes sociais para inserir
    if (socialMedia.length === 0) {
      console.log('Nenhuma rede social para inserir. Processo concluído.');
      return [];
    }

    // Filtrar duplicatas por plataforma (garantindo que só existe uma entrada por tipo)
    const uniqueSocialMedia = socialMedia.reduce((acc: SocialMedia[], current) => {
      const isDuplicate = acc.find(item => item.platform.toLowerCase() === current.platform.toLowerCase());
      if (!isDuplicate) {
        acc.push(current);
      } else {
        console.log(`Entrada duplicada ignorada para a plataforma: ${current.platform}`);
      }
      return acc;
    }, []);

    console.log('Redes sociais únicas a serem inseridas:', uniqueSocialMedia);

    // Inserir as novas redes sociais
    const { data, error } = await supabase
      .from('social_media')
      .insert(
        uniqueSocialMedia.map(sm => ({
          client_id: clientId,
          platform: sm.platform,
          username: sm.username
        }))
      )
      .select();

    if (error) {
      console.error('=== Erro ao inserir novas redes sociais ===');
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('=== Redes sociais atualizadas com sucesso ===');
    console.log('Dados atualizados:', data);
    return data;
  } catch (error: any) {
    console.error('=== Erro na chamada do Supabase ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

/**
 * Obtém todas as legendas agendadas (onde scheduled_for não é nulo)
 * Retorna array de objetos CalendarEvent para uso no calendário e biblioteca de legendas
 */
export async function getScheduledCaptions(): Promise<CalendarEvent[]> {
  console.log('🔍 Iniciando busca de legendas agendadas');
  try {
    console.log('🚀 Preparando consulta ao Supabase');
    const { data, error } = await supabase
      .from('captions')
      .select(`
        id, 
        content, 
        platform, 
        scheduled_for, 
        status,
        title,
        client_id,
        clients (id, name)
      `)
      .not('scheduled_for', 'is', null)
      .order('scheduled_for', { ascending: true });

    console.log('📊 Resultado da consulta:', { data, error });

    if (error) {
      console.error('❌ Erro ao buscar legendas agendadas:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ Nenhuma legenda agendada encontrada');
      return [];
    }

    const scheduledEvents: CalendarEvent[] = data.map((caption: any) => {
      console.log('🔄 Processando legenda:', caption);
      
      const clientData = caption.clients as unknown as { id: string; name: string } | null;
      const clientName = clientData?.name || 'Cliente';
      const scheduledDate = caption.scheduled_for ? new Date(caption.scheduled_for) : new Date();

      return {
        id: caption.id,
        title: caption.title || `${clientName} - ${caption.platform}`,
        date: scheduledDate.toISOString(),
        platform: caption.platform,
        client: clientName,
        client_id: caption.client_id,
        content: caption.content,
        scheduled_for: caption.scheduled_for,
        status: caption.status
      };
    });

    console.log('✅ Legendas agendadas processadas:', scheduledEvents);
    return scheduledEvents;
  } catch (err) {
    console.error('🚨 Erro crítico ao buscar legendas agendadas:', err);
    return [];
  }
} 