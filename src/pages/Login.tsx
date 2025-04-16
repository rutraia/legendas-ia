import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Loader2, ArrowRight, EyeIcon, EyeOffIcon } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter o caminho de redirecionamento após o login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
  
  // Verificar se o usuário já está logado
  React.useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    
    checkSession();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error('Erro no login', { description: error.message });
        return;
      }

      toast.success('Login bem-sucedido');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error('Erro inesperado', { description: String(err) });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { error, needsEmailConfirmation } = await signUp(email, password);

      if (error) {
        toast.error('Erro no cadastro', { description: error.message });
        return;
      }

      if (needsEmailConfirmation) {
        toast.success('Verifique seu e-mail para confirmar o cadastro');
      } else {
        toast.success('Cadastro bem-sucedido');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error('Erro inesperado', { description: String(err) });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryEmail) {
      toast.error('Informe o e-mail para recuperação');
      return;
    }
    
    setIsRecovering(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error('Erro ao enviar e-mail de recuperação', { description: error.message });
        return;
      }

      toast.success('E-mail de recuperação enviado', { 
        description: 'Verifique sua caixa de entrada para redefinir sua senha' 
      });
    } catch (err) {
      toast.error('Erro inesperado', { description: String(err) });
    } finally {
      setIsRecovering(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950/95 to-gray-900/90 p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-gray-950/90 to-gray-900/90 backdrop-blur-xl shadow-xl rounded-2xl border border-white/10 p-8">
        <div className="text-center mb-8">
          <h1 className="text-gradient text-3xl font-extrabold mb-2">Legendas IA<span className="text-primary">.</span></h1>
          <p className="text-gray-400 mt-2">Sua plataforma de gerenciamento de conteúdo</p>
        </div>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex mb-8 rounded-lg overflow-hidden border border-white/10">
            <button 
              className={`flex-1 py-2 px-4 bg-gray-900/80 text-gray-100 font-semibold focus:outline-none transition-all duration-300 hover:bg-primary/20 hover:scale-105 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/70 ${activeTab === 'login' ? 'bg-gradient-to-r from-primary/30 to-accent/20 text-primary shadow-xl' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-2 px-4 bg-transparent text-gray-400 font-semibold focus:outline-none transition-all duration-300 hover:bg-primary/10 hover:scale-105 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/70 ${activeTab === 'cadastro' ? 'bg-gradient-to-r from-primary/30 to-accent/20 text-primary shadow-xl' : ''}`}
              onClick={() => setActiveTab('cadastro')}
            >
              Cadastro
            </button>
          </div>
          
          <TabsContent value="login">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-100 mb-2">Bem-vindo de volta</h2>
              <p className="text-gray-400 mb-4">Entre com suas credenciais para acessar sua conta</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="block text-gray-300 mb-1">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isProcessing}
                    className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/80 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="block text-gray-300 mb-1">Senha</Label>
                    <button 
                      type="button"
                      id="forgot-password-btn"
                      aria-label="Esqueceu a senha?"
                      onClick={() => {
                        const forgotPasswordTab = document.getElementById('recuperar-senha');
                        forgotPasswordTab?.click();
                      }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-lg bg-gray-900/80 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary/60 transition-colors"
                    />
                    <button
                      type="button"
                      id="toggle-password-visibility"
                      aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full py-3 rounded-lg font-bold text-lg shadow-lg mt-2 flex items-center justify-center gap-2" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>
          
          <TabsContent value="cadastro">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-100 mb-2">Criar uma conta</h2>
              <p className="text-gray-400 mb-4">Preencha os campos abaixo para se cadastrar</p>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="block text-gray-300 mb-1">E-mail</Label>
                  <Input
                    id="signup-email"
                    name="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isProcessing}
                    className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/80 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="block text-gray-300 mb-1">Senha</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isProcessing}
                      className="w-full px-4 py-3 rounded-lg bg-gray-900/80 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary/60 transition-colors"
                    />
                    <button
                      type="button"
                      id="toggle-signup-password-visibility"
                      aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A senha deve ter pelo menos 6 caracteres
                  </p>
                </div>
                <Button type="submit" className="w-full py-3 rounded-lg font-bold text-lg shadow-lg mt-2 flex items-center justify-center gap-2" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    <>
                      Cadastrar
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>
          
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              id="recuperar-senha"
              onClick={() => {
                document.getElementById('recovery-dialog')?.classList.toggle('hidden');
              }}
            >
              Recuperar senha
            </Button>
          </div>
        </Tabs>
        
        {/* Dialog de recuperação de senha */}
        <div id="recovery-dialog" className="mt-6 hidden">
          <Card>
            <CardHeader>
              <CardTitle>Recuperação de senha</CardTitle>
              <CardDescription>
                Informe seu e-mail para receber as instruções de recuperação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordRecovery} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recovery-email" className="block text-gray-300 mb-1">E-mail</Label>
                  <Input
                    id="recovery-email"
                    name="recovery-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    disabled={isRecovering}
                    className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-900/80 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 py-3 rounded-lg font-bold text-lg shadow-lg mt-2 flex items-center justify-center gap-2" disabled={isRecovering}>
                    {isRecovering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar instruções'
                    )}
                  </Button>
                  <Button
                    type="button"
                    id="cancel-recovery"
                    aria-label="Cancelar recuperação de senha"
                    variant="outline"
                    onClick={() => {
                      document.getElementById('recovery-dialog')?.classList.add('hidden');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
