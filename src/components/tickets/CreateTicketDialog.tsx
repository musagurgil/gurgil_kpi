import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { CreateTicketData, TICKET_PRIORITIES } from "@/types/ticket";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

interface CreateTicketDialogProps {
  onCreateTicket: (data: CreateTicketData) => Promise<void>;
}

export function CreateTicketDialog({ onCreateTicket }: CreateTicketDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateTicketData>({
    title: '',
    description: '',
    priority: 'medium',
    targetDepartment: '',
    tags: []
  });

  // Load departments from API
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departments = await apiClient.getDepartments();
        const departmentNames = departments.map((d: any) => d.name);
        // Filter out current user's department (can't send ticket to yourself)
        const filtered = departmentNames.filter((dept: string) => dept !== user?.department);
        setAvailableDepartments(filtered);
      } catch (error) {
        console.error('Error loading departments:', error);
        // Fallback to empty array
        setAvailableDepartments([]);
      }
    };

    if (open) {
      loadDepartments();
    }
  }, [open, user?.department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.targetDepartment) {
      return;
    }

    setLoading(true);
    try {
      await onCreateTicket(formData);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        targetDepartment: '',
        tags: []
      });
      setOpen(false);
    } catch (error) {
      // Error handling done in parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-white shadow-elevated hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Ticket Oluştur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              placeholder="Ticket başlığını girin"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama *</Label>
            <Textarea
              id="description"
              placeholder="Sorunu detaylı olarak açıklayın"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Öncelik</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TICKET_PRIORITIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hedef Departman *</Label>
              <Select
                value={formData.targetDepartment}
                onValueChange={(value) => setFormData(prev => ({ ...prev, targetDepartment: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Departman seçin" />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.length > 0 ? (
                    availableDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Departmanlar yükleniyor...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.targetDepartment}
              className="bg-gradient-primary text-white"
            >
              {loading ? "Oluşturuluyor..." : "Ticket Oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}