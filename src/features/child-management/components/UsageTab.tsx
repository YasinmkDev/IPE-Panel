import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Timer, Clock } from "lucide-react";

interface ScreenTimeData {
    packageName: string;
    appName: string;
    totalTimeVisible: number;
}

interface UsageTabProps {
    screenTime: ScreenTimeData[];
}

const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
};

export function UsageTab({ screenTime }: UsageTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" /> App Usage Statistics
                </CardTitle>
                <CardDescription>Real-time screen time monitoring for each application.</CardDescription>
            </CardHeader>
            <CardContent>
                {screenTime.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No usage data reported yet. Monitoring starts when apps are opened.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {screenTime.map((data) => (
                            <Card key={data.packageName} className="overflow-hidden border-primary/10">
                                <div className="p-4 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold">
                                        {data.appName?.charAt(0) || "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate text-sm">{data.appName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{data.packageName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary">{formatTime(data.totalTimeVisible)}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total Time</p>
                                    </div>
                                </div>
                                <div className="h-1 bg-muted w-full">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (data.totalTimeVisible / (1000 * 60 * 60)) * 100)}%` }}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
