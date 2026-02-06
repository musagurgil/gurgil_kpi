import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { KPIStats } from '@/types/kpi';
import { toast } from '@/hooks/use-toast';

interface RecordProgressDialogProps {
  kpiStats: KPIStats;
  onRecordProgress: (kpiId: string, value: number, note?: string) => Promise<void>;
}

export function RecordProgressDialog({ kpiStats, onRecordProgress }: RecordProgressDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<number>(0);
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (value <= 0) {
      toast({
        title: "Hata",
        description: "İlerleme değeri 0'dan büyük olmalıdır",
        variant: "destructive"
      });
      return;
    }

    // Check if adding this value would exceed the target
    const newTotal = kpiStats.currentValue + value;
    if (newTotal > kpiStats.targetValue) {
      toast({
        title: "Uyarı",
        description: `Bu değer hedefi aşacaktır. Maksimum eklenebilecek değer: ${(kpiStats.targetValue - kpiStats.currentValue).toFixed(2)} ${kpiStats.unit}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await onRecordProgress(kpiStats.kpiId, value, note.trim() || undefined);
      
      // Reset form
      setValue(0);
      setNote('');
      setOpen(false);
    } catch (error) {
      console.error('Error recording progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const remainingValue = kpiStats.targetValue - kpiStats.currentValue;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="bg-gradient-success hover:bg-success/90"
          disabled={kpiStats.progressPercentage >= 100}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          İlerleme Kaydet
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            İlerleme Kaydet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* KPI Info */}
          <div className="bg-muted/30 p-3 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">{kpiStats.title}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Mevcut: </span>
                {kpiStats.currentValue.toLocaleString('tr-TR')} {kpiStats.unit}
              </div>
              <div>
                <span className="font-medium">Hedef: </span>
                {kpiStats.targetValue.toLocaleString('tr-TR')} {kpiStats.unit}
              </div>
              <div>
                <span className="font-medium">Kalan: </span>
                {remainingValue.toLocaleString('tr-TR')} {kpiStats.unit}
              </div>
              <div>
                <span className="font-medium">İlerleme: </span>
                %{kpiStats.progressPercentage.toFixed(1)}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Progress Value */}
            <div className="space-y-2">
              <Label htmlFor="progress-value">
                İlerleme Değeri * ({kpiStats.unit})
              </Label>
              <Input
                id="progress-value"
                type="number"
                min="0.01"
                max={remainingValue}
                step="0.01"
                value={value || ''}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                placeholder={`Maksimum: ${remainingValue.toFixed(2)}`}
                required
              />
              <p className="text-xs text-muted-foreground">
                Maksimum eklenebilecek değer: {remainingValue.toFixed(2)} {kpiStats.unit}
              </p>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="progress-note">Not (İsteğe bağlı)</Label>
              <Textarea
                id="progress-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bu ilerleme hakkında kısa bir açıklama..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {note.length}/500 karakter
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "İlerleme Kaydet"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}