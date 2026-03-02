import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, collection, query, orderBy } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Smartphone, Shield, Activity, ArrowLeft, Copy, Globe2, Trash2, ShieldAlert, CheckCircle2, Unlock, Lock, Timer, Clock } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

export default function ChildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [child, setChild] = useState<any>(null);
  const [screenTime, setScreenTime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWebsite, setNewWebsite] = useState("");
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
      const apps = snapshot.docs.map((doc) => doc.data());
      setChild((prev: any) => prev ? { ...prev, installedApps: apps } : null);
      setLoading(false);
    });

    const unsubScreenTime = onSnapshot(query(screenTimeRef, orderBy("totalTimeVisible", "desc")), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setScreenTime(data);
    });

    return () => {
      unsubChild();
      unsubInstalledApps();
      unsubScreenTime();
    };
  }, [id]);

  const toggleAppBlock = async (packageName: string, isBlocked: boolean) => {
    if (!auth.currentUser) return;
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
    if (!auth.currentUser) return;
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

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const addWebsite = async () => {
    if (!newWebsite || !auth.currentUser) return;
    const ref = doc(db, `parents/${auth.currentUser.uid}/children/${id}`);
    try {
      await updateDoc(ref, { blockedWebsites: arrayUnion(newWebsite) });
      setNewWebsite("");
      toast({ title: "Website Added", description: `${newWebsite} is now blocked.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const removeWebsite = async (website: string) => {
    if (!auth.currentUser) return;
    const ref = doc(db, `parents/${auth.currentUser.uid}/children/${id}`);
    try {
      await updateDoc(ref, { blockedWebsites: arrayRemove(website) });
      toast({ title: "Website Removed", description: `${website} is no longer blocked.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  const toggleStorageRestriction = async (val: boolean) => {
    if (!auth.currentUser) return;
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

  const systemApps = child.installedApps?.filter((app: any) => app.isSystemApp || app.systemApp) || [];
  const userApps = child.installedApps?.filter((app: any) => !app.isSystemApp && !app.systemApp) || [];

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

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" /> Device Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{child.linkedAt ? "Linked" : "Disconnected"}</p>
                  <p className="text-xs text-muted-foreground">
                    {child.linkedAt ? `Last active: ${child.linkedAt.toDate().toLocaleDateString()}` : "Ready for setup"}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-primary" /> Active Blocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{(child.blockedApps?.length || 0) + (child.blockedWebsites?.length || 0)}</p>
                  <p className="text-xs text-muted-foreground">Across apps and websites</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Installed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{child.installedApps?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Applications discovered</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="apps" className="space-y-4">
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
                  <AppTable apps={userApps} blockedApps={child.blockedApps} onToggle={toggleAppBlock} />
                </TabsContent>

                <TabsContent value="system-apps">
                  <AppTable apps={systemApps} blockedApps={child.blockedApps} onToggle={toggleAppBlock} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="websites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Websites</CardTitle>
              <CardDescription>Add specific domains that you want to prevent from being accessed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. facebook.com" 
                  value={newWebsite}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewWebsite(e.target.value)}
                />
                <Button onClick={addWebsite}>Add Domain</Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {child.blockedWebsites?.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No websites blocked yet.</p>
                ) : (
                  child.blockedWebsites?.map((site: string) => (
                    <Badge key={site} variant="secondary" className="pl-3 pr-2 py-1.5 gap-2 text-sm">
                      <Globe2 className="h-3 w-3" />
                      {site}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 hover:bg-transparent text-muted-foreground hover:text-destructive"
                        onClick={() => removeWebsite(site)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-4">
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
                  checked={child.storageRestricted}
                  onCheckedChange={toggleStorageRestriction}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="device" className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Device Setup</CardTitle>
              <CardDescription>Use this unique ID to link the child's Android device to this profile.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 py-8">
              <div className="p-4 bg-white border-2 border-primary rounded-2xl shadow-lg">
                <QRCodeSVG 
                  value={child.pairingCode} 
                  size={180}
                  level="M"
                  
                />
              </div>
              <div className="w-full max-w-sm space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pairing Code</label>
                  <div className="flex gap-2">
                    <Input readOnly value={child.pairingCode} className="font-mono bg-muted text-center text-lg" />
                    <Button variant="outline" size="icon" onClick={() => {
                      navigator.clipboard.writeText(child.pairingCode);
                      toast({ title: "Copied", description: "Pairing Code copied to clipboard" });
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 text-sm text-primary-foreground/90 space-y-2 border border-primary/10">
                  <p className="font-semibold text-primary">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                    <li>Download ParentWatch Child App on Android</li>
                    <li>Open app and select "Setup Device"</li>
                    <li>Scan the QR code above or enter the ID manually</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AppTable({ apps, blockedApps, onToggle }: { apps: any[], blockedApps: string[], onToggle: (pkg: string, val: boolean) => void }) {
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
        {apps.map((app: any) => (
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
