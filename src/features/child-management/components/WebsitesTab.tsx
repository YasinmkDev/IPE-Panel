import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { WebsiteList } from "@/components/common/WebsiteList";

interface WebsitesTabProps {
    blockedWebsites?: string[];
    onAdd: (website: string) => void;
    onRemove: (website: string) => void;
}

export function WebsitesTab({ blockedWebsites = [], onAdd, onRemove }: WebsitesTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Blocked Websites</CardTitle>
                <CardDescription>Add specific domains that you want to prevent from being accessed.</CardDescription>
            </CardHeader>
            <CardContent>
                <WebsiteList
                    websites={blockedWebsites}
                    onAdd={onAdd}
                    onRemove={onRemove}
                />
            </CardContent>
        </Card>
    );
}
