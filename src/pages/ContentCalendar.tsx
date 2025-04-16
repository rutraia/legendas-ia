import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Facebook, Linkedin, ExternalLink, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';
import { getClients, getScheduledCaptions } from '@/lib/supabase/database';
import { Client, ContentStatus, ScheduledContent, CalendarEvent } from '@/types';
import { useNavigate } from 'react-router-dom';

// Interface para o formato esperado pelo FullScreenCalendar
interface CalendarData {
  day: Date;
  events: {
    id: number;
    name: string;
    time: string;
    datetime: string;
  }[];
}

// Interface estendida para eventos do calendário com campos adicionais
interface ExtendedCalendarEvent extends CalendarEvent {
  scheduled_for?: string;
}

const ContentCalendar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Função auxiliar para normalizar datas
  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(12, 0, 0, 0);
    return normalized;
  };
  
  // Inicializar com a data de hoje normalizada
  const [date, setDate] = useState<Date | undefined>(normalizeDate(new Date()));
  const [events, setEvents] = useState<ExtendedCalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedCalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  // Carregar eventos agendados do Supabase
  const loadScheduledEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const scheduledEvents = await getScheduledCaptions();
      // Tratar os eventos como ExtendedCalendarEvent
      setEvents(scheduledEvents as ExtendedCalendarEvent[]);
      
      if (scheduledEvents.length === 0) {
        toast.info('Nenhuma postagem agendada encontrada. Use a tela de programação para agendar suas publicações!');
      }
    } catch (error) {
      console.error('Erro ao carregar eventos agendados:', error);
      toast.error('Erro ao carregar eventos do calendário');
    } finally {
      setIsLoadingEvents(false);
    }
  };
  
  // Carregar eventos ao iniciar
  useEffect(() => {
    loadScheduledEvents();
  }, []);
  
  // Converter os eventos existentes para o formato esperado pelo FullScreenCalendar
  useEffect(() => {
    const formattedData: CalendarData[] = [];
    const eventsByDate: { [key: string]: ExtendedCalendarEvent[] } = {};
    
    // Agrupar eventos por data (usando apenas a parte da data, sem a hora)
    events.forEach(event => {
      // Usar scheduled_for se disponível, caso contrário usar date
      const eventDate = new Date(event.scheduled_for || event.date);
      eventDate.setHours(12, 0, 0, 0);
      
      // Usar apenas a parte da data como chave (YYYY-MM-DD)
      const dateKey = eventDate.toISOString().split('T')[0];
      
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push({
        ...event,
        date: eventDate.toISOString() // Usar a data normalizada
      });
    });
    
    // Converter para o formato esperado
    Object.keys(eventsByDate).forEach(dateKey => {
      // Criar uma data a partir da chave (que é apenas YYYY-MM-DD)
      const dayDate = new Date(dateKey + 'T12:00:00.000Z');
      
      const calendarDay: CalendarData = {
        day: dayDate,
        events: eventsByDate[dateKey].map((event, index) => ({
          id: index + 1,
          name: event.title || 'Sem título',
          time: format(new Date(event.scheduled_for || event.date), 'HH:mm'),
          datetime: event.scheduled_for || event.date
        }))
      };
      formattedData.push(calendarDay);
    });
    
    setCalendarData(formattedData);
  }, [events]);
  
  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.scheduled_for || event.date);
      const isMatchingDate = 
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();
      
      return isMatchingDate;
    });
    
    return filteredEvents;
  };
  
  const selectedDateEvents = date ? getEventsForDate(date) : [];
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-[#E1306C]" />;
      case 'facebook':
        return <Facebook className="h-4 w-4 text-[#1877F2]" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-[#0A66C2]" />;
      default:
        return null;
    }
  };
  
  const handleEventClick = (event: ExtendedCalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };
  
  const handleCloseEventDialog = () => {
    setSelectedEvent(null);
    setIsEventDialogOpen(false);
  };
  
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  const handleGoToSchedule = () => {
    navigate('/content-schedule');
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Agendado</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Publicado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };
  
  return (
    <Layout>
      <PageHeader 
        title="Calendário de Conteúdo" 
        description="Visualize todas as postagens agendadas em um calendário"
      >
        <Button variant="outline" onClick={handleGoToSchedule}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Ir para Programação
        </Button>
      </PageHeader>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8 w-full">
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent className="p-0">
              {isLoadingEvents ? (
                <div className="flex items-center justify-center h-[300px] md:h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Carregando calendário...</span>
                </div>
              ) : (
                <div className="h-[300px] md:h-[500px] p-2">
                  <FullScreenCalendar 
                    data={calendarData} 
                    onSelectDay={(day) => setDate(day)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="w-full md:w-1/3 max-w-md">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Eventos do Dia
                  {date && (
                    <span className="block text-sm font-normal text-muted-foreground mt-1">
                      {format(date, "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  )}
                </CardTitle>
                {/* <Button variant="outline" size="sm" onClick={handleGoToSchedule}>
                  Ir para Programação
                </Button> */}
              </div>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma postagem agendada para esta data</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={handleGoToSchedule}
                  >
                    Agendar nova postagem
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getPlatformIcon(event.platform)}
                          <span className="ml-2 capitalize font-medium">{event.platform}</span>
                        </div>
                        {event.status && getStatusBadge(event.status as ContentStatus)}
                      </div>
                      <h4 className="font-semibold">{event.title || 'Sem título'}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.scheduled_for || event.date), "HH:mm", { locale: ptBR })}
                        {event.client && ` • ${event.client}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Diálogo de detalhes do evento */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Postagem</DialogTitle>
                <DialogDescription>
                  Informações sobre a postagem agendada
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPlatformIcon(selectedEvent.platform)}
                    <span className="capitalize font-medium">{selectedEvent.platform}</span>
                  </div>
                  {selectedEvent.status && getStatusBadge(selectedEvent.status as ContentStatus)}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-1">{selectedEvent.title || 'Sem título'}</h3>
                  <p className="text-sm text-muted-foreground">
                    Agendado para {formatEventDate(selectedEvent.scheduled_for || selectedEvent.date)}
                  </p>
                </div>
                
                {selectedEvent.client && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Cliente</h4>
                    <p>{selectedEvent.client}</p>
                  </div>
                )}
                
                {selectedEvent.content && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Conteúdo</h4>
                    <div className="max-h-[200px] overflow-y-auto border rounded-md p-3 text-sm whitespace-pre-wrap">
                      {selectedEvent.content}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={handleCloseEventDialog}
                >
                  Fechar
                </Button>
                <Button 
                  onClick={handleGoToSchedule}
                >
                  Ir para Programação
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ContentCalendar;
