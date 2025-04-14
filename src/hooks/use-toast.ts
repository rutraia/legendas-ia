import { toast as sonnerToast } from "sonner";

// Adicionamos um alias para o toast do Sonner, para manter a compatibilidade
const toast = sonnerToast;

export const useToast = () => {
  return {
    toast
  };
};

export { toast };
