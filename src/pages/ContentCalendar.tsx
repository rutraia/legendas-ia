import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCalendarEvents, clients, captions } from '@/lib/data';
import { Instagram, Facebook, Linkedin, ExternalLink, Calendar as CalendarIcon } from 'lucide-react';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateId } from '@/lib/utils';
import { Caption } from '@/components/CaptionCard';
import { toast } from 'sonner';
import { FullScreenCalendar } from '@/components/ui/fullscreen-calendar';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  platform: 'instagram' | 'facebook' | 'linkedin' | 'all';
  client: string;
}

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

const ContentCalendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(getCalendarEvents());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  
  // Estados para o formulário de agendamento
  const [scheduleForm, setScheduleForm] = useState({
    client: "",
    platform: "instagram",
    title: "",
    scheduledDate: new Date(),
  });
  
  // Converter os eventos existentes para o formato esperado pelo FullScreenCalendar
  useEffect(() => {
    const formattedData: CalendarData[] = [];
    const eventsByDate: { [key: string]: CalendarEvent[] } = {};
    
    // Agrupar eventos por data
    events.forEach(event => {
      const dateKey = new Date(event.date).toISOString().split('T')[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });
    
    // Converter para o formato esperado
    Object.keys(eventsByDate).forEach(dateKey => {
      const calendarDay: CalendarData = {
        day: new Date(dateKey),
        events: eventsByDate[dateKey].map((event, index) => ({
          id: index + 1,
          name: event.title,
          time: format(new Date(event.date), 'HH:mm'),
          datetime: event.date
        }))
      };
      formattedData.push(calendarDay);
    });
    
    setCalendarData(formattedData);
  }, [events]);
  
  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
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
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };
  
  const handleCloseEventDialog = () => {
    setSelectedEvent(null);
    setIsEventDialogOpen(false);
  };
  
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  const handleOpenScheduleDialog = () => {
    if (date) {
      setScheduleForm({
        ...scheduleForm,
        scheduledDate: date
      });
    }
    setIsScheduleDialogOpen(true);
  };
  
  const handleScheduleSubmit = () => {
    if (!scheduleForm.client || !scheduleForm.title) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      // Criar novo evento no calendário
      const newEvent: CalendarEvent = {
        id: generateId(),
        title: scheduleForm.title,
        date: scheduleForm.scheduledDate.toISOString(),
        platform: scheduleForm.platform as any,
        client: scheduleForm.client
      };
      
      // Criar nova legenda agendada (sem texto ainda)
      const newCaption: Caption = {
        id: newEvent.id,
        text: `Conteúdo a ser definido para ${scheduleForm.client}`,
        client: scheduleForm.client,
        createdAt: new Date().toISOString(),
        platform: scheduleForm.platform as any,
        scheduledFor: scheduleForm.scheduledDate.toISOString()
      };
      
      // Atualizar estado local
      setEvents([...events, newEvent]);
      
      // Armazenar no localStorage
      const currentCaptions = localStorage.getItem('captions')
        ? JSON.parse(localStorage.getItem('captions') || '[]')
        : [...captions];
      
      localStorage.setItem('captions', JSON.stringify([...currentCaptions, newCaption]));
      
      // Fechar diálogo e mostrar toast de sucesso
      setIsScheduleDialogOpen(false);
      toast.success("Nova postagem agendada com sucesso");
      
      // Resetar formulário
      setScheduleForm({
        client: "",
        platform: "instagram",
        title: "",
        scheduledDate: new Date(),
      });
    } catch (error) {
      console.error("Erro ao agendar postagem:", error);
      toast.error("Ocorreu um erro ao agendar a postagem. Tente novamente.");
    }
  };
  
  return (
    <Layout>
      <PageHeader
        title="Calendário de Conteúdo"
        description="Veja e gerencie seu calendário de postagens"
      >
        <Button onClick={handleOpenScheduleDialog}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Agendar Nova Postagem
        </Button>
      </PageHeader>
      
      <div className="h-full mb-6">
        <FullScreenCalendar data={calendarData} />
      </div>
      
      {/* Dialogs */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Evento</DialogTitle>
            <DialogDescription>
              {selectedEvent && formatEventDate(selectedEvent.date)}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <div className="text-lg font-medium">{selectedEvent.title}</div>
              </div>
              <div>
                <Label>Cliente</Label>
                <div>{clients.find(c => c.id === selectedEvent.client)?.name || selectedEvent.client}</div>
              </div>
              <div>
                <Label>Plataforma</Label>
                <div className="flex items-center">
                  {getPlatformIcon(selectedEvent.platform)}
                  <span className="ml-2">
                    {selectedEvent.platform === 'instagram' ? 'Instagram' : 
                     selectedEvent.platform === 'facebook' ? 'Facebook' : 
                     selectedEvent.platform === 'linkedin' ? 'LinkedIn' : 'Todas Plataformas'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleCloseEventDialog}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Nova Postagem</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para agendar uma nova postagem nas redes sociais.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Select 
                value={scheduleForm.client} 
                onValueChange={(value) => setScheduleForm({...scheduleForm, client: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="platform">Plataforma</Label>
              <Select 
                value={scheduleForm.platform} 
                onValueChange={(value) => setScheduleForm({...scheduleForm, platform: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Título do Conteúdo</Label>
              <Input 
                id="title" 
                placeholder="Título ou descrição curta" 
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleScheduleSubmit}>Agendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ContentCalendar;
