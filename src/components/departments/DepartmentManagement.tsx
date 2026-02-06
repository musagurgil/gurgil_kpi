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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Building2,
  Users as UsersIcon
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Department {
  id: string;
  name: string;
  userCount: number;
  managerCount: number;
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch departments from API
      const depts = await apiClient.getDepartments();
      
      // Fetch profiles from API
      const profiles = await apiClient.getProfiles();

      // Calculate stats
      const departmentStats = new Map<string, { userCount: number; managerCount: number }>();
      
      profiles?.forEach(profile => {
        const current = departmentStats.get(profile.department) || { userCount: 0, managerCount: 0 };
        current.userCount++;
        
        // Check if user is admin or department_manager
        // Backend returns userRoles array with role objects
        const roles = profile.userRoles?.map((ur: any) => ur.role) || [];
        const isManager = roles.some(role => role === 'admin' || role === 'department_manager');
        if (isManager) {
          current.managerCount++;
        }
        
        departmentStats.set(profile.department, current);
      });

      const deptList: Department[] = (depts || []).map(dept => {
        const stats = departmentStats.get(dept.name) || { userCount: 0, managerCount: 0 };
        return {
          id: dept.id,
          name: dept.name,
          userCount: stats.userCount,
          managerCount: stats.managerCount
        };
      });

      setDepartments(deptList);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: "Hata",
        description: "Departman verileri yüklenirken hata oluştu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async () => {
    if (!departmentName.trim()) {
      toast({
        title: "Hata",
        description: "Departman adı boş olamaz",
        variant: "destructive"
      });
      return;
    }

    if (departments.some(dept => dept.name.toLowerCase() === departmentName.toLowerCase())) {
      toast({
        title: "Hata",
        description: "Bu departman adı zaten mevcut",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create department via API
      await apiClient.createDepartment(departmentName);

      setDepartmentName('');
      setShowCreateDialog(false);
      loadData();
      
      toast({
        title: "Başarılı",
        description: "Departman başarıyla oluşturuldu"
      });
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: "Hata",
        description: "Departman oluşturulamadı",
        variant: "destructive"
      });
    }
  };

  const handleEditDepartment = async () => {
    if (!editingDepartment || !departmentName.trim()) {
      toast({
        title: "Hata",
        description: "Departman adı boş olamaz",
        variant: "destructive"
      });
      return;
    }

    if (departments.some(dept => dept.name.toLowerCase() === departmentName.toLowerCase() && dept.id !== editingDepartment.id)) {
      toast({
        title: "Hata",
        description: "Bu departman adı zaten mevcut",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiClient.updateDepartment(editingDepartment.id, departmentName.trim());

      setDepartmentName('');
      setEditingDepartment(null);
      loadData();
      
      toast({
        title: "Başarılı",
        description: "Departman başarıyla güncellendi"
      });
    } catch (error: any) {
      console.error('Error updating department:', error);
      toast({
        title: "Hata",
        description: error.message || "Departman güncellenemedi",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDepartment = async (department: Department) => {
    if (department.userCount > 0) {
      toast({
        title: "Hata",
        description: "Bu departmanda kullanıcılar bulunduğu için silinemez. Önce kullanıcıları başka departmanlara taşıyın.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`"${department.name}" departmanını silmek istediğinizden emin misiniz?`)) {
      try {
        await apiClient.deleteDepartment(department.id);

        loadData();
        
        toast({
          title: "Başarılı",
          description: "Departman başarıyla silindi"
        });
      } catch (error: any) {
        console.error('Error deleting department:', error);
        toast({
          title: "Hata",
          description: error.message || "Departman silinemedi",
          variant: "destructive"
        });
      }
    }
  };

  const openCreateDialog = () => {
    setDepartmentName('');
    setShowCreateDialog(true);
  };

  const openEditDialog = (department: Department) => {
    setDepartmentName(department.name);
    setEditingDepartment(department);
  };

  const closeDialogs = () => {
    setShowCreateDialog(false);
    setEditingDepartment(null);
    setDepartmentName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departman Yönetimi</h1>
          <p className="text-muted-foreground">
            Şirket departmanlarını yönetin
          </p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Departman
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam Departman</p>
                <p className="text-xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-kpi-success" />
              <div>
                <p className="text-sm text-muted-foreground">Toplam Çalışan</p>
                <p className="text-xl font-bold">
                  {departments.reduce((sum, dept) => sum + dept.userCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Ortalama Çalışan/Departman</p>
              <p className="text-xl font-bold">
                {departments.length > 0 
                  ? (departments.reduce((sum, dept) => sum + dept.userCount, 0) / departments.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Departman Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Departman Adı</TableHead>
                  <TableHead>Çalışan Sayısı</TableHead>
                  <TableHead>Yönetici Sayısı</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div className="font-medium">{department.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {department.userCount} kişi
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {department.managerCount} yönetici
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(department)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDepartment(department)}
                            className="text-destructive"
                            disabled={department.userCount > 0}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {departments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Henüz departman bulunmuyor</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Department Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={closeDialogs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Departman Oluştur</DialogTitle>
            <DialogDescription>
              Yeni bir departman oluşturmak için departman adını girin.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Departman adı"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateDepartment()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              İptal
            </Button>
            <Button onClick={handleCreateDepartment}>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={!!editingDepartment} onOpenChange={closeDialogs}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Departman Düzenle</DialogTitle>
            <DialogDescription>
              Departman adını güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Departman adı"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEditDepartment()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              İptal
            </Button>
            <Button onClick={handleEditDepartment}>
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}