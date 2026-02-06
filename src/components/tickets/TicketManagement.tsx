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
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTickets } from "@/hooks/useTickets";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { TicketCard } from "./TicketCard";
import { TicketFilters } from "./TicketFilters";
import { TicketDetails } from "./TicketDetails";
import { Ticket as TicketType, TicketFilter, CreateTicketData } from "@/types/ticket";
import { User } from "@/types/user";

export function TicketManagement() {
  const { user } = useAuth();
  
  // Create a mock user object for useTickets hook compatibility
  const mockUser = user ? {
    id: user.id,
    department: user.department,
    role: user.roles.includes('admin') ? 'admin' as const : 
          user.roles.includes('department_manager') ? 'department_manager' as const : 'employee' as const,
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
    assignTicket, 
    addComment,
    getTicketStats,
    filterTickets 
  } = useTickets();

  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [filter, setFilter] = useState<TicketFilter>({});
  const [activeTab, setActiveTab] = useState('all');

  // Mock users list for ticket management
  const users = [
    {
      id: 'cmh04hb4j0009sjkfdax7va1q',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gurgil.com',
      department: 'İnsan Kaynakları',
      role: 'admin' as const,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'cmh04hc0s000csjkfx8my2g1u',
      firstName: 'Manager',
      lastName: 'User',
      email: 'manager@gurgil.com',
      department: 'Bilgi İşlem',
      role: 'department_manager' as const,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'cmh04hcav000fsjkflx9yx9a7',
      firstName: 'Employee',
      lastName: 'User',
      email: 'employee@gurgil.com',
      department: 'Bilgi İşlem',
      role: 'employee' as const,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

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
      const updatedTicket = tickets.find(t => t.id === ticketId);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
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
        <CreateTicketDialog onCreateTicket={handleCreateTicket} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Ticket className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Toplam</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Açık</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Devam Eden</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Çözüldü</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-lg flex items-center justify-center">
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Kapatıldı</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.closed}</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Tüm Ticketlar</TabsTrigger>
          <TabsTrigger value="my-tickets" className="text-xs sm:text-sm">Oluşturduklarım</TabsTrigger>
          <TabsTrigger value="assigned" className="text-xs sm:text-sm">Atananlar</TabsTrigger>
          <TabsTrigger value="open" className="text-xs sm:text-sm">Açık</TabsTrigger>
          <TabsTrigger value="in-progress" className="text-xs sm:text-sm">Devam Eden</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {getTicketsByTab(activeTab).length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {getTicketsByTab(activeTab).map((ticket) => (
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