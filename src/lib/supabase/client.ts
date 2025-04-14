import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lfzbxshvxezquzgtqvob.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmemJ4c2h2eGV6cXV6Z3Rxdm9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzI4NDIsImV4cCI6MjA2MDE0ODg0Mn0.ONidGI87sX_RxstWEqnC8hhXLfXAyQ24k6JI_IPeanE';

console.log('Inicializando cliente Supabase com URL:', supabaseUrl);

// Criar o cliente com configurações explícitas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Verificar se há sessão ativa ao inicializar
(async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Erro ao verificar sessão:', error);
  } else {
    console.log('Status da sessão:', data.session ? 'Ativa' : 'Inativa');
  }
})();

// Função para garantir que o usuário esteja autenticado
export async function ensureAuthenticated() {
  // Verificar se já existe uma sessão
  const { data: sessionData } = await supabase.auth.getSession();
  
  if (sessionData.session) {
    console.log('Usuário já está autenticado:', sessionData.session.user.id);
    return sessionData.session.user;
  }
  
  console.log('Tentando fazer login automático...');
  // Para fins de desenvolvimento/teste, fazemos login com credenciais predefinidas
  // Em produção, redirecionar para página de login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'arturboaz@outlook.com',
    password: 'teste123'
  });
  
  if (error) {
    console.error('Erro ao fazer login automático:', error);
    throw new Error('Você precisa estar autenticado. Por favor, faça login.');
  }
  
  console.log('Login automático realizado com sucesso');
  return data.user;
}

console.log('Cliente Supabase inicializado');
