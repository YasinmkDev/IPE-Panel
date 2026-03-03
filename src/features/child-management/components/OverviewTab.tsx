import { StatsCard } from "@/components/common/StatsCard";
import { Smartphone, ShieldAlert, Activity } from "lucide-react";
import type { ChildProfile } from "@/types/models/ChildProfile";

interface OverviewTabProps {
    child: ChildProfile & {
        installedApps?: unknown[];
        linkedAt?: Date | null;
    };
}

export function OverviewTab({ child }: OverviewTabProps) {
    const totalBlocked = (child.blockedApps?.length || 0) + (child.blockedWebsites?.length || 0);
    const installedCount = child.installedApps?.length || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
                title="Device Status"
                value={child.linkedAt ? "Linked" : "Disconnected"}
                description={
                    child.linkedAt
                        ? `Last active: ${new Date(child.linkedAt as unknown as string).toLocaleDateString()}`
                        : "Ready for setup"
                }
                icon={Smartphone}
            />
            <StatsCard
                title="Active Blocks"
                value={totalBlocked}
                description="Across apps and websites"
                icon={ShieldAlert}
            />
            <StatsCard
                title="Installed"
                value={installedCount}
                description="Applications discovered"
                icon={Activity}
            />
        </div>
    );
}
