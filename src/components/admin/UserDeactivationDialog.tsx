import React, { useState, useEffect } from 'react';
import { User, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { API_URL } from '../../config';

interface UserDeactivationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSuccess: () => void;
}

const UserDeactivationDialog: React.FC<UserDeactivationDialogProps> = ({
    isOpen,
    onClose,
    user,
    onSuccess
}) => {
    const [step, setStep] = useState<'confirm' | 'transfer' | 'processing'>('confirm');
    const [targetUser, setTargetUser] = useState<string>('');
    const [users, setUsers] = useState<any[]>([]);
    const [assets, setAssets] = useState({ tickets: 0, kpis: 0 });
    const [transferOptions, setTransferOptions] = useState({
        tickets: true,
        kpis: true
    });

    useEffect(() => {
        if (isOpen && user) {
            checkAssets();
            fetchUsers();
        }
    }, [isOpen, user]);

    const checkAssets = async () => {
        // Ideally we'd have an endpoint to just check assets without deactivating, 
        // but for now we'll assume there might be assets if we are here.
        // In a real app, we'd call a GET /api/users/:id/assets endpoint.
        // For this implementation, we will fetch the Deactivation dry-run if available, 
        // or just proceed to transfer step if user confirms.
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data.filter((u: any) => u.id !== user.id && u.isActive));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleDeactivate = async () => {
        setStep('processing');
        try {
            const token = localStorage.getItem('token');

            // 1. Deactivate
            const res = await fetch(`${API_URL}/api/admin/profiles/${user.id}/deactivate`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (data.activeAssets && (data.activeAssets.tickets > 0 || data.activeAssets.kpis > 0)) {
                setAssets(data.activeAssets);
                setStep('transfer'); // Move to transfer step if assets exist
                return;
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Deactivation error:', error);
            setStep('confirm'); // Revert on error
        }
    };

    const handleTransferAndClose = async () => {
        if (!targetUser) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/profiles/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    fromUserId: user.id,
                    toUserId: targetUser,
                    transferTickets: transferOptions.tickets,
                    transferKpis: transferOptions.kpis
                })
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Transfer error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-orange-500" />
                    Personel Ayrılış İşlemleri
                </h2>

                {step === 'confirm' && (
                    <div>
                        <p className="mb-4 text-gray-600">
                            <strong>{user.firstName} {user.lastName}</strong> kullanıcısını pasife almak üzeresiniz.
                            Giriş yetkisi kapatılacak ancak geçmiş verileri korunacaktır.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleDeactivate}
                                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                            >
                                Pasife Al
                            </button>
                        </div>
                    </div>
                )}

                {step === 'transfer' && (
                    <div>
                        <div className="bg-blue-50 p-4 rounded mb-4">
                            <h3 className="font-semibold text-blue-800 mb-2">Aktif Görevler Tespit Edildi</h3>
                            <ul className="list-disc pl-5 text-blue-700">
                                {assets.tickets > 0 && <li>{assets.tickets} Açık Ticket</li>}
                                {assets.kpis > 0 && <li>{assets.kpis} Aktif KPI Hedefi</li>}
                            </ul>
                        </div>

                        <p className="mb-2 text-sm text-gray-600">Bu görevleri kime devretmek istersiniz?</p>

                        <select
                            className="w-full border rounded p-2 mb-4"
                            value={targetUser}
                            onChange={(e) => setTargetUser(e.target.value)}
                        >
                            <option value="">-- Personel Seçin --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { onSuccess(); onClose(); }} // Skip transfer
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Devretmeden Kapat
                            </button>
                            <button
                                onClick={handleTransferAndClose}
                                disabled={!targetUser}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                Devret ve Tamamla
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDeactivationDialog;
