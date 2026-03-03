import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe2, Trash2 } from "lucide-react";

interface WebsiteListProps {
    websites: string[];
    onAdd: (website: string) => void;
    onRemove: (website: string) => void;
}

export function WebsiteList({ websites = [], onAdd, onRemove }: WebsiteListProps) {
    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const website = formData.get("website") as string;
        if (website) {
            onAdd(website);
            (e.target as HTMLFormElement).reset();
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleAdd} className="flex gap-2">
                <Input
                    name="website"
                    placeholder="e.g. facebook.com"
                    className="flex-1"
                />
                <Button type="submit">Add Domain</Button>
            </form>
            <div className="flex flex-wrap gap-2 pt-2">
                {websites.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No websites blocked yet.</p>
                ) : (
                    websites.map((site) => (
                        <Badge key={site} variant="secondary" className="pl-3 pr-2 py-1.5 gap-2 text-sm">
                            <Globe2 className="h-3 w-3" />
                            {site}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent text-muted-foreground hover:text-destructive"
                                onClick={() => onRemove(site)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))
                )}
            </div>
        </div>
    );
}
