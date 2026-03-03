import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Lock, Unlock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  OverviewTab,
  UsageTab,
  AppsTab,
  WebsitesTab,
  RestrictionsTab,
  DeviceLinkTab,
} from "@/features/child-management/components";
import type { ChildProfile } from "@/types/models/ChildProfile";

interface InstalledApp {
  packageName: string;
  name: string;
  isSystemApp?: boolean;
  systemApp?: boolean;
}

interface ScreenTimeData {
  packageName: string;
  appName: string;
  totalTimeVisible: number;
}

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [screenTime, setScreenTime] = useState<ScreenTimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth.currentUser || !id) return;

    const childRef = doc(db, `parents/${auth.currentUser.uid}/children/${id}`);
    const installedAppsRef = collection(childRef, "installedApps");
    const screenTimeRef = collection(childRef, "screenTime");

    const unsubChild = onSnapshot(childRef, (snapshot) => {
      if (snapshot.exists()) {
        setChild((prev: any) => ({ ...prev, id: snapshot.id, ...snapshot.data() }));
      }
    });

    const unsubInstalledApps = onSnapshot(installedAppsRef, (snapshot) => {
      const apps = snapshot.docs.map((doc) => doc.data()) as InstalledApp[];
      setChild((prev: any) => prev ? { ...prev, installedApps: apps } : null);
      setLoading(false);
    });

    const unsubScreenTime = onSnapshot(query(screenTimeRef, orderBy("totalTimeVisible", "desc")), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data()) as ScreenTimeData[];
      setScreenTime(data);
    });

    return () => {
      unsubChild();
      unsubInstalledApps();
      unsubScreenTime();
    };
  }, [id]);

  const toggleAppBlock = async (packageName: string, isBlocked: boolean) => {
    if (!auth.currentUser || !id) return;
    const ref = doc(db, `parents/${auth.currentUser.uid}/children/${id}`);
    try {
      await updateDoc(ref, {
        blockedApps: isBlocked ? arrayUnion(packageName) : arrayRemove(packageName)
      });
      toast({ title: isBlocked ? "App Blocked" : "App Unblocked", description: `${packageName} status updated.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const toggleProtection = async (val: boolean) => {
    if (!auth.currentUser || !id) return;
    const ref = doc(db, `parents/${auth.currentUser.uid}/children/${id}`);
    try {
      await updateDoc(ref, { protectionActive: val });
      toast({
        title: val ? "Protection Enabled" : "Protection Disabled",
        description: val ? "The app is now fully locked." : "Anti-uninstall and app blocks are now suspended."
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const addWebsite = async (website: string) => {
    if (!website || !auth.currentUser || !id) return;
    const ref = doc(db, `parents/${auth.currentUser.uid}/children/${id}`);
    try {
      await updateDoc(ref, { blockedWebsites: arrayUnion(website) });
      toast({ title: "Website Added", description: `${website} is now blocked.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const removeWebsite = async (website: string) => {
    if (!auth.currentUser || !id) return;
    const ref = doc(db, `parents/${auth.currentUser.uid}/children/${id}`);
    try {
      await updateDoc(ref, { blockedWebsites: arrayRemove(website) });
      toast({ title: "Website Removed", description: `${website} is no longer blocked.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const toggleStorageRestriction = async (val: boolean) => {
    if (!auth.currentUser || !id) return;
    const ref = doc(db, `parents/${auth.currentUser.uid}/children/${id}`);
    try {
      await updateDoc(ref, { storageRestricted: val });
      toast({ title: "Settings Updated", description: "Storage restriction changed." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!child) return <div>Profile not found.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-headline">{child.name}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Age Group: {child.ageGroup}
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button
            variant={child.protectionActive !== false ? "destructive" : "outline"}
            className="gap-2"
            onClick={() => toggleProtection(child.protectionActive === false)}
          >
            {child.protectionActive !== false ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {child.protectionActive !== false ? "Lock Protection" : "Unlock Protection"}
          </Button>
          {child.linkedAt ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Linked
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600 border-orange-200">Pending Link</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-card border p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Screen Time</TabsTrigger>
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="websites">Websites</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="device">Device Link</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab child={child} />
        </TabsContent>

        <TabsContent value="usage">
          <UsageTab screenTime={screenTime} />
        </TabsContent>

        <TabsContent value="apps">
          <AppsTab
            installedApps={child.installedApps as any}
            blockedApps={child.blockedApps}
            onToggle={toggleAppBlock}
          />
        </TabsContent>

        <TabsContent value="websites">
          <WebsitesTab
            blockedWebsites={child.blockedWebsites}
            onAdd={addWebsite}
            onRemove={removeWebsite}
          />
        </TabsContent>

        <TabsContent value="restrictions">
          <RestrictionsTab
            storageRestricted={child.storageRestricted}
            onToggleStorageRestriction={toggleStorageRestriction}
          />
        </TabsContent>

        <TabsContent value="device">
          <DeviceLinkTab pairingCode={child.pairingCode || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
