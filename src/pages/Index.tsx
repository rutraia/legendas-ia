import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquarePlus, Users, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { BenefitCard } from '@/components/BenefitCard';
import { IntegrationCard } from '@/components/IntegrationCard';
import { Lightbulb, Zap, Target, TrendingUp, LayoutDashboard, Instagram, Facebook, Linkedin } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Pricing } from '@/components/ui/pricing-cards';
import { NavBar } from "@/components/ui/tubelight-navbar"
import { Home, User, Briefcase, FileText } from "lucide-react"
import { GradientText } from '@/components/ui/gradient-text';
import { SparklesCore } from '@/components/ui/sparkles';
import { DemoGeradorLegendas } from "@/components/ui/DemoGeradorLegendas";
import { AnimatedText } from '@/components/ui/animated-underline-text-one';

const Index = () => {
  const cardClasse = "flex flex-col items-center text-center p-6 bg-[#181C2F] rounded-2xl border border-[#2D3258] shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:bg-[#23274a] cursor-pointer";

  return (
    <div className="min-h-screen w-full bg-gray-950">
      {/* Espaçamento superior */}
      <div className="pt-10 md:pt-16" />
      {/* Menu de Navegação Moderno */}
      <NavBar
        items={[
          { name: 'Home', url: '#', icon: Home },
          { name: 'Funcionamento', url: '#como-funciona', icon: User },
          { name: 'Sobre', url: '#beneficios', icon: User },
          { name: 'Planos', url: '#integracoes', icon: Briefcase },
          { name: 'FAQ', url: '#faq', icon: FileText }
        ]}
      />
      {/* Espaçamento aprimorado entre menu e hero */}
      <div className="mb-12 md:mb-20" />
      {/* HERO */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-12 md:px-32 text-center overflow-visible min-h-[70vh] mb-24 mt-4 md:mt-12">
        {/* Efeito visual removido */}
        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in" style={{overflow: 'visible'}}>
          <div className="relative w-full flex flex-col items-center justify-center mb-6">
            <div className="flex flex-col items-center justify-center w-full">
              <div className="inline-block text-center w-auto" style={{overflow: 'visible'}}>
                <GradientText
                  colors={["#a78bfa", "#f472b6", "#facc15"]}
                  animationSpeed={6}
                  className="relative z-10 text-5xl sm:text-6xl md:text-7xl font-extrabold leading-none break-words whitespace-normal drop-shadow-xl tracking-tight font-sans"
                  style={{letterSpacing: 0, overflow: 'visible', marginBottom: '0.15em'}}
                >
                  Legendas IA<span className="text-primary">.</span>
                </GradientText>
                <span
                  className="block text-[15px] sm:text-base md:text-lg text-indigo-200 font-semibold tracking-widest text-center w-full font-[Inter,Montserrat,Arial,sans-serif] drop-shadow-sm"
                  style={{letterSpacing: '0.08em', marginTop: 0, display:'block', textTransform: 'none'}}
                >
                  Crie legendas cativantes para rede sociais com IA.
                </span>
              </div>
            </div>
          </div>
          <div className="relative w-full flex items-center justify-center" style={{height:'60px'}}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl" style={{pointerEvents:'none'}}>
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1.2}
                particleDensity={160}
                className="w-full h-14"
                particleColor="#a78bfa"
              />
            </div>
          </div>
        </div>
      </div>
      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="w-full py-20 md:py-32 flex flex-col items-center bg-gray-950 mb-12 md:mb-20">
        <h2 className="text-gradient text-2xl md:text-3xl font-extrabold mb-12 text-center bg-clip-text text-transparent">Como funciona?</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl w-full px-4 md:px-8 mb-12">
          <div className={cardClasse}>
            <div className="mb-4"><Users className="h-8 w-8 text-[#A78BFA]" /></div>
            <div className="font-extrabold text-lg mb-1 text-white">1. Acesse</div>
            <div className="text-[#C3C6F1] text-sm">Faça login ou crie sua conta gratuita.</div>
          </div>
          <div className={cardClasse}>
            <div className="mb-4"><FileText className="h-8 w-8 text-[#A78BFA]" /></div>
            <div className="font-extrabold text-lg mb-1 text-white">2. Gere a legenda</div>
            <div className="text-[#C3C6F1] text-sm">A IA cria legendas únicas e otimizadas para engajamento.</div>
          </div>
          <div className={cardClasse}>
            <div className="mb-4"><Briefcase className="h-8 w-8 text-[#A78BFA]" /></div>
            <div className="font-extrabold text-lg mb-1 text-white">3. Programe</div>
            <div className="text-[#C3C6F1] text-sm">Programe suas publicações para controlar as datas</div>
          </div>
        </div>
        {/* Texto e efeito animado acima da demo */}
        <div className="mb-6 flex flex-col items-center">
          <AnimatedText 
            text="Aperte o botão de gerar legenda!"
            textClassName="text-base md:text-lg font-bold text-white"
            underlineClassName="text-white"
          />
        </div>
        <DemoGeradorLegendas />
      </section>
      {/* Seção de Benefícios */}
      <section className="w-full py-20 md:py-32 flex flex-col items-center bg-gray-950 mb-12 md:mb-20" id="beneficios">
        <h2 className="text-gradient text-3xl md:text-4xl font-extrabold mb-14 text-center drop-shadow-xl tracking-tight">Por que usar o Legendas IA?</h2>
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full px-4 md:px-8">
          <BenefitCard
            icon={Lightbulb}
            title="Gere legendas criativas com IA"
            description="Nossa inteligência artificial cria legendas únicas e envolventes em segundos."
          />
          <BenefitCard
            icon={Zap}
            title="Economize tempo em cada post"
            description="Automatize a criação de legendas e foque no que realmente importa: seu conteúdo."
          />
          <BenefitCard
            icon={Target}
            title="Personalize para cada rede social"
            description="Ajuste facilmente o tom e formato para Instagram, Facebook ou LinkedIn."
          />
          <BenefitCard
            icon={TrendingUp}
            title="Aumente o engajamento"
            description="Legendas otimizadas para atrair mais curtidas, comentários e compartilhamentos."
          />
          <BenefitCard
            icon={LayoutDashboard}
            title="Interface intuitiva"
            description="Plataforma fácil de usar, mesmo para quem não entende de tecnologia."
          />
        </div>
      </section>
      {/* Seção de Integrações */}
      <section className="w-full py-20 md:py-32 flex flex-col items-center bg-gray-950 mb-12 md:mb-20" id="integracoes">
        <div className="w-full max-w-7xl px-6 md:px-10">
          <Pricing />
        </div>
      </section>
      {/* FAQ */}
      <section className="w-full py-20 md:py-32 flex flex-col items-center bg-gray-950 mb-12 md:mb-20" id="faq">
        <h2 className="text-gradient text-3xl md:text-4xl font-extrabold mb-14 text-center drop-shadow-xl tracking-tight leading-tight" style={{paddingBottom: 4}}>
          Perguntas Frequentes
        </h2>
        <div className="w-full max-w-2xl px-4 md:px-8 flex flex-col gap-8">
          <Accordion type="single" collapsible>
            <AccordionItem value="1">
              <AccordionTrigger>Como funciona a geração de legendas?</AccordionTrigger>
              <AccordionContent>
                Nossa IA analisa seu conteúdo e sugere legendas criativas e personalizadas para cada rede social. Basta escolher o tom e a plataforma, e pronto!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2">
              <AccordionTrigger>Posso agendar publicações?</AccordionTrigger>
              <AccordionContent>
                Sim! Programe suas publicações para as datas e horários que preferir, garantindo presença constante nas redes sociais sem esforço manual.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3">
              <AccordionTrigger>O serviço funciona para Instagram, Facebook e LinkedIn?</AccordionTrigger>
              <AccordionContent>
                Sim, você pode criar e agendar legendas otimizadas para Instagram, Facebook e LinkedIn, adaptando o conteúdo para cada rede.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="4">
              <AccordionTrigger>Preciso pagar para usar?</AccordionTrigger>
              <AccordionContent>
                Você pode começar grátis! Depois, escolha um plano que se encaixe nas suas necessidades para liberar recursos avançados.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="5">
              <AccordionTrigger>Minhas informações estão seguras?</AccordionTrigger>
              <AccordionContent>
                Sim, levamos segurança a sério. Seus dados são protegidos com criptografia e não são compartilhados com terceiros.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      {/* Footer moderno */}
      <footer className="bg-gray-950 py-8 px-6 border-t border-primary/20 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <div className="flex gap-4 justify-center mt-2 md:mt-0">
            <a href="mailto:contato@legendasia.com" className="hover:underline text-primary">Contato</a>
            <a href="#" className="hover:underline text-primary">Política de Privacidade</a>
            <a href="#" className="hover:underline text-primary">Termos de Uso</a>
          </div>
          <p className="text-gray-400 mt-4">&copy; 2025 Legendas IA. Todos os direitos reservados.</p>
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
