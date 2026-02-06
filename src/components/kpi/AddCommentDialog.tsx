import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddCommentDialogProps {
  kpiId: string;
  onAddComment: (kpiId: string, content: string) => Promise<void>;
}

export function AddCommentDialog({ kpiId, onAddComment }: AddCommentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Hata",
        description: "Yorum içeriği boş olamaz",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(kpiId, content.trim());
      setContent('');
      setIsOpen(false);
      toast({
        title: "Başarılı",
        description: "Yorum başarıyla eklendi"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Hata",
        description: "Yorum eklenirken bir hata oluştu",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4" />
          Yorum Ekle
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yorum Ekle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Yorumunuzu yazın..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
          />
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                "Ekleniyor..."
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Ekle
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}