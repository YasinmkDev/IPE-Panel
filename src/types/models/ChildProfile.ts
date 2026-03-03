export interface ChildProfile {
    id: string;
    name: string;
    ageGroup: string;
    linkedAt?: Date | null;
    protectionActive?: boolean;
    blockedApps?: string[];
    blockedWebsites?: string[];
    installedApps?: unknown[];
    pairingCode?: string;
    createdAt?: Date;
    storageRestricted?: boolean;
}
