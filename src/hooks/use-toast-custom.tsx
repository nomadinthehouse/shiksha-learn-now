
import { useToast as useToastOriginal } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

export const useCustomToast = () => {
  const { toast } = useToastOriginal();

  const showSuccess = (message: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span>Success</span>
        </div>
      ),
      description: message,
      className: "top-4 right-4 fixed max-w-sm",
      variant: "default",
    });
  };

  const showError = (message: string) => {
    toast({
      title: (
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-red-600" />
          <span>Error</span>
        </div>
      ),
      description: message,
      className: "top-4 right-4 fixed max-w-sm",
      variant: "destructive",
    });
  };

  return { showSuccess, showError };
};
