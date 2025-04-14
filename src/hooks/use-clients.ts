import { useState, useEffect } from 'react';
import { Client } from '@/types';
import { getClients, getClientById, createClient, updateClient } from '@/lib/supabase/database';
import { toast } from 'sonner';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getClients();
      setClients(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(errorMessage);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const getClient = async (id: string) => {
    try {
      setError(null);
      const client = await getClientById(id);
      return client;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar cliente';
      setError(errorMessage);
      toast.error('Erro ao buscar cliente');
      return null;
    }
  };

  const addClient = async (clientData: Omit<Client, 'id'>) => {
    try {
      setError(null);
      const newClient = await createClient(clientData);
      if (newClient) {
        setClients(prev => [newClient, ...prev]);
        toast.success('Cliente criado com sucesso');
        return newClient;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente';
      setError(errorMessage);
      toast.error('Erro ao criar cliente');
      return null;
    }
  };

  const updateClientData = async (id: string, clientData: Partial<Client>) => {
    try {
      setError(null);
      const updatedClient = await updateClient(id, clientData);
      if (updatedClient) {
        setClients(prev => prev.map(client => 
          client.id === id ? { ...client, ...updatedClient } : client
        ));
        toast.success('Cliente atualizado com sucesso');
        return updatedClient;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      setError(errorMessage);
      toast.error('Erro ao atualizar cliente');
      return null;
    }
  };

  return {
    clients,
    isLoading,
    error,
    loadClients,
    getClient,
    addClient,
    updateClientData
  };
} 