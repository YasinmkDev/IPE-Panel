import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppTable } from "@/components/common/AppTable";

interface AppInfo {
    packageName: string;
    name: string;
    isSystemApp?: boolean;
    systemApp?: boolean;
}

interface AppsTabProps {
    installedApps?: AppInfo[];
    blockedApps?: string[];
    onToggle: (packageName: string, isBlocked: boolean) => void;
}

export function AppsTab({ installedApps = [], blockedApps = [], onToggle }: AppsTabProps) {
    const systemApps = installedApps.filter((app) => app.isSystemApp || app.systemApp) || [];
    const userApps = installedApps.filter((app) => !app.isSystemApp && !app.systemApp) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Applications Management</CardTitle>
                <CardDescription>Toggle apps to block access on the child's device.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="user-apps">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="user-apps">User Apps ({userApps.length})</TabsTrigger>
                        <TabsTrigger value="system-apps">System Apps ({systemApps.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="user-apps">
                        <AppTable apps={userApps} blockedApps={blockedApps} onToggle={onToggle} />
                    </TabsContent>

                    <TabsContent value="system-apps">
                        <AppTable apps={systemApps} blockedApps={blockedApps} onToggle={onToggle} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
