import { useState } from 'react';
import { Caption } from '@/types';
import { getCaptions, createCaption, updateCaption } from '@/lib/supabase/database';
import { toast } from 'sonner';

export interface CaptionFilters {
  client_id?: string;
  platform?: 'instagram' | 'facebook' | 'linkedin';
  status?: 'draft' | 'scheduled' | 'published';
}

export function useCaptions() {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCaptions = async (filters?: CaptionFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCaptions(filters);
      setCaptions(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar legendas';
      setError(errorMessage);
      toast.error('Erro ao carregar legendas');
    } finally {
      setIsLoading(false);
    }
  };

  const addCaption = async (captionData: Omit<Caption, 'id'>) => {
    try {
      setError(null);
      const newCaption = await createCaption(captionData);
      if (newCaption) {
        setCaptions(prev => [newCaption, ...prev]);
        toast.success('Legenda criada com sucesso');
        return newCaption;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar legenda';
      setError(errorMessage);
      toast.error('Erro ao criar legenda');
      return null;
    }
  };

  const updateCaptionData = async (id: string, captionData: Partial<Caption>) => {
    try {
      setError(null);
      const updatedCaption = await updateCaption(id, captionData);
      if (updatedCaption) {
        setCaptions(prev => prev.map(caption => 
          caption.id === id ? { ...caption, ...updatedCaption } : caption
        ));
        toast.success('Legenda atualizada com sucesso');
        return updatedCaption;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar legenda';
      setError(errorMessage);
      toast.error('Erro ao atualizar legenda');
      return null;
    }
  };

  const scheduleCaption = async (id: string, scheduledFor: string) => {
    try {
      setError(null);
      const updatedCaption = await updateCaption(id, {
        status: 'scheduled',
        scheduled_for: scheduledFor
      });
      if (updatedCaption) {
        setCaptions(prev => prev.map(caption => 
          caption.id === id ? { ...caption, ...updatedCaption } : caption
        ));
        toast.success('Legenda agendada com sucesso');
        return updatedCaption;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao agendar legenda';
      setError(errorMessage);
      toast.error('Erro ao agendar legenda');
      return null;
    }
  };

  return {
    captions,
    isLoading,
    error,
    loadCaptions,
    addCaption,
    updateCaptionData,
    scheduleCaption
  };
} 