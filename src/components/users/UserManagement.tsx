import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserDeactivationDialog from "../admin/UserDeactivationDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Users as UsersIcon,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useKPI } from "@/hooks/useKPI";
import { useTickets } from "@/hooks/useTickets";
import { DEPARTMENTS, ROLES } from "@/types/user";
import { CreateUserDialog } from "./CreateUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { DepartmentManagement } from "@/components/departments/DepartmentManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  role: 'admin' | 'department_manager' | 'employee';
  isActive: boolean;
  createdAt: string;
  // Dynamic metrics
  activeTickets?: number;
  kpiStats?: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export const UserManagement = () => {
  const { profiles, loading: adminLoading, deleteProfile, refetch } = useAdmin();
  const { kpiStats, loading: kpiLoading } = useKPI();
  const { tickets, loading: ticketsLoading } = useTickets();

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New State for Deactivation
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

  const loading = adminLoading || kpiLoading || ticketsLoading;

  // Process and filter users
  useEffect(() => {
    if (!profiles) return;

    let processed = profiles.map(profile => {
      // Calculate active tickets
      const activeTicketsCount = tickets.filter(t =>
        t.assignedTo === profile.id &&
        t.status !== 'resolved' &&
        t.status !== 'closed'
      ).length;

      // Calculate KPI stats
      // KPIStats has assignedUsers which is a string[] of user IDs
      const userKPIs = kpiStats.filter(k => k.assignedUsers?.includes(profile.id));
      const totalKPIs = userKPIs.length;
      const completedKPIs = userKPIs.filter(k => k.status === 'success' || k.progressPercentage >= 100).length;
      const kpiPercentage = totalKPIs > 0 ? (completedKPIs / totalKPIs) * 100 : 0;

      return {
        ...profile,
        role: (profile.userRoles?.[0]?.role || 'employee') as 'admin' | 'department_manager' | 'employee',
        isActive: profile.isActive ?? true,
        activeTickets: activeTicketsCount,
        kpiStats: {
          total: totalKPIs,
          completed: completedKPIs,
          percentage: kpiPercentage
        }
      };
    });

    // Apply filters
    if (searchTerm) {
      processed = processed.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      processed = processed.filter(user => user.department === selectedDepartment);
    }

    if (selectedRole !== 'all') {
      processed = processed.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(processed as User[]);
  }, [profiles, tickets, kpiStats, searchTerm, selectedDepartment, selectedRole]);

  // Handlers
  const handleDeleteUser = (userId: string) => {
    const user = filteredUsers.find(u => u.id === userId);
    if (user) {
      setUserToDeactivate(user);
    }
  };

  const handleDeactivationSuccess = () => {
    refetch();
    setUserToDeactivate(null);
    toast({
      title: "Başarılı",
      description: "Kullanıcı pasife alındı ve varlıkları devredildi.",
      variant: "default"
    });
  };

  const handleUserCreated = () => {
    refetch();
  };

  const handleUserUpdated = () => {
    refetch();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'department_manager': return 'default';
      case 'employee': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'department_manager': return 'Departman Müdürü';
      case 'employee': return 'Çalışan';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Kullanıcı Yönetimi</TabsTrigger>
          <TabsTrigger value="departments">Departman Yönetimi</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5" />
                  Kullanıcı Yönetimi
                </CardTitle>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Kullanıcı
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Kullanıcı ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Departman" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Departmanlar</SelectItem>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Roller</SelectItem>
                    {Object.entries(ROLES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Departman / Rol</TableHead>
                      <TableHead>Aktif Görevler</TableHead>
                      <TableHead>KPI Durumu</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.firstName} {user.lastName}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">{user.department}</span>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit">
                              {getRoleLabel(user.role)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{user.activeTickets || 0} Ticket</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`w-4 h-4 ${(user.kpiStats?.percentage || 0) >= 100 ? 'text-success' : 'text-muted-foreground'}`} />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {user.kpiStats?.percentage.toFixed(0)}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.kpiStats?.completed}/{user.kpiStats?.total} Tamamlandı
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                <span className={user.isActive ? '' : 'text-muted-foreground'}>
                                  Düzenle
                                </span>
                              </DropdownMenuItem>
                              {user.isActive && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Pasife Al / Sil
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Kullanıcı bulunamadı
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentManagement />
        </TabsContent>
      </Tabs>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={handleUserCreated}
      />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {userToDeactivate && (
        <UserDeactivationDialog
          isOpen={!!userToDeactivate}
          onClose={() => setUserToDeactivate(null)}
          user={userToDeactivate}
          onSuccess={handleDeactivationSuccess}
        />
      )}
    </div>
  );
};