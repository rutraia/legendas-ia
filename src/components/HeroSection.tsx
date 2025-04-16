import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  badgeText?: string;
  badgeActionText?: string;
  badgeActionHref?: string;
  title: string;
  description: string;
  actions: { text: string; href: string; variant?: 'default' | 'outline'; icon?: React.ReactNode }[];
  imageUrl?: string;
  imageAlt?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  badgeText,
  badgeActionText,
  badgeActionHref,
  title,
  description,
  actions,
  imageUrl,
  imageAlt,
}) => (
  <section className="relative w-full py-16 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-white text-center overflow-hidden">
    {badgeText && (
      <div className="inline-flex items-center mb-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
        {badgeText}
        {badgeActionText && badgeActionHref && (
          <a href={badgeActionHref} className="ml-3 underline hover:text-primary font-semibold">
            {badgeActionText}
          </a>
        )}
      </div>
    )}
    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent break-words whitespace-normal max-w-3xl mx-auto leading-tight">
      {title}
    </h1>
    <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
      {description}
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
      {actions.map((action, idx) => (
        <a href={action.href} key={idx}>
          <Button size="lg" variant={action.variant || 'default'} className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
            {action.text}
            {action.icon || <ArrowRight className="h-4 w-4" />}
          </Button>
        </a>
      ))}
    </div>
    {imageUrl && (
      <div className="mt-8 flex justify-center">
        <img src={imageUrl} alt={imageAlt || 'Hero Image'} className="rounded-xl shadow-xl max-w-full h-auto" />
      </div>
    )}
  </section>
);
