import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ticket,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  LayoutGrid,
  List as ListIcon,
  KanbanSquare,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTickets } from "@/hooks/useTickets";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { TicketCard } from "./TicketCard";
import { TicketFilters } from "./TicketFilters";
import { TicketDetails } from "./TicketDetails";
import { TicketCharts } from "./TicketCharts";
import { TicketTable } from "./TicketTable";
import { TicketBoard } from "./TicketBoard";
import { Ticket as TicketType, TicketFilter, CreateTicketData } from "@/types/ticket";
import { User } from "@/types/user";
import { exportTicketsToCSV } from "@/lib/export";
import { toast as sonnerToast } from 'sonner';

export function TicketManagement() {
  const { user } = useAuth();

  const mockUser = user ? {
    id: user.id,
    department: user.department,
    role: user.roles.includes('admin') ? 'admin' as const :
      user.roles.includes('department_manager') ? 'department_manager' as const :
        user.roles.includes('board_member') ? 'board_member' as const : 'employee' as const,
    roles: user.roles,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    isActive: true,
    createdAt: new Date().toISOString()
  } : null;

  const {
    tickets,
    loading,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    addComment
  } = useTickets();

  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [filter, setFilter] = useState<TicketFilter>({});
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'board'>('grid');
  const [users, setUsers] = useState<User[]>([]);
  const [showCharts, setShowCharts] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await import("@/lib/api").then(m => m.apiClient.getUsers());
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        sonnerToast.error("Kullanıcı listesi güncellenemedi");
      }
    };
    fetchUsers();
  }, []);

  const filterTickets = (tickets: TicketType[], currentFilter: TicketFilter) => {
    return tickets.filter(ticket => {
      if (currentFilter.status && ticket.status !== currentFilter.status) return false;
      if (currentFilter.priority && ticket.priority !== currentFilter.priority) return false;
      if (currentFilter.department && ticket.targetDepartment !== currentFilter.department) return false;
      if (currentFilter.search && !ticket.title.toLowerCase().includes(currentFilter.search.toLowerCase())) return false;
      if (currentFilter.assignedTo) {
        if (currentFilter.assignedTo === 'unassigned') {
          if (ticket.assignedTo) return false;
        } else {
          if (ticket.assignedTo !== currentFilter.assignedTo) return false;
        }
      }
      return true;
    });
  };

  const getTicketStats = (ticketList: TicketType[]) => {
    const total = ticketList.length;
    const open = ticketList.filter(t => t.status === 'open').length;
    const inProgress = ticketList.filter(t => t.status === 'in_progress').length;
    const resolved = ticketList.filter(t => t.status === 'resolved').length;
    const closed = ticketList.filter(t => t.status === 'closed').length;
    return { total, open, inProgress, resolved, closed };
  };

  const filteredTickets = filterTickets(tickets, filter);
  const stats = getTicketStats(filteredTickets);
  const completionRate = stats.total > 0 ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100) : 0;

  const getTicketsByTab = (tab: string) => {
    if (!user) return [];
    switch (tab) {
      case 'my-tickets':
        return filteredTickets.filter(ticket => ticket.createdBy === user.id);
      case 'assigned':
        return filteredTickets.filter(ticket => ticket.assignedTo === user.id);
      case 'open':
        return filteredTickets.filter(ticket => ticket.status === 'open');
      case 'in-progress':
        return filteredTickets.filter(ticket => ticket.status === 'in_progress');
      default:
        return filteredTickets;
    }
  };

  const currentTabTickets = getTicketsByTab(activeTab);

  const handleCreateTicket = async (data: CreateTicketData) => {
    await createTicket(data);
  };

  const handleViewTicket = (ticket: TicketType) => {
    setSelectedTicket(ticket);
  };

  const handleUpdateTicket = async (ticketId: string, updates: Partial<TicketType>) => {
    const success = await updateTicket(ticketId, updates);
    if (success && selectedTicket) {
      setSelectedTicket(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleAssignTicket = async (ticketId: string, assignedTo: string) => {
    const success = await assignTicket(ticketId, assignedTo);
    if (success && selectedTicket) {
      setSelectedTicket(prev => prev ? { ...prev, assignedTo, status: 'in_progress' } : null);
    }
  };

  const handleAddComment = async (ticketId: string, content: string, isInternal?: boolean) => {
    const success = await addComment(ticketId, content, isInternal);
    if (success && selectedTicket) {
      setTimeout(() => {
        const updatedTicket = tickets.find(t => t.id === ticketId);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }, 50);
    }
    return success;
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicket(ticketId);
      setSelectedTicket(null);
    } catch (error) {
      // Error toast already shown by useTickets
    }
  };

  const handleExportTickets = () => {
    try {
      exportTicketsToCSV(currentTabTickets, 'ticket-raporu');
      sonnerToast.success(`✅ ${currentTabTickets.length} ticket Excel dosyasına aktarıldı!`);
    } catch (error: any) {
      sonnerToast.error('❌ Export işlemi başarısız: ' + error.message);
    }
  };

  if (!mockUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Kullanıcı bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Toplam', value: stats.total, icon: Ticket, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10' },
    { label: 'Açık', value: stats.open, icon: Clock, gradient: 'from-sky-400 to-blue-500', bg: 'bg-sky-500/10' },
    { label: 'İşlemde', value: stats.inProgress, icon: AlertTriangle, gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10' },
    { label: 'Çözüldü', value: stats.resolved, icon: CheckCircle, gradient: 'from-emerald-400 to-green-600', bg: 'bg-emerald-500/10' },
    { label: 'Kapatıldı', value: stats.closed, icon: XCircle, gradient: 'from-slate-400 to-gray-500', bg: 'bg-slate-500/10' },
  ];

  return (
    <div className="space-y-5">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZWMzRoLTR2LTRoNHYtNmg2djZoNHY0aC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shadow-lg">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Ticket Yönetimi</h1>
              <p className="text-white/70 text-sm mt-0.5">
                Departmanlar arası destek talepleri ve çözüm süreçleri
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex p-1 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              {[
                { mode: 'list' as const, icon: ListIcon, title: 'Liste' },
                { mode: 'board' as const, icon: KanbanSquare, title: 'Board' },
                { mode: 'grid' as const, icon: LayoutGrid, title: 'Kartlar' },
              ].map(({ mode, icon: Icon, title }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={title}
                  className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === mode
                      ? 'bg-white/25 text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Charts Toggle */}
            <button
              onClick={() => setShowCharts(!showCharts)}
              title={showCharts ? 'Grafikleri Gizle' : 'Grafikleri Göster'}
              className={`p-2 rounded-lg transition-all duration-200 border ${showCharts
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/70'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>

            {/* Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTickets}
              disabled={currentTabTickets.length === 0}
              className="hidden sm:flex gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
            >
              <Download className="w-4 h-4" />
              Excel
            </Button>

            {/* Create */}
            {!user?.roles.includes('board_member') && (
              <CreateTicketDialog onCreateTicket={handleCreateTicket} />
            )}
          </div>
        </div>

        {/* Completion Rate Indicator */}
        <div className="relative mt-4 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-green-300 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="text-xs text-white/70 font-medium whitespace-nowrap">
            %{completionRate} tamamlandı
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <TicketFilters
        filter={filter}
        onFilterChange={setFilter}
        users={users}
      />

      {/* Charts */}
      {showCharts && tickets.length > 0 && (
        <TicketCharts tickets={filteredTickets} />
      )}

      {/* Tabs & Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-1 mb-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 bg-transparent gap-1">
            {[
              { value: 'all', label: 'Tüm Ticketlar', count: filteredTickets.length },
              { value: 'my-tickets', label: 'Oluşturduklarım', count: getTicketsByTab('my-tickets').length },
              { value: 'assigned', label: 'Atananlar', count: getTicketsByTab('assigned').length },
              { value: 'open', label: 'Açık', count: getTicketsByTab('open').length },
              { value: 'in-progress', label: 'Devam Eden', count: getTicketsByTab('in-progress').length },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 min-w-4 px-1 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="space-y-4 m-0">
          {currentTabTickets.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Ticket bulunamadı</h3>
                <p className="text-muted-foreground text-sm">
                  Seçilen kriterlere uygun ticket bulunmuyor.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {currentTabTickets.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      users={users}
                      currentUser={mockUser}
                      onViewTicket={handleViewTicket}
                      onAssignTicket={handleAssignTicket}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <TicketTable
                  tickets={currentTabTickets}
                  users={users}
                  currentUser={mockUser}
                  onViewTicket={handleViewTicket}
                  onAssignTicket={handleAssignTicket}
                />
              )}

              {viewMode === 'board' && (
                <TicketBoard
                  tickets={currentTabTickets}
                  users={users}
                  currentUser={mockUser}
                  onViewTicket={handleViewTicket}
                  onAssignTicket={handleAssignTicket}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <TicketDetails
        ticket={selectedTicket}
        users={users}
        currentUser={mockUser}
        onClose={() => setSelectedTicket(null)}
        onUpdateTicket={handleUpdateTicket}
        onAssignTicket={handleAssignTicket}
        onAddComment={handleAddComment}
        onDeleteTicket={handleDeleteTicket}
        onRefreshTicket={() => {
          if (selectedTicket) {
            const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
            if (updatedTicket) {
              setSelectedTicket(updatedTicket);
            }
          }
        }}
      />
    </div>
  );
}