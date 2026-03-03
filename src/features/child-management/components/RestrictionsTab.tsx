import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface RestrictionsTabProps {
    storageRestricted?: boolean;
    onToggleStorageRestriction: (val: boolean) => void;
}

export function RestrictionsTab({ storageRestricted = false, onToggleStorageRestriction }: RestrictionsTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Device Restrictions</CardTitle>
                <CardDescription>Configure specific system-level restrictions for this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/5 transition-colors">
                    <div className="space-y-0.5">
                        <p className="font-medium">Restrict File Manager Apps</p>
                        <p className="text-sm text-muted-foreground">Prevents access to the device file system and storage managers.</p>
                    </div>
                    <Switch
                        checked={storageRestricted}
                        onCheckedChange={onToggleStorageRestriction}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
