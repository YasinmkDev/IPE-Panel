import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import type { User } from "firebase/auth";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../../components/ui/sidebar";
import { Shield, LayoutDashboard, Baby, LogOut, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3 px-2 py-3">
              <div className="bg-primary p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-headline leading-tight">ParentWatch</h1>
                <p className="text-xs text-muted-foreground">Intelligent Safety</p>
              </div>
            </div>
          </SidebarHeader>
          <Separator />
          <SidebarContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-all">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Children Profiles">
                  <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-all">
                    <Baby className="h-5 w-5" />
                    <span className="font-medium">My Children</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto">
            <div className="flex items-center gap-3 px-2 mb-4">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/40/40`} />
                <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Premium Parent</p>
              </div>
            </div>
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutDashboard className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Overview</span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
