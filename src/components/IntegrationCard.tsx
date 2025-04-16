import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IntegrationCardProps {
  icon: LucideIcon;
  name: string;
  description: string;
  color: string;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({ icon: Icon, name, description, color }) => (
  <div
    className="bg-gradient-to-b from-gray-950/90 to-gray-900/90 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-primary/20 hover:border-primary/60 transition-colors duration-200"
  >
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 mb-4">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-1 drop-shadow-lg">{name}</h3>
    <p className="text-gray-100 text-base mb-2">{description}</p>
  </div>
);

export default IntegrationCard;
