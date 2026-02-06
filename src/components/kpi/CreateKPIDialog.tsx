import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Target } from "lucide-react";
import { CreateKPIData, KPI_PERIODS, KPI_PRIORITIES } from '@/types/kpi';
import { User } from '@/types/user';
import { toast } from '@/hooks/use-toast';

interface CreateKPIDialogProps {
  onCreateKPI: (data: CreateKPIData) => Promise<void>;
  availableDepartments: string[];
  availableUsers: User[];
  currentUser: User | null;
}

export function CreateKPIDialog({ 
  onCreateKPI, 
  availableDepartments, 
  availableUsers,
  currentUser 
}: CreateKPIDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateKPIData>({
    title: '',
    description: '',
    department: currentUser?.department || '',
    targetValue: 0,
    unit: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    period: 'monthly',
    priority: 'medium',
    assignedTo: []
  });

  // Check if user can create KPIs
  const canCreateKPI = currentUser?.role === 'admin' || currentUser?.role === 'department_manager';

  if (!canCreateKPI) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Hata",
        description: "KPI başlığı gereklidir",
        variant: "destructive"
      });
      return;
    }

    if (!formData.department) {
      toast({
        title: "Hata",
        description: "Departman seçimi gereklidir",
        variant: "destructive"
      });
      return;
    }

    if (formData.targetValue <= 0) {
      toast({
        title: "Hata",
        description: "Hedef değeri 0'dan büyük olmalıdır",
        variant: "destructive"
      });
      return;
    }

    if (!formData.unit.trim()) {
      toast({
        title: "Hata",
        description: "Birim gereklidir",
        variant: "destructive"
      });
      return;
    }

    if (!formData.endDate) {
      toast({
        title: "Hata",
        description: "Bitiş tarihi gereklidir",
        variant: "destructive"
      });
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast({
        title: "Hata",
        description: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
        variant: "destructive"
      });
      return;
    }

    if (formData.assignedTo.length === 0) {
      toast({
        title: "Hata", 
        description: "En az bir kişi atanmalıdır",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await onCreateKPI(formData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        department: currentUser?.department || '',
        targetValue: 0,
        unit: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        period: 'monthly',
        priority: 'medium',
        assignedTo: []
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error creating KPI:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignedToChange = (userId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        assignedTo: [...prev.assignedTo, userId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assignedTo: prev.assignedTo.filter(id => id !== userId)
      }));
    }
  };

  // Filter users based on selected department
  const departmentUsers = availableUsers.filter(user => 
    user.department === formData.department
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Yeni KPI Hedefi
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="line-clamp-2">Yeni KPI Hedefi Oluştur</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium">KPI Başlığı *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Örn: Aylık Satış Hedefi"
                required
                className="text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="KPI hakkında detaylı açıklama..."
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">Departman *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  department: value,
                  assignedTo: [] // Reset assigned users when department changes
                }))}
                disabled={currentUser?.role === 'department_manager'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Departman seçin" />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.length > 0 ? (
                    currentUser?.role === 'admin' 
                      ? availableDepartments.map(dept => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))
                      : availableDepartments
                          .filter(dept => dept === currentUser?.department)
                          .map(dept => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Yükleniyor...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {currentUser?.role === 'department_manager' && (
                <p className="text-xs text-muted-foreground">
                  Departman yöneticileri sadece kendi departmanları için KPI oluşturabilir
                </p>
              )}
            </div>

            {/* Period */}
            <div className="space-y-2">
              <Label htmlFor="period">Dönem *</Label>
              <Select
                value={formData.period}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, period: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KPI_PERIODS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Value */}
            <div className="space-y-2">
              <Label htmlFor="targetValue" className="text-sm font-medium">Hedef Değer *</Label>
              <Input
                id="targetValue"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.targetValue || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  targetValue: parseFloat(e.target.value) || 0 
                }))}
                placeholder="100"
                required
                className="text-sm"
              />
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium">Birim *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="Örn: adet, TL, %"
                required
                className="text-sm"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">Başlangıç Tarihi *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
                className="text-sm"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">Bitiş Tarihi *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
                className="text-sm"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="priority" className="text-sm font-medium">Öncelik</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KPI_PRIORITIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assigned Users */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Atanan Kişiler *</Label>
            {!formData.department ? (
              <div className="border rounded-md p-4 text-center text-sm text-muted-foreground">
                Önce bir departman seçin
              </div>
            ) : departmentUsers.length === 0 ? (
              <div className="border rounded-md p-4 text-center text-sm text-muted-foreground">
                Bu departmanda kullanıcı bulunamadı
              </div>
            ) : (
              <div className="max-h-32 sm:max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                {departmentUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={formData.assignedTo.includes(user.id)}
                      onCheckedChange={(checked) => 
                        handleAssignedToChange(user.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`user-${user.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {user.firstName} {user.lastName} ({user.role === 'admin' ? 'Sistem Yöneticisi' : 
                        user.role === 'department_manager' ? 'Departman Yöneticisi' : 'Çalışan'})
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {formData.assignedTo.length === 0 && formData.department && departmentUsers.length > 0 && (
              <p className="text-xs text-muted-foreground">
                En az bir kişi seçmelisiniz
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Oluşturuluyor..." : "KPI Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}