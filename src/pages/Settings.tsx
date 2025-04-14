
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Settings = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('https://n8n-n8n.bybaju.easypanel.host/webhook/legenda');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [webhookTestStatus, setWebhookTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  useEffect(() => {
    const savedWebhookUrl = localStorage.getItem('webhookUrl');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
  }, []);
  
  const handleSaveWebhookSettings = () => {
    localStorage.setItem('webhookUrl', webhookUrl);
    toast({
      title: "Configurações salvas",
      description: "As configurações do webhook foram atualizadas com sucesso",
    });
  };
  
  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "URL não configurada",
        description: "Informe a URL do webhook antes de testar",
        variant: "destructive",
      });
      return;
    }
    
    setWebhookTestStatus('loading');
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
          message: 'Teste de conexão do webhook',
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setWebhookTestStatus('success');
        toast({
          title: "Teste bem-sucedido",
          description: "O webhook respondeu corretamente ao teste.",
        });
      } else {
        setWebhookTestStatus('error');
        toast({
          title: "Erro ao testar webhook",
          description: `O servidor retornou um erro: ${response.status} ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      setWebhookTestStatus('error');
      toast({
        title: "Erro ao testar webhook",
        description: "Ocorreu um erro ao se comunicar com o webhook. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveNotificationSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações de notificação foram atualizadas com sucesso",
    });
  };
  
  return (
    <Layout>
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da sua aplicação"
      />
      
      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do n8n</CardTitle>
                <CardDescription>
                  Configure a integração com o n8n para geração de legendas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook-url"
                      placeholder="https://your-n8n-instance.com/webhook/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                    <Button onClick={handleSaveWebhookSettings}>Salvar</Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      onClick={handleTestWebhook}
                      disabled={webhookTestStatus === 'loading'}
                    >
                      {webhookTestStatus === 'loading' ? 'Testando...' : 'Testar Conexão'}
                    </Button>
                  </div>
                  
                  {webhookTestStatus === 'success' && (
                    <Alert className="mt-2 bg-green-50 text-green-800 border-green-200">
                      <AlertTitle>Teste enviado com sucesso</AlertTitle>
                      <AlertDescription>
                        O teste foi enviado para o webhook. Usando modo 'no-cors' para compatibilidade.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {webhookTestStatus === 'error' && (
                    <Alert className="mt-2" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro ao testar webhook</AlertTitle>
                      <AlertDescription>
                        Ocorreu um erro ao se comunicar com o webhook. Verifique a URL e tente novamente.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    URL do webhook do seu fluxo de trabalho n8n para a geração de legendas.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Importante:</strong> O webhook configurado (<code>https://n8n-n8n.bybaju.easypanel.host/webhook/legenda</code>) está usando o modo 'no-cors' para contornar restrições de CORS.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Integrações com Redes Sociais</CardTitle>
                <CardDescription>
                  Conecte suas contas de redes sociais para postagens diretas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-[#E1306C]/10 h-10 w-10 rounded-full flex items-center justify-center mr-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Instagram</h3>
                      <p className="text-sm text-muted-foreground">Não conectado</p>
                    </div>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-[#1877F2]/10 h-10 w-10 rounded-full flex items-center justify-center mr-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Facebook</h3>
                      <p className="text-sm text-muted-foreground">Não conectado</p>
                    </div>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-[#0A66C2]/10 h-10 w-10 rounded-full flex items-center justify-center mr-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">LinkedIn</h3>
                      <p className="text-sm text-muted-foreground">Não conectado</p>
                    </div>
                  </div>
                  <Button variant="outline">Conectar</Button>
                </div>
                
                <p className="text-sm text-muted-foreground mt-2">
                  Note: A funcionalidade de postagem direta será implementada em uma versão futura.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Escolha quando e como você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificações por E-mail</h3>
                  <p className="text-sm text-muted-foreground">Receber e-mails sobre atividades importantes</p>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Lembretes de Postagem</h3>
                  <p className="text-sm text-muted-foreground">Receber lembretes antes de postagens agendadas</p>
                </div>
                <Switch 
                  checked={reminderNotifications} 
                  onCheckedChange={setReminderNotifications} 
                />
              </div>
              
              <Button onClick={handleSaveNotificationSettings}>
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e preferências
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" defaultValue="Usuário de Marketing" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" defaultValue="usuario@agencia.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa/Agência</Label>
                <Input id="company" defaultValue="Agência de Marketing Digital" />
              </div>
              
              <div className="pt-2">
                <Button>
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Settings;
