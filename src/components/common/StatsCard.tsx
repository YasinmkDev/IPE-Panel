import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { LucideProps } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ComponentType<LucideProps>;
    iconColor?: string;
}

export function StatsCard({ title, value, description, icon: Icon, iconColor = "text-primary" }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <p className="text-2xl font-bold">{value}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
