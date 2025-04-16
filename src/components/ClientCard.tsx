import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Client, SocialMedia as ClientSocialMedia } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Interface local para compatibilidade
interface SocialMedia {
  type?: string;
  platform?: string;
  username: string;
}

export interface ClientCardProps {
  client: Client;
  onDelete?: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onDelete }) => {
  // Função auxiliar para obter as iniciais do nome do cliente
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getSocialIcon = (type: string) => {
    switch (type?.toLowerCase() || '') {
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

  // Organizar as redes sociais independente do formato e remover duplicatas
  const formatSocialMedia = (): SocialMedia[] => {
    if (!client.socialMedia || !Array.isArray(client.socialMedia) || client.socialMedia.length === 0) {
      return [];
    }
    
    // Mapear e normalizar os itens primeiro
    const mappedSocialMedia = client.socialMedia.map(sm => ({
      type: ((sm as any).type || (sm as any).platform || '').toLowerCase(),
      username: sm.username
    }));
    
    // Usar reduce para eliminar duplicatas por tipo/plataforma
    return mappedSocialMedia.reduce((acc: SocialMedia[], current) => {
      // Verificar se já existe uma entrada com esse tipo/plataforma
      const isDuplicate = acc.find(item => item.type === current.type);
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);
  };

  const socialMediaList = formatSocialMedia();

  const handleDelete = () => {
    if (onDelete) {
      onDelete(client.id);
    }
  };

  return (
    <Card className="rounded-lg border bg-card text-card-foreground h-full hover:border-primary/80 transition-all cursor-pointer shadow-lg group-hover:scale-[1.02] group-hover:shadow-xl bg-gradient-to-br from-primary/5 to-background/80">
      <CardContent className="p-7 flex flex-col gap-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-3 bg-accent/40">
              {client.avatarUrl ? (
                <img src={client.avatarUrl} alt={client.name} />
              ) : (
                <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                  {client.initials || getInitials(client.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-bold text-lg mb-1 text-primary dark:text-accent-foreground">{client.name}</h3>
              <Badge variant="outline" className="mt-1 px-2 py-0.5 border-accent text-accent bg-accent/20 font-medium rounded-full">{client.industry}</Badge>
            </div>
          </div>
        </div>
        {socialMediaList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {socialMediaList.map((sm, index) => (
              <Badge key={index} variant="secondary" className="flex items-center bg-accent/20 border-0 px-2 py-0.5 rounded-full text-xs text-accent-foreground">
                {getSocialIcon(sm.type || '')}
                <span className="ml-1">{sm.username}</span>
              </Badge>
            ))}
          </div>
        )}
        {client.lastActivity && (
          <p className="text-xs text-muted-foreground mt-3">Última atividade: {client.lastActivity}</p>
        )}
      </CardContent>
      <CardFooter className="bg-transparent py-3 px-6 flex justify-between border-0">
        <Link to={`/clients/${client.id}`} className="flex-1 mr-2">
          <Button variant="ghost" className="w-full justify-between rounded-full font-medium text-accent border-accent/40 hover:bg-accent/20 shadow-sm">
            <span>Ver perfil</span>
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/70 dark:hover:text-red-300 hover:bg-red-50 hover:text-red-700 rounded-full font-medium shadow-sm transition-colors duration-200"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span>Excluir</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default ClientCard;
