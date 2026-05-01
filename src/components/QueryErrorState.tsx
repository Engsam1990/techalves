import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface QueryErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

const QueryErrorState = ({ message = "Failed to load data", onRetry, compact = false }: QueryErrorStateProps) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
        <p className="text-sm text-muted-foreground flex-1">{message}</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="gap-1.5 shrink-0">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <p className="text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      )}
    </div>
  );
};

export default QueryErrorState;
