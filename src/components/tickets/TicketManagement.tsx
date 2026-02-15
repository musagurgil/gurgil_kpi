import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ticket,
  Plus,
  Filter,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Download,
  LayoutGrid,
  List as ListIcon,
  KanbanSquare
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

  // Create a mock user object for useTickets hook compatibility
  const mockUser = user ? {
    id: user.id,
    department: user.department,
    role: user.roles.includes('admin') ? 'admin' as const :
      user.roles.includes('department_manager') ? 'department_manager' as const :
        user.roles.includes('board_member') ? 'board_member' as const : 'employee' as const,
    roles: user.roles, // Add missing roles property
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

  // Local helper to filter tickets
  const filterTickets = (tickets: TicketType[], currentFilter: TicketFilter) => {
    return tickets.filter(ticket => {
      if (currentFilter.status && ticket.status !== currentFilter.status) return false;
      if (currentFilter.priority && ticket.priority !== currentFilter.priority) return false;
      if (currentFilter.department && ticket.targetDepartment !== currentFilter.department) return false;
      if (currentFilter.search && !ticket.title.toLowerCase().includes(currentFilter.search.toLowerCase())) return false;
      // Assigned To filter
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

  // Local helper to get stats
  const getTicketStats = (ticketList: TicketType[]) => {
    const total = ticketList.length;
    const open = ticketList.filter(t => t.status === 'open').length;
    const inProgress = ticketList.filter(t => t.status === 'in_progress').length;
    const resolved = ticketList.filter(t => t.status === 'resolved').length;
    const closed = ticketList.filter(t => t.status === 'closed').length;

    return {
      total,
      open,
      inProgress,
      resolved,
      closed
    };
  };

  const filteredTickets = filterTickets(tickets, filter);
  const stats = getTicketStats(filteredTickets);

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

    // Force update selected ticket with latest data from tickets state
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ticket Yönetimi</h1>
          <p className="text-muted-foreground">
            Departmanlar arası destek talepleri ve çözüm süreçleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-muted rounded-md border text-muted-foreground mr-2">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode('list')}
              title="Liste Görünümü"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'board' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode('board')}
              title="Board Görünümü"
            >
              <KanbanSquare className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode('grid')}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleExportTickets}
            disabled={currentTabTickets.length === 0}
            className="gap-2 hidden sm:flex"
          >
            <Download className="w-4 h-4" />
            Excel
          </Button>
          {!user?.roles.includes('board_member') && (
            <CreateTicketDialog onCreateTicket={handleCreateTicket} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Toplam</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Açık</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">İşlemde</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Çözüldü</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Kapatıldı</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.closed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TicketFilters
        filter={filter}
        onFilterChange={setFilter}
        users={users}
      />

      {/* Ticket Charts */}
      {tickets.length > 0 && viewMode === 'grid' && (
        <TicketCharts tickets={filteredTickets} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Tüm Ticketlar</TabsTrigger>
          <TabsTrigger value="my-tickets" className="text-xs sm:text-sm">Oluşturduklarım</TabsTrigger>
          <TabsTrigger value="assigned" className="text-xs sm:text-sm">Atananlar</TabsTrigger>
          <TabsTrigger value="open" className="text-xs sm:text-sm">Açık</TabsTrigger>
          <TabsTrigger value="in-progress" className="text-xs sm:text-sm">Devam Eden</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 m-0">
          {currentTabTickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Ticket bulunamadı</h3>
                <p className="text-muted-foreground">
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
          // Refresh the selected ticket by finding it in the updated tickets list
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