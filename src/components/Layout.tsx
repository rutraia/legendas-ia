import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  MessageSquarePlus, 
  BookMarked, 
  Calendar, 
  Settings, 
  Menu, 
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Gerar Legendas', href: '/caption-generator', icon: MessageSquarePlus },
    { name: 'Programação', href: '/caption-library', icon: BookMarked },
    { name: 'Calendário', href: '/calendar', icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Botão de alternância de tema */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {/* Mobile sidebar toggle */}
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      )}
      {/* Sidebar */}
      <aside className="md:w-64 flex-shrink-0 bg-card border-r min-h-[60px]">
        <div className="h-16 flex items-center px-4 md:px-6 border-b">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-primary">Legendas IA</span>
          </Link>
        </div>
        <nav className="p-2 md:p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-2 md:p-4 border-t">
          {user && (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2 py-2">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Barra superior */}
        <header className="h-16 border-b flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 gap-2 md:gap-0">
          <div className="md:hidden">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-primary">Legendas IA</span>
            </Link>
          </div>
          <div className="flex-1 md:pl-4">
            <h1 className="text-base md:text-lg font-medium flex items-center">
              {(
                navigation.find(item => location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href)))?.name === 'Clientes'
              ) && (
                <Users className="mr-2 h-5 w-5 text-primary" />
              )}
              {(
                navigation.find(item => location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href)))?.name === 'Gerar Legendas'
              ) && (
                <MessageSquarePlus className="mr-2 h-5 w-5 text-primary" />
              )}
              {(
                navigation.find(item => location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href)))?.name === 'Programação'
              ) && (
                <Calendar className="mr-2 h-5 w-5 text-primary" />
              )}
              {(
                navigation.find(item => location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href)))?.name === 'Calendário'
              ) && (
                <Calendar className="mr-2 h-5 w-5 text-primary" />
              )}
              {(
                navigation.find(item => location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href)))?.name === 'Dashboard'
              ) && (
                <Home className="mr-2 h-5 w-5 text-primary" />
              )}
              {(
                navigation.find(item => location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href)))?.name === 'Configurações'
              ) && (
                <Settings className="mr-2 h-5 w-5 text-primary" />
              )}
            </h1>
          </div>
          <div className="md:hidden">
            {user ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/login')}
              >
                <UserIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>
        {/* Conteúdo */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 w-full max-w-full">
          {children}
        </div>
      </main>
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
