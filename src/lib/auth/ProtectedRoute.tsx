import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children?: React.ReactNode;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    // Redireciona para o login, salvando a página atual como destino após o login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário estiver autenticado, renderiza o conteúdo protegido
  return children ? <>{children}</> : <Outlet />;
}; 