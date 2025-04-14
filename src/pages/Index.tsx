import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquarePlus, Users, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 grid-pattern">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/30 rounded-full filter blur-3xl circle-animation" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full filter blur-3xl circle-animation" />
      </div>
      {/* Hero section com gradiente e animações */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/50 to-accent/20 backdrop-blur-sm z-0" />
        
        {/* Círculos decorativos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl circle-animation" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-3xl circle-animation delay-1000" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              InstaScribe<span className="text-primary">.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Crie legendas cativantes para suas redes sociais com a ajuda da IA
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link to="/login">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
                Acessar Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
                Criar Legendas
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features section com cards modernos */}
      <section className="py-24 px-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="max-w-6xl mx-auto relative">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Tudo que você precisa para gerenciar seu conteúdo
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="group bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquarePlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Geração de Legendas</h3>
              <p className="text-muted-foreground leading-relaxed">
                Crie legendas profissionais para Instagram, Facebook e LinkedIn com a ajuda da inteligência artificial.
              </p>
            </motion.div>
            
            <motion.div
              className="group bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Perfis de Clientes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Gerencie personas e preferências de cada cliente para criar conteúdo personalizado e consistente.
              </p>
            </motion.div>
            
            <motion.div
              className="group bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Calendário de Conteúdo</h3>
              <p className="text-muted-foreground leading-relaxed">
                Organize e agende suas publicações em um calendário intuitivo para nunca perder uma data importante.
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link to="/login">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300">
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer moderno */}
      <footer className="bg-muted/50 backdrop-blur-sm py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            &copy; 2025 InstaScribe. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Estilos globais para animações */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }

          .grid-pattern {
            background-size: 30px 30px;
            background-image: 
              linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px);
          }

          .circle-animation {
            animation: float 8s ease-in-out infinite;
          }

          .delay-1000 {
            animation-delay: 1s;
          }

          @media (prefers-reduced-motion: reduce) {
            .circle-animation {
              animation: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Index;

