import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorAlertProps {
    title?: string;
    message: string;
    onDismiss?: () => void;
    className?: string;
}

export function ErrorAlert({
    title = 'Error',
    message,
    onDismiss,
    className = ''
}: ErrorAlertProps) {
    return (
        <div className={`flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg ${className}`}>
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <h4 className="font-semibold text-destructive">{title}</h4>
                <p className="text-sm text-destructive/80 mt-1">{message}</p>
            </div>
            {onDismiss && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onDismiss}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
