import { useState } from 'react';
import { Caption } from '@/types';
import { getCaptions, updateCaption } from '@/lib/supabase/database';
import { toast } from 'sonner';
import { createCaptionSecurely } from '../lib/supabase/services/caption-service';

export interface CaptionFilters {
  client_id?: string;
  platform?: string;
  status?: string;
}

export function useCaptions(initialFilters?: CaptionFilters) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CaptionFilters>(initialFilters || {});

  const fetchCaptions = async (customFilters?: CaptionFilters) => {
    const appliedFilters = customFilters || filters;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCaptions(appliedFilters);
      setCaptions(data);
      setIsLoading(false);
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar legendas:', error);
      setError(error.message || 'Erro ao buscar legendas');
      setIsLoading(false);
      return [];
    }
  };

  const createNewCaption = async (captionData: Omit<Caption, 'id'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newCaption = await createCaptionSecurely(captionData);
      setCaptions(prevCaptions => [newCaption, ...prevCaptions]);
      setIsLoading(false);
      return newCaption;
    } catch (error: any) {
      console.error('Erro ao criar legenda:', error);
      setError(error.message || 'Erro ao criar legenda');
      setIsLoading(false);
      return null;
    }
  };

  const updateExistingCaption = async (id: string, captionData: Partial<Caption>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedCaption = await updateCaption({ 
        id, 
        ...captionData 
      });
      
      setCaptions(prevCaptions => 
        prevCaptions.map(caption => 
          caption.id === id ? updatedCaption : caption
        )
      );
      
      setIsLoading(false);
      return updatedCaption;
    } catch (error: any) {
      console.error('Erro ao atualizar legenda:', error);
      setError(error.message || 'Erro ao atualizar legenda');
      setIsLoading(false);
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
    filters,
    setFilters,
    fetchCaptions,
    createCaption: createNewCaption,
    updateCaption: updateExistingCaption,
    scheduleCaption
  };
} 