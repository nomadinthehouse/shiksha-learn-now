
import { useToast as useToastOriginal } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

export const useCustomToast = () => {
  const { toast } = useToastOriginal();

  const showSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
      className: "top-4 right-4 fixed max-w-sm border-green-200 bg-green-50",
      variant: "default",
    });
  };

  const showError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      className: "top-4 right-4 fixed max-w-sm",
      variant: "destructive",
    });
  };

  return { showSuccess, showError };
};
