import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Users, Download, MessageSquare, MapPin, Building, Activity, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListWorkers, useListContactMessages, useGetCommunityStats, getListWorkersQueryKey, getListContactMessagesQueryKey, getGetCommunityStatsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

interface AdminProps {
  onLogout: () => void;
}

export function Admin({ onLogout }: AdminProps) {
  const { data: workersData, isLoading: loadingWorkers } = useListWorkers({ query: { queryKey: getListWorkersQueryKey() } });
  const { data: messagesData, isLoading: loadingMessages } = useListContactMessages({ query: { queryKey: getListContactMessagesQueryKey() } });
  const { data: stats } = useGetCommunityStats({ query: { queryKey: getGetCommunityStatsQueryKey() } });
  
  const [isExporting, setIsExporting] = useState(false);

  const handleLogout = async () => {
    await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    onLogout();
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/workers/export`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workers-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const getWorkTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      delivery: "bg-blue-100 text-blue-800 border-blue-200",
      ride_sharing: "bg-green-100 text-green-800 border-green-200",
      domestic: "bg-purple-100 text-purple-800 border-purple-200",
      construction: "bg-amber-100 text-amber-800 border-amber-200",
      freelance: "bg-rose-100 text-rose-800 border-rose-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-primary-foreground/10">
          <Link href="/" className="font-heading font-black text-xl hover:text-accent transition-colors block">
            GIG CONNECT<br/>
            <span className="text-accent text-sm tracking-widest font-sans font-bold">ADMIN PORTAL</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg font-medium text-white">
            <Activity className="h-5 w-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg font-medium text-primary-foreground/70 transition-colors">
            <Users className="h-5 w-5" />
            Workers
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg font-medium text-primary-foreground/70 transition-colors">
            <MessageSquare className="h-5 w-5" />
            Messages
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg font-medium text-primary-foreground/70 transition-colors">
            <Building className="h-5 w-5" />
            Events
          </a>
        </nav>
        <div className="p-4 border-t border-primary-foreground/10 space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full border-white/20 text-white bg-transparent hover:bg-white/10">
              Exit Admin
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full border-red-400/40 text-red-300 bg-transparent hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-heading font-bold text-xl text-primary">Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-600 transition-colors"
              title="Logout"
            >
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                AD
              </div>
              <LogOut className="h-4 w-4 md:hidden" />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Workers</p>
                  <p className="font-heading text-2xl font-bold">{stats?.workersConnected || 0}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cities Active</p>
                  <p className="font-heading text-2xl font-bold">{stats?.cities || 0}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Partners</p>
                  <p className="font-heading text-2xl font-bold">{stats?.welfarePartners || 0}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Messages</p>
                  <p className="font-heading text-2xl font-bold">{messagesData?.total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <Tabs defaultValue="workers" className="w-full">
                <div className="border-b px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="workers" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium px-6">Registered Workers</TabsTrigger>
                    <TabsTrigger value="messages" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium px-6">Contact Messages</TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    onClick={handleExport} 
                    disabled={isExporting}
                    className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export to Excel"}
                  </Button>
                </div>

                <TabsContent value="workers" className="p-0 m-0 border-none outline-none">
                  {loadingWorkers ? (
                    <div className="p-8 text-center text-muted-foreground">Loading workers data...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-bold text-primary">Name</TableHead>
                            <TableHead className="font-bold text-primary">Location</TableHead>
                            <TableHead className="font-bold text-primary">Contact</TableHead>
                            <TableHead className="font-bold text-primary">Work Type</TableHead>
                            <TableHead className="font-bold text-primary">Platform</TableHead>
                            <TableHead className="font-bold text-primary text-right">Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workersData?.workers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No workers registered yet.
                              </TableCell>
                            </TableRow>
                          ) : (
                            workersData?.workers.map((worker) => (
                              <TableRow key={worker.id} className="hover:bg-gray-50/50">
                                <TableCell className="font-medium">{worker.name}</TableCell>
                                <TableCell>
                                  <div className="text-sm">{worker.city}</div>
                                  <div className="text-xs text-muted-foreground">{worker.state}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">{worker.phone}</div>
                                  {worker.email && <div className="text-xs text-muted-foreground">{worker.email}</div>}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`${getWorkTypeColor(worker.workType)} capitalize`}>
                                    {worker.workType.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">{worker.platform || '-'}</TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">
                                  {format(new Date(worker.joinedAt), 'MMM d, yyyy')}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="messages" className="p-0 m-0 border-none outline-none">
                  {loadingMessages ? (
                    <div className="p-8 text-center text-muted-foreground">Loading messages...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="font-bold text-primary w-1/4">Contact Info</TableHead>
                            <TableHead className="font-bold text-primary w-1/4">Subject</TableHead>
                            <TableHead className="font-bold text-primary w-1/3">Message</TableHead>
                            <TableHead className="font-bold text-primary text-right w-1/6">Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {messagesData?.messages.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                No contact messages yet.
                              </TableCell>
                            </TableRow>
                          ) : (
                            messagesData?.messages.map((msg) => (
                              <TableRow key={msg.id} className="hover:bg-gray-50/50">
                                <TableCell>
                                  <div className="font-medium text-sm">{msg.name}</div>
                                  <div className="text-xs text-muted-foreground">{msg.email}</div>
                                  {msg.phone && <div className="text-xs text-muted-foreground">{msg.phone}</div>}
                                </TableCell>
                                <TableCell className="font-medium text-sm text-primary">{msg.subject}</TableCell>
                                <TableCell>
                                  <p className="text-sm text-muted-foreground line-clamp-2" title={msg.message}>
                                    {msg.message}
                                  </p>
                                </TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">
                                  {format(new Date(msg.submittedAt), 'MMM d, yyyy h:mm a')}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
