import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clipboard, Calendar, Image, Instagram, Facebook, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Interface específica para o componente
export interface CaptionCardItem {
  id: string;
  text: string;
  client: string;
  createdAt: string;
  platform: string;
  imageUrl?: string | null;
  scheduledFor?: string;
}

export interface CaptionCardProps {
  caption: CaptionCardItem;
  onSchedule?: (id: string, date: Date) => void;
  onEdit?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
}

const CaptionCard: React.FC<CaptionCardProps> = ({ caption, onSchedule, onEdit, onDelete }) => {
  const { toast } = useToast();

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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return "bg-[#E1306C]/10 text-[#E1306C]";
      case 'facebook':
        return "bg-[#1877F2]/10 text-[#1877F2]";
      case 'linkedin':
        return "bg-[#0A66C2]/10 text-[#0A66C2]";
      case 'all':
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(caption.text);
    toast("Copiado!", {
      description: "Legenda copiada para área de transferência",
    });
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className={cn("overflow-hidden caption-card")}>
      {caption.imageUrl && (
        <div className="h-40 relative">
          <img
            src={caption.imageUrl}
            alt="Post preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className={cn("pt-6", !caption.imageUrl && "pb-3")}>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={cn("flex items-center", getPlatformColor(caption.platform))}>
            {getPlatformIcon(caption.platform)}
            <span className="ml-1">
              {caption.platform === 'instagram' ? 'Instagram' : 
               caption.platform === 'facebook' ? 'Facebook' : 
               caption.platform === 'linkedin' ? 'LinkedIn' : 'Todas Plataformas'}
            </span>
          </Badge>
          
          {caption.scheduledFor && (
            <Badge variant="outline" className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDateDisplay(caption.scheduledFor)}
            </Badge>
          )}
        </div>
        
        <p className="text-sm line-clamp-4">{caption.text}</p>
        
        <div className="mt-3 flex items-center text-xs text-muted-foreground">
          <span>Cliente: {caption.client}</span>
          <span className="mx-2">•</span>
          <span>Criado em: {formatDateDisplay(caption.createdAt)}</span>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 py-3 px-6">
        <div className="w-full flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleCopy}
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Copiar
          </Button>
          
          {!caption.scheduledFor && (
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          )}
          
          {!caption.imageUrl && (
            <Button variant="outline" size="sm" className="flex-1">
              <Image className="h-4 w-4 mr-2" />
              Adicionar Imagem
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CaptionCard;
