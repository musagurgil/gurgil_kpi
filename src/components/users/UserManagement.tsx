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
  DropdownMenuSeparator,
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
  Clock,
  Shield,
  UserCheck,
  UserX,
  KeyRound,
  TrendingUp,
  Building2,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useKPI } from "@/hooks/useKPI";
import { useTickets } from "@/hooks/useTickets";
import { DEPARTMENTS, ROLES } from "@/types/user";
import { CreateUserDialog } from "./CreateUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
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
  activeTickets?: number;
  kpiStats?: {
    total: number;
    completed: number;
    percentage: number;
  };
}

// Avatar component with gradient background
function UserAvatar({ firstName, lastName, role }: { firstName: string; lastName: string; role: string }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const gradients: Record<string, string> = {
    admin: 'from-red-500 to-rose-600',
    department_manager: 'from-blue-500 to-indigo-600',
    employee: 'from-emerald-500 to-teal-600',
  };
  const gradient = gradients[role] || gradients.employee;

  return (
    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
      {initials}
    </div>
  );
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
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);

  const loading = adminLoading || kpiLoading || ticketsLoading;

  // Process and filter users
  useEffect(() => {
    if (!profiles) return;

    let processed = profiles.map(profile => {
      const activeTicketsCount = tickets.filter(t =>
        t.assignedTo === profile.id &&
        t.status !== 'resolved' &&
        t.status !== 'closed'
      ).length;

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

  // Stats
  const totalUsers = profiles?.length || 0;
  const activeUsers = profiles?.filter(p => p.isActive !== false).length || 0;
  const adminCount = profiles?.filter(p => p.userRoles?.some(r => r.role === 'admin')).length || 0;
  const deptCount = new Set(profiles?.map(p => p.department) || []).size;

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

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800';
      case 'department_manager': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800';
      case 'employee': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
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
        <TabsList className="grid w-full grid-cols-2 bg-card/60 backdrop-blur-sm border border-border/50">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Kullanıcı Yönetimi
          </TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Departman Yönetimi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Toplam Personel', value: totalUsers, icon: UsersIcon, color: 'from-blue-500 to-indigo-600', iconBg: 'bg-blue-100 text-blue-600' },
              { label: 'Aktif', value: activeUsers, icon: UserCheck, color: 'from-emerald-500 to-teal-600', iconBg: 'bg-emerald-100 text-emerald-600' },
              { label: 'Admin', value: adminCount, icon: Shield, color: 'from-red-500 to-rose-600', iconBg: 'bg-red-100 text-red-600' },
              { label: 'Departman', value: deptCount, icon: Building2, color: 'from-purple-500 to-violet-600', iconBg: 'bg-purple-100 text-purple-600' },
            ].map((stat) => (
              <Card key={stat.label} className="bg-card/60 backdrop-blur-sm border-border/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Table Card */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UsersIcon className="w-5 h-5 text-primary" />
                  Kullanıcı Listesi
                </CardTitle>
                <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Kullanıcı
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Ad, soyad veya e-posta ile ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50 focus-visible:ring-primary/30"
                    />
                  </div>
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-44 bg-background/50 border-border/50">
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
                  <SelectTrigger className="w-full sm:w-40 bg-background/50 border-border/50">
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

              {/* Table */}
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Kullanıcı</TableHead>
                      <TableHead className="font-semibold">Departman / Rol</TableHead>
                      <TableHead className="font-semibold">Aktif Görevler</TableHead>
                      <TableHead className="font-semibold">KPI Durumu</TableHead>
                      <TableHead className="font-semibold">Durum</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className={`hover:bg-primary/[0.03] transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                          } ${!user.isActive ? 'opacity-60' : ''}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatar firstName={user.firstName} lastName={user.lastName} role={user.role} />
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{user.firstName} {user.lastName}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm">{user.department}</span>
                            <Badge variant="outline" className={`w-fit text-[11px] px-2 py-0 border ${getRoleBadgeStyle(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{user.activeTickets || 0}</span>
                            <span className="text-xs text-muted-foreground">Ticket</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <TrendingUp className={`w-3.5 h-3.5 ${(user.kpiStats?.percentage || 0) >= 100 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                                <span className="text-sm font-semibold">
                                  {user.kpiStats?.percentage?.toFixed(0) || 0}%
                                </span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {user.kpiStats?.completed || 0}/{user.kpiStats?.total || 0} KPI
                              </span>
                            </div>
                            {/* Mini progress bar */}
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${(user.kpiStats?.percentage || 0) >= 100 ? 'bg-emerald-500' :
                                    (user.kpiStats?.percentage || 0) >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                                  }`}
                                style={{ width: `${Math.min(user.kpiStats?.percentage || 0, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/20">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-500/10 text-gray-500">
                              <UserX className="w-3 h-3 mr-1" />
                              Pasif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPasswordUser(user)}>
                                <KeyRound className="w-4 h-4 mr-2" />
                                Şifre Değiştir
                              </DropdownMenuItem>
                              {user.isActive && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-orange-600 focus:text-orange-700 focus:bg-orange-50"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Pasife Al / Sil
                                  </DropdownMenuItem>
                                </>
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
                <div className="text-center py-12">
                  <UsersIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Kullanıcı bulunamadı</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Filtrelerinizi değiştirmeyi deneyin</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
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

      {passwordUser && (
        <ChangePasswordDialog
          userId={passwordUser.id}
          userName={`${passwordUser.firstName} ${passwordUser.lastName}`}
          open={!!passwordUser}
          onOpenChange={(open) => !open && setPasswordUser(null)}
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