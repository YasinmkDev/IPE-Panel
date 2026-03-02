import { useEffect, useState } from "react";
import { collection, query, onSnapshot, addDoc, serverTimestamp, setDoc, doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../components/ui/card";
import { Plus, Baby, Smartphone, ShieldCheck, Globe, AlertCircle, TrendingUp, Trash2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ChildProfile = {
  id: string;
  name: string;
  ageGroup: string;
  linkedAt: any;
  protectionActive?: boolean;
  blockedApps?: string[];
  blockedWebsites?: string[];
  installedApps?: any[];
};

export default function DashboardPage() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, `parents/${auth.currentUser.uid}/children`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChildProfile[];
      setChildren(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generatePairingCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleAddChild = async () => {
    if (!newChildName || !newChildAge || !auth.currentUser) return;

    try {
      const parentId = auth.currentUser.uid;
      const pairingCode = generatePairingCode();
      const childData = {
        name: newChildName,
        ageGroup: newChildAge,
        blockedApps: [],
        blockedWebsites: [],
        storageRestricted: false,
        protectionActive: false, // Default to false during setup
        pairingCode: pairingCode,
        createdAt: serverTimestamp(),
        linkedAt: null,
      };

      const docRef = await addDoc(collection(db, `parents/${parentId}/children`), childData);
      
      await setDoc(doc(db, "childLinks", docRef.id), {
        parentId,
        childName: newChildName,
        pairingCode: pairingCode,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, "pairingCodes", pairingCode), {
        childId: docRef.id,
        parentId: parentId,
        childName: newChildName,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Success", description: "Child profile created successfully." });
      setNewChildName("");
      setNewChildAge("");
      setIsAdding(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDeleteChild = async (child: ChildProfile) => {
    if (!auth.currentUser) return;

    if (child.protectionActive !== false) {
      toast({
        variant: "destructive",
        title: "Deletion Blocked",
        description: "You must UNLOCK protection on the child device before deleting the profile, otherwise you won't be able to uninstall the app.",
      });
      return;
    }

    try {
      const parentId = auth.currentUser.uid;

      // Delete child profile
      await deleteDoc(doc(db, `parents/${parentId}/children/${child.id}`));

      // Cleanup links
      await deleteDoc(doc(db, "childLinks", child.id));

      toast({ title: "Profile Deleted", description: "The child profile has been removed." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const stats = [
    { label: "Children Protected", value: children.length, icon: Baby, color: "bg-blue-500" },
    { label: "Devices Linked", value: children.filter(c => c.linkedAt).length, icon: Smartphone, color: "bg-green-500" },
    { label: "Blocked Apps", value: children.reduce((acc, curr) => acc + (curr.blockedApps?.length || 0), 0), icon: ShieldCheck, color: "bg-red-500" },
    { label: "Blocked Web", value: children.reduce((acc, curr) => acc + (curr.blockedWebsites?.length || 0), 0), icon: Globe, color: "bg-purple-500" },
  ];

  const chartData = children.map(c => ({
    name: c.name,
    apps: c.blockedApps?.length || 0,
    web: c.blockedWebsites?.length || 0,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome back, Parent</h1>
          <p className="text-muted-foreground">Monitor and manage your family's digital safety.</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
              <Plus className="h-5 w-5" />
              Add Child Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline">Add Child Profile</DialogTitle>
              <DialogDescription>Create a profile to start managing restrictions and safety.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Child's Name</label>
                <Input placeholder="e.g. Ali" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Age Group</label>
                <Select onValueChange={setNewChildAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-6">0 - 6 years</SelectItem>
                    <SelectItem value="7-12">7 - 12 years</SelectItem>
                    <SelectItem value="13+">13+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddChild} className="w-full">Create Profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 text-${stat.color.split('-')[1]}-600`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2">
              <Baby className="h-5 w-5 text-primary" />
              Child Profiles
            </h2>
            <button className="text-xs font-semibold text-primary hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loading ? (
              [1, 2].map(i => <Card key={i} className="h-40 animate-pulse bg-muted" />)
            ) : children.length === 0 ? (
              <div className="col-span-2 py-12 text-center bg-card rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground">
                <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                <p>No profiles found. Add your first child to get started.</p>
              </div>
            ) : (
              children.map((child) => (
                <Card
                  key={child.id}
                  className="hover:border-primary/50 transition-all group relative overflow-hidden h-full cursor-pointer"
                  onClick={() => navigate(`/dashboard/children/${child.id}`)}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />

                  <CardHeader className="pb-2 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary mb-2">
                        <Baby className="h-6 w-6" />
                      </div>
                      <div className="flex gap-2 items-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                <ShieldAlert className="h-5 w-5" />
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{child.name}</strong>'s profile and all associated logs.
                                <br /><br />
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-medium">
                                  WARNING: If protection is ACTIVE on the child's phone, you must UNLOCK it in the child settings before deleting, or the app will be stuck on the phone.
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChild(child);
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Profile
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {child.linkedAt ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Linked</Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">Not Linked</Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{child.name}</CardTitle>
                    <CardDescription>Age Group: {child.ageGroup}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2 border-t bg-muted/20 text-xs text-muted-foreground flex justify-between relative z-10">
                    <span>{child.blockedApps?.length || 0} Apps</span>
                    <span>{child.blockedWebsites?.length || 0} Sites</span>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold font-headline flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Activity Summary
          </h2>
          <Card className="p-4 shadow-inner bg-card/50">
            <CardContent className="h-64 p-0 pt-4">
              {children.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(46, 125, 50, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="apps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Blocked Apps" />
                    <Bar dataKey="web" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Blocked Websites" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm italic">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
