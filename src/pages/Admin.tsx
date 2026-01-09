import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Users, CreditCard, Eye, LogOut, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, paidUsers: 0, totalViews: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    const [profilesRes, subsRes, viewsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*"),
      supabase.from("video_views").select("id", { count: "exact" }),
    ]);

    if (profilesRes.data) {
      const usersWithSubs = profilesRes.data.map((profile) => {
        const sub = subsRes.data?.find((s) => s.user_id === profile.id);
        return { ...profile, subscription: sub };
      });
      setUsers(usersWithSubs);
    }

    setStats({
      totalUsers: profilesRes.data?.length || 0,
      paidUsers: subsRes.data?.filter((s) => s.status === "active").length || 0,
      totalViews: viewsRes.count || 0,
    });
  };

  const toggleSubscription = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await supabase.from("subscriptions").update({ 
      status: newStatus,
      paid_at: newStatus === "active" ? new Date().toISOString() : null 
    }).eq("user_id", userId);
    fetchData();
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-strong border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">Admin Dashboard</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="font-display text-3xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Paid Users</p>
                <p className="font-display text-3xl font-bold">{stats.paidUsers}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Video Views</p>
                <p className="font-display text-3xl font-bold">{stats.totalViews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users table */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold">Users</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/30">
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.subscription?.status === "active" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {u.subscription?.status || "inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSubscription(u.id, u.subscription?.status)}
                      >
                        {u.subscription?.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
