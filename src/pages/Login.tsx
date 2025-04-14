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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/20 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            InstaScribe<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Sua plataforma de gerenciamento de conteúdo
          </p>
        </div>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-foreground">Login</TabsTrigger>
            <TabsTrigger value="cadastro" className="text-foreground">Cadastro</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <button 
                        type="button"
                        id="forgot-password-btn"
                        aria-label="Esqueceu a senha?"
                        onClick={() => {
                          const forgotPasswordTab = document.getElementById('recuperar-senha');
                          forgotPasswordTab?.click();
                        }}
                        className="text-xs text-blue-700 hover:underline font-medium"
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
                  <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aguarde...
                      </>
                    ) : (
                      <>
                        Entrar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cadastro">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Criar uma conta</CardTitle>
                <CardDescription>
                  Preencha os campos abaixo para se cadastrar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
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
                  <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aguarde...
                      </>
                    ) : (
                      <>
                        Cadastrar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
                  <Label htmlFor="recovery-email">E-mail</Label>
                  <Input
                    id="recovery-email"
                    name="recovery-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    disabled={isRecovering}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1" disabled={isRecovering}>
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
