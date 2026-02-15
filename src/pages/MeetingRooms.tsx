import { useState, useMemo, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api';
import { useMeetingRooms } from '@/hooks/useMeetingRooms';
import { useAuth } from '@/hooks/useAuth';
import { ReservationForm } from '@/components/meetingRooms/ReservationForm';
import { ReservationEditDialog } from '@/components/meetingRooms/ReservationEditDialog';
import { RoomDetailDialog } from '@/components/meetingRooms/RoomDetailDialog';
import { ReservationDetailDialog } from '@/components/meetingRooms/ReservationDetailDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  Plus,
  Building2,
  MapPin,
  Users,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';

import { MeetingRoom, MeetingReservation } from '@/types/meeting';

export default function MeetingRooms() {
  const {
    rooms,
    reservations,
    loading,
    createRoom,
    deleteRoom,
    createReservation,
    approveReservation,
    rejectReservation,
    updateReservation,
    updateRoom,
    deleteReservation,
    refreshRooms,
    refreshReservations
  } = useMeetingRooms();

  const { hasPermission, user } = useAuth();
  const isAdmin = hasPermission('admin');
  const canApprove = hasPermission('department_manager') || hasPermission('secretary');

  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<MeetingRoom | null>(null);
  const [showCreateRoomDialog, setShowCreateRoomDialog] = useState(false);
  const [editingReservation, setEditingReservation] = useState<MeetingReservation | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<MeetingReservation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  // Create room form state
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [newRoomLocation, setNewRoomLocation] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomResponsibleId, setNewRoomResponsibleId] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);

  // Users for responsible dropdown
  const [users, setUsers] = useState<any[]>([]);

  // Fetch users for admin to assign responsibility
  useEffect(() => {
    if (isAdmin) {
      import('@/lib/api').then(({ apiClient }) => {
        apiClient.getProfiles().then(setUsers).catch(console.error);
      });
    }
  }, [isAdmin]);

  const handleReserveClick = (roomId: string) => {
    setSelectedRoomId(roomId);
    setShowReservationForm(true);
  };

  const handleCreateReservation = async (data: {
    roomId: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }) => {
    await createReservation(data);
    await refreshRooms();
    await refreshReservations();
    setSelectedRoomId(null);
    setShowReservationForm(false);
  };

  const handleCreateRoom = async () => {
    if (!newRoomName || !newRoomCapacity || !newRoomLocation) {
      return;
    }

    setCreatingRoom(true);
    try {
      await createRoom({
        name: newRoomName,
        capacity: parseInt(newRoomCapacity),
        location: newRoomLocation,
        description: newRoomDescription || undefined,
        responsibleId: newRoomResponsibleId || undefined
      } as any);
      setNewRoomName('');
      setNewRoomCapacity('');
      setNewRoomLocation('');
      setNewRoomDescription('');
      setNewRoomResponsibleId('');
      setShowCreateRoomDialog(false);
      await refreshRooms();
    } catch (error) {
      // Error handled in hook
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleEditRoomClick = (room: MeetingRoom) => {
    setEditingRoom(room);
    setNewRoomName(room.name);
    setNewRoomCapacity(room.capacity.toString());
    setNewRoomLocation(room.location);
    setNewRoomDescription(room.description || '');
    setNewRoomResponsibleId(room.responsibleId || '');
  };

  const handleUpdateRoom = async () => {
    if (!editingRoom || !newRoomName || !newRoomCapacity || !newRoomLocation) return;

    setCreatingRoom(true);
    try {
      await updateRoom(editingRoom.id, {
        name: newRoomName,
        capacity: parseInt(newRoomCapacity),
        location: newRoomLocation,
        description: newRoomDescription || undefined,
        responsibleId: newRoomResponsibleId || undefined
      });
      setEditingRoom(null);
      await refreshRooms();
    } catch (error) {
      // Handled
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      await refreshRooms();
      await refreshReservations();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleApprove = async (id: string) => {
    await approveReservation(id);
    await refreshRooms();
    await refreshReservations();
  };

  const handleReject = async (id: string) => {
    await rejectReservation(id);
    await refreshRooms();
    await refreshReservations();
  };

  const handleEditReservation = (reservation: MeetingReservation) => {
    setEditingReservation(reservation);
  };

  const handleUpdateReservation = async (id: string, data: {
    startTime?: string;
    endTime?: string;
    notes?: string;
  }) => {
    await updateReservation(id, data);
    await refreshRooms();
    await refreshReservations();
    setEditingReservation(null);
  };

  const handleDeleteReservation = async (id: string) => {
    await deleteReservation(id);
    await refreshRooms();
    await refreshReservations();
  };

  // Get reservations for a room
  const getRoomReservations = useCallback((roomId: string) => {
    return reservations.filter(r => r.roomId === roomId);
  }, [reservations]);

  // Filter rooms
  const filteredRooms = useMemo(() => {
    let filtered = rooms;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(query) ||
        room.location.toLowerCase().includes(query) ||
        room.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [rooms, searchQuery, getRoomReservations]);

  // Handle room card click
  const handleRoomClick = (room: MeetingRoom) => {
    setSelectedRoom(room);
  };

  // Check if room is available now
  const isRoomAvailable = (room: MeetingRoom) => {
    const now = new Date();
    const roomReservations = getRoomReservations(room.id);
    const active = roomReservations.find((r) => {
      if (r.status !== 'approved') return false;
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);
      return start <= now && end >= now;
    });
    return !active;
  };

  // Get user's reservations
  const userReservations = useMemo(() => {
    if (!user?.id) return [];
    return reservations
      .filter(r => r.requestedBy === user.id)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [reservations, user?.id]);


  if (loading) {
    return (
      <div className="flex-1 bg-dashboard-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span className="truncate">Toplantı Odaları</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Odaları görüntüleyin ve rezervasyon yapın
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <Button
              onClick={() => setShowReservationForm(true)}
              className="flex-1 sm:flex-initial"
            >
              <CalendarIcon className="w-4 h-4 mr-2 shrink-0" />
              <span className="hidden sm:inline">Rezervasyon Oluştur</span>
              <span className="sm:hidden">Rezervasyon</span>
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => setShowCreateRoomDialog(true)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Oda Ekle</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Oda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>


        {/* Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRooms.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz toplantı odası bulunmamaktadır'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRooms.map((room) => {
              const roomReservations = getRoomReservations(room.id);
              const available = isRoomAvailable(room);
              const upcomingCount = roomReservations.filter(r => {
                if (r.status !== 'approved') return false;
                return new Date(r.startTime) >= new Date();
              }).length;

              return (
                <Card
                  key={room.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col h-full"
                  onClick={() => handleRoomClick(room)}
                >
                  <CardContent className="p-4 sm:p-6 flex flex-col flex-1">
                    <div className="flex flex-col flex-1 min-h-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold mb-2 truncate">{room.name}</h3>
                          <Badge
                            variant={available ? 'default' : 'secondary'}
                            className={cn(
                              "text-xs",
                              available ? 'bg-green-500 hover:bg-green-600' : ''
                            )}
                          >
                            {available ? 'Müsait' : 'Dolu'}
                          </Badge>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditRoomClick(room)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive shrink-0 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Odayı Sil</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bu odayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>İptal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRoom(room.id)}>
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-2 mb-4 flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="truncate">{room.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 shrink-0" />
                          <span>{room.capacity} kişi</span>
                        </div>
                        {room.responsible && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Sorumlu: {room.responsible.firstName} {room.responsible.lastName}</span>
                          </div>
                        )}
                        {upcomingCount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="w-4 h-4 shrink-0" />
                            <span>{upcomingCount} yaklaşan rezervasyon</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="flex-1 min-h-0 mb-4">
                        {room.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                        ) : (
                          <div className="h-10"></div>
                        )}
                      </div>

                      {/* Action Button - Always at bottom */}
                      <Button
                        className="w-full mt-auto shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReserveClick(room.id);
                        }}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Rezervasyon Oluştur</span>
                        <span className="sm:hidden">Rezervasyon</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* User Reservations Section */}
        {
          userReservations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Rezervasyonlarım</span>
              </h2>

              <Tabs defaultValue="approved" className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
                  <TabsTrigger value="approved">Onaylanan</TabsTrigger>
                  <TabsTrigger value="pending">Bekleyen</TabsTrigger>
                  <TabsTrigger value="history">Geçmiş</TabsTrigger>
                </TabsList>

                {['approved', 'pending', 'history'].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userReservations.filter(r => {
                        const isPastRes = isPast(new Date(r.endTime));
                        if (tab === 'history') return isPastRes || r.status === 'rejected';
                        if (tab === 'approved') return !isPastRes && r.status === 'approved';
                        if (tab === 'pending') return !isPastRes && r.status === 'pending';
                        return false;
                      }).map((reservation) => {
                        const room = rooms.find(r => r.id === reservation.roomId);
                        const startDate = new Date(reservation.startTime);
                        const endDate = new Date(reservation.endTime);

                        return (
                          <Card
                            key={reservation.id}
                            className="cursor-pointer hover:shadow-md transition-all"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm sm:text-base truncate">
                                      {room?.name || 'Bilinmeyen Oda'}
                                    </h3>
                                    <div className="mt-1">
                                      {reservation.status === 'approved' && (
                                        <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          Onaylandı
                                        </Badge>
                                      )}
                                      {reservation.status === 'pending' && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Clock className="w-3 h-3 mr-1" />
                                          Bekliyor
                                        </Badge>
                                      )}
                                      {reservation.status === 'rejected' && (
                                        <Badge variant="destructive" className="text-xs">
                                          <XCircle className="w-3 h-3 mr-1" />
                                          Reddedildi
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="font-medium">
                                      {format(startDate, "d MMMM yyyy", { locale: tr })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 shrink-0" />
                                    <span>
                                      {format(startDate, "HH:mm", { locale: tr })} - {format(endDate, "HH:mm", { locale: tr })}
                                    </span>
                                  </div>
                                  {room && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <MapPin className="w-4 h-4 shrink-0" />
                                      <span className="truncate">{room.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                      {userReservations.filter(r => {
                        const isPastRes = isPast(new Date(r.endTime));
                        if (tab === 'history') return isPastRes || r.status === 'rejected';
                        if (tab === 'approved') return !isPastRes && r.status === 'approved';
                        if (tab === 'pending') return !isPastRes && r.status === 'pending';
                        return false;
                      }).length === 0 && (
                          <p className="text-muted-foreground text-sm col-span-full py-4 text-center">
                            Bu kategoride rezervasyon bulunmuyor.
                          </p>
                        )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )
        }

        {/* Reservation Form */}
        <ReservationForm
          open={showReservationForm}
          onOpenChange={setShowReservationForm}
          rooms={rooms}
          onSubmit={handleCreateReservation}
          selectedRoomId={selectedRoomId}
        />

        {/* Room Detail Dialog */}
        {
          selectedRoom && (
            <RoomDetailDialog
              open={!!selectedRoom}
              onOpenChange={(open) => !open && setSelectedRoom(null)}
              room={selectedRoom}
              reservations={getRoomReservations(selectedRoom.id)}
              onReserve={handleReserveClick}
              onEdit={handleEditReservation}
              onDelete={handleDeleteReservation}
              onApprove={canApprove ? handleApprove : undefined}
              onReject={canApprove ? handleReject : undefined}
              canApprove={canApprove}
              isAdmin={isAdmin}
              currentUserId={user?.id}
            />
          )
        }

        {/* Reservation Edit Dialog */}
        {
          editingReservation && (
            <ReservationEditDialog
              open={!!editingReservation}
              onOpenChange={(open) => !open && setEditingReservation(null)}
              reservation={editingReservation}
              rooms={rooms}
              onSubmit={handleUpdateReservation}
            />
          )
        }

        {/* Reservation Detail Dialog */}
        {
          selectedReservation && (
            <ReservationDetailDialog
              open={!!selectedReservation}
              onOpenChange={(open) => !open && setSelectedReservation(null)}
              reservation={selectedReservation}
              room={rooms.find(r => r.id === selectedReservation.roomId)}
              onEdit={handleEditReservation}
              onDelete={handleDeleteReservation}
              onApprove={canApprove ? handleApprove : undefined}
              onReject={canApprove ? handleReject : undefined}
              canApprove={canApprove}
              isAdmin={isAdmin}
              currentUserId={user?.id}
            />
          )
        }

        {/* Create Room Dialog */}
        {
          isAdmin && (
            <Dialog open={showCreateRoomDialog} onOpenChange={setShowCreateRoomDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Toplantı Odası</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomName">Oda Adı *</Label>
                    <Input
                      id="roomName"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Örn: Toplantı Odası A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomCapacity">Kapasite *</Label>
                    <Input
                      id="roomCapacity"
                      type="number"
                      min="1"
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(e.target.value)}
                      placeholder="Örn: 10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomLocation">Konum *</Label>
                    <Input
                      id="roomLocation"
                      value={newRoomLocation}
                      onChange={(e) => setNewRoomLocation(e.target.value)}
                      placeholder="Örn: 3. Kat, Binası"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomDescription">Açıklama</Label>
                    <Textarea
                      id="roomDescription"
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="Oda hakkında açıklama..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roomResponsible">Sorumlu Kişi</Label>
                    <select
                      id="roomResponsible"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newRoomResponsibleId}
                      onChange={(e) => setNewRoomResponsibleId(e.target.value)}
                    >
                      <option value="">Seçiniz...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateRoomDialog(false)}>
                    İptal
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={!newRoomName || !newRoomCapacity || !newRoomLocation || creatingRoom}
                  >
                    {creatingRoom ? 'Oluşturuluyor...' : 'Oluştur'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }

        {/* Edit Room Dialog */}
        {
          editingRoom && (
            <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Odayı Düzenle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="editRoomName">Oda Adı *</Label>
                    <Input
                      id="editRoomName"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRoomCapacity">Kapasite *</Label>
                    <Input
                      id="editRoomCapacity"
                      type="number"
                      min="1"
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRoomLocation">Konum *</Label>
                    <Input
                      id="editRoomLocation"
                      value={newRoomLocation}
                      onChange={(e) => setNewRoomLocation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRoomDescription">Açıklama</Label>
                    <Textarea
                      id="editRoomDescription"
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editRoomResponsible">Sorumlu Kişi</Label>
                    <select
                      id="editRoomResponsible"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newRoomResponsibleId}
                      onChange={(e) => setNewRoomResponsibleId(e.target.value)}
                    >
                      <option value="">Seçiniz...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingRoom(null)}>
                    İptal
                  </Button>
                  <Button
                    onClick={handleUpdateRoom}
                    disabled={!newRoomName || !newRoomCapacity || !newRoomLocation || creatingRoom}
                  >
                    {creatingRoom ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        }
      </div >
    </div >
  );
}
