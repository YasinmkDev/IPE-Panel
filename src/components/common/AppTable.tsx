import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface AppInfo {
    packageName: string;
    name: string;
    isSystemApp?: boolean;
    systemApp?: boolean;
}

interface AppTableProps {
    apps: AppInfo[];
    blockedApps?: string[];
    onToggle: (packageName: string, isBlocked: boolean) => void;
}

export function AppTable({ apps, blockedApps = [], onToggle }: AppTableProps) {
    if (apps.length === 0) {
        return (
            <div className="py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <p>No applications found in this category.</p>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>App Name</TableHead>
                    <TableHead className="hidden md:table-cell">Package</TableHead>
                    <TableHead className="text-right">Blocked</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {apps.map((app) => (
                    <TableRow key={app.packageName}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">{app.packageName}</TableCell>
                        <TableCell className="text-right">
                            <Switch
                                checked={blockedApps?.includes(app.packageName)}
                                onCheckedChange={(val: boolean) => onToggle(app.packageName, val)}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
