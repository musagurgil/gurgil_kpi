import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { BackupListItem, BackupMetadata } from '@/types/backup';

export const useBackup = () => {
    const [backups, setBackups] = useState<BackupListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [restoring, setRestoring] = useState(false);

    const loadBackups = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiClient.getBackups();
            setBackups(data);
        } catch (err) {
            console.error('Error loading backups:', err);
            toast.error('Yedekler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, []);

    const createBackup = async () => {
        try {
            setCreating(true);
            const result = await apiClient.createBackup();
            toast.success(result.message || 'Yedek başarıyla oluşturuldu');
            await loadBackups();
            return result;
        } catch (err) {
            console.error('Error creating backup:', err);
            toast.error('Yedek oluşturulurken hata oluştu');
            throw err;
        } finally {
            setCreating(false);
        }
    };

    const downloadBackup = async (id: string) => {
        try {
            await apiClient.downloadBackup(id);
            toast.success('Yedek dosyası indiriliyor...');
        } catch (err) {
            console.error('Error downloading backup:', err);
            toast.error('Yedek indirilirken hata oluştu');
        }
    };

    const restoreBackup = async (id: string) => {
        try {
            setRestoring(true);
            const result = await apiClient.restoreBackup(id);
            toast.success(result.message || 'Geri yükleme başarıyla tamamlandı');
            return result;
        } catch (err) {
            console.error('Error restoring backup:', err);
            toast.error('Geri yükleme sırasında hata oluştu');
            throw err;
        } finally {
            setRestoring(false);
        }
    };

    const deleteBackup = async (id: string) => {
        try {
            const result = await apiClient.deleteBackup(id);
            toast.success(result.message || 'Yedek başarıyla silindi');
            await loadBackups();
        } catch (err) {
            console.error('Error deleting backup:', err);
            toast.error('Yedek silinirken hata oluştu');
        }
    };

    return {
        backups,
        loading,
        creating,
        restoring,
        loadBackups,
        createBackup,
        downloadBackup,
        restoreBackup,
        deleteBackup,
    };
};
