export interface BlockedApp {
    id: string;
    packageName: string;
    appName: string;
}

export interface BlockedWebsite {
    id: string;
    url: string;
    category?: string;
}
