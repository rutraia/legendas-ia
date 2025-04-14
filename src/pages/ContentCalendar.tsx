import React, { useState } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  platform: 'instagram' | 'facebook' | 'linkedin' | 'all';
  client: string;
}

const ContentCalendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(getCalendarEvents());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  
  // Estados para o formulário de agendamento
  const [scheduleForm, setScheduleForm] = useState({
    client: "",
    platform: "instagram",
    title: "",
    scheduledDate: new Date(),
  });
  
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
  
  // Custom day renderer to highlight days with events
  const renderDay = (date: Date) => {
    // Safeguard against undefined date prop
    if (!date) return null;
    
    const dayEvents = getEventsForDate(date);
    const hasEvents = dayEvents.length > 0;
    
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${hasEvents ? 'calendar-day-has-content' : ''}`}>
        {date.getDate()}
      </div>
    );
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                components={{
                  Day: ({ date: dayDate }) => (
                    <div className="calendar-day">
                      {dayDate ? renderDay(dayDate) : null}
                    </div>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Events */}
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">
                {date && format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <Tabs defaultValue="events" className="h-full flex flex-col">
                <TabsList className="mb-4">
                  <TabsTrigger value="events">Eventos</TabsTrigger>
                  <TabsTrigger value="notes">Notas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="events" className="flex-1">
                  {selectedDateEvents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="flex items-center justify-between bg-card p-3 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-center">
                            {getPlatformIcon(event.platform)}
                            <span className="ml-2 font-medium">{event.title}</span>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <h3 className="font-medium mb-1">Nenhum evento para este dia</h3>
                      <p className="text-sm text-muted-foreground">
                        Selecione um dia diferente ou agende uma nova postagem
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="notes" className="flex-1">
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-sm text-muted-foreground">
                      Você ainda não adicionou nenhuma nota para este dia.
                    </p>
                    <Button variant="outline" className="mt-2">
                      Adicionar Nota
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Event Dialog */}
      {selectedEvent && (
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                Detalhes do evento programado
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{formatEventDate(selectedEvent.date)}</span>
              </div>
              
              <div className="flex items-center">
                <Badge className="flex items-center">
                  {getPlatformIcon(selectedEvent.platform)}
                  <span className="ml-1">
                    {selectedEvent.platform === 'instagram' ? 'Instagram' : 
                     selectedEvent.platform === 'facebook' ? 'Facebook' : 
                     selectedEvent.platform === 'linkedin' ? 'LinkedIn' : 'Todas Plataformas'}
                  </span>
                </Badge>
              </div>
              
              <p className="text-sm">
                Cliente: <span className="font-medium">{selectedEvent.client}</span>
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEventDialog}>
                Fechar
              </Button>
              <Button>
                Ver Conteúdo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Nova Postagem</DialogTitle>
            <DialogDescription>
              Preencha as informações para agendar uma nova postagem
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-client">Cliente</Label>
              <Select 
                value={scheduleForm.client}
                onValueChange={(value) => setScheduleForm({...scheduleForm, client: value})}
              >
                <SelectTrigger id="schedule-client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule-platform">Plataforma</Label>
              <Select 
                value={scheduleForm.platform}
                onValueChange={(value) => setScheduleForm({...scheduleForm, platform: value})}
              >
                <SelectTrigger id="schedule-platform">
                  <SelectValue placeholder="Selecione uma plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="all">Todas as plataformas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schedule-title">Título da postagem</Label>
              <Input
                id="schedule-title"
                placeholder="Ex: Lançamento de produto, Promoção de verão..."
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data de publicação</Label>
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={scheduleForm.scheduledDate}
                  onSelect={(date) => date && setScheduleForm({...scheduleForm, scheduledDate: date})}
                  className="mx-auto"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleScheduleSubmit}>
              Agendar Postagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ContentCalendar;
