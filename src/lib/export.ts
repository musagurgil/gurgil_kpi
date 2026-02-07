import { KPIStats } from '@/types/kpi';
import { Ticket } from '@/types/ticket';
import { Activity } from '@/types/calendar';

/**
 * KPI verilerini CSV formatına çevir ve indir
 */
export function exportKPIsToCSV(kpis: KPIStats[], filename: string = 'kpi-raporu') {
  if (!kpis || kpis.length === 0) {
    throw new Error('Export edilecek KPI bulunamadı');
  }

  // CSV başlıkları
  const headers = [
    'KPI Başlığı',
    'Departman',
    'Dönem',
    'Öncelik',
    'Hedef Değer',
    'Mevcut Değer',
    'Birim',
    'İlerleme (%)',
    'Durum',
    'Başlangıç Tarihi',
    'Bitiş Tarihi',
    'Kalan Gün',
    'Günlük Hız',
    'Açıklama'
  ].join(',');

  // CSV satırları
  const rows = kpis.map(kpi => [
    `"${kpi.title || ''}"`,
    `"${kpi.department || ''}"`,
    `"${kpi.period || ''}"`,
    `"${kpi.priority || ''}"`,
    kpi.targetValue || 0,
    kpi.currentValue || 0,
    `"${kpi.unit || ''}"`,
    (kpi.progressPercentage || 0).toFixed(2),
    `"${kpi.status || ''}"`,
    kpi.startDate || '',
    kpi.endDate || '',
    kpi.remainingDays || 0,
    (kpi.velocity || 0).toFixed(2),
    `"${(kpi.description || '').replace(/"/g, '""')}"` // Escape double quotes
  ].join(','));

  // CSV içeriği oluştur
  const csvContent = [headers, ...rows].join('\n');

  // BOM (Byte Order Mark) ekle - Excel Türkçe karakterler için gerekli
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // İndirme linkini oluştur ve tetikle
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${date}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Tek bir KPI'ın detaylı raporunu CSV olarak export et
 */
export function exportKPIDetailToCSV(kpi: KPIStats, filename?: string) {
  const name = filename || `kpi-${kpi.title.toLowerCase().replace(/\s+/g, '-')}`;

  // KPI genel bilgileri
  const generalInfo = [
    ['KPI Detay Raporu'],
    [''],
    ['Genel Bilgiler'],
    ['Başlık', kpi.title],
    ['Departman', kpi.department],
    ['Dönem', kpi.period],
    ['Öncelik', kpi.priority],
    ['Durum', kpi.status],
    [''],
    ['Hedef Bilgileri'],
    ['Hedef Değer', kpi.targetValue],
    ['Mevcut Değer', kpi.currentValue],
    ['Birim', kpi.unit],
    ['İlerleme Yüzdesi', `${(kpi.progressPercentage || 0).toFixed(2)}%`],
    [''],
    ['Zaman Bilgileri'],
    ['Başlangıç Tarihi', kpi.startDate],
    ['Bitiş Tarihi', kpi.endDate],
    ['Kalan Gün', kpi.remainingDays],
    ['Günlük Hız', `${(kpi.velocity || 0).toFixed(2)} ${kpi.unit}/gün`],
    [''],
    ['İlerleme Kayıtları'],
    ['Tarih', 'Değer', 'Kaydeden', 'Not']
  ];

  // İlerleme kayıtları
  const progressRows = (kpi.recentProgress || []).map(p => [
    new Date(p.recordedAt).toLocaleString('tr-TR'),
    p.value,
    p.recordedByName || p.recordedBy,
    `"${(p.note || '').replace(/"/g, '""')}"`
  ]);

  // Yorumlar
  const commentSection = [
    [''],
    ['Yorumlar'],
    ['Tarih', 'Kullanıcı', 'Yorum']
  ];

  const commentRows = (kpi.comments || []).map(c => [
    new Date(c.createdAt).toLocaleString('tr-TR'),
    c.userName,
    `"${c.content.replace(/"/g, '""')}"`
  ]);

  // Tüm satırları birleştir
  const allRows = [
    ...generalInfo,
    ...progressRows,
    ...commentSection,
    ...commentRows
  ];

  // CSV içeriği
  const csvContent = allRows.map(row => row.join(',')).join('\n');

  // BOM ekle ve indir
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${name}-${date}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * KPI raporunu JSON olarak export et
 */
export function exportKPIToJSON(kpi: KPIStats, filename?: string) {
  const name = filename || `kpi-${kpi.title.toLowerCase().replace(/\s+/g, '-')}`;

  const data = JSON.stringify(kpi, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${name}-${date}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Ticket verilerini CSV formatına çevir ve indir
 */
export function exportTicketsToCSV(tickets: Ticket[], filename: string = 'ticket-raporu') {
  if (!tickets || tickets.length === 0) {
    throw new Error('Export edilecek ticket bulunamadı');
  }

  // CSV başlıkları
  const headers = [
    'Ticket ID',
    'Başlık',
    'Durum',
    'Öncelik',
    'Kaynak Departman',
    'Hedef Departman',
    'Oluşturan',
    'Atanan',
    'Oluşturulma Tarihi',
    'Son Güncelleme',
    'Yorum Sayısı',
    'Açıklama'
  ].join(',');

  // CSV satırları
  const rows = tickets.map(ticket => [
    `"${ticket.id || ''}"`,
    `"${(ticket.title || '').replace(/"/g, '""')}"`,
    `"${ticket.status || ''}"`,
    `"${ticket.priority || ''}"`,
    `"${ticket.sourceDepartment || ''}"`,
    `"${ticket.targetDepartment || ''}"`,
    `"${ticket.creatorName || ''}"`,
    `"${ticket.assignedTo || 'Atanmamış'}"`,
    new Date(ticket.createdAt).toLocaleString('tr-TR'),
    new Date(ticket.updatedAt).toLocaleString('tr-TR'),
    ticket.comments?.length || 0,
    `"${(ticket.description || '').replace(/"/g, '""').substring(0, 100)}..."`
  ].join(','));

  // CSV içeriği oluştur
  const csvContent = [headers, ...rows].join('\n');

  // BOM ekle ve indir
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${date}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Tek bir ticket'ın detaylı raporunu CSV olarak export et
 */
export function exportTicketDetailToCSV(ticket: Ticket, filename?: string) {
  const name = filename || `ticket-${ticket.id}`;

  // Ticket genel bilgileri
  const generalInfo = [
    ['Ticket Detay Raporu'],
    [''],
    ['Genel Bilgiler'],
    ['Ticket ID', ticket.id],
    ['Başlık', ticket.title],
    ['Durum', ticket.status],
    ['Öncelik', ticket.priority],
    [''],
    ['Departman Bilgileri'],
    ['Kaynak Departman', ticket.sourceDepartment],
    ['Hedef Departman', ticket.targetDepartment],
    [''],
    ['Kullanıcı Bilgileri'],
    ['Oluşturan', ticket.creatorName || 'Bilinmiyor'],
    ['Atanan', ticket.assignedTo || 'Atanmamış'],
    [''],
    ['Zaman Bilgileri'],
    ['Oluşturulma', new Date(ticket.createdAt).toLocaleString('tr-TR')],
    ['Son Güncelleme', new Date(ticket.updatedAt).toLocaleString('tr-TR')],
    [''],
    ['Açıklama'],
    [ticket.description],
    [''],
    ['Yorumlar'],
    ['Tarih', 'Yazar', 'İç Yorum', 'İçerik']
  ];

  // Yorumlar
  const commentRows = (ticket.comments || []).map((c) => [
    new Date(c.createdAt).toLocaleString('tr-TR'),
    c.authorName,
    c.isInternal ? 'Evet' : 'Hayır',
    `"${c.content.replace(/"/g, '""')}"`
  ]);

  // Tüm satırları birleştir
  const allRows = [...generalInfo, ...commentRows];
  const csvContent = allRows.map(row => row.join(',')).join('\n');

  // BOM ekle ve indir
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${name}-${date}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Calendar aktivitelerini CSV formatına çevir ve indir
 */
export function exportActivitiesToCSV(activities: Activity[], filename: string = 'aktivite-raporu') {
  if (!activities || activities.length === 0) {
    throw new Error('Export edilecek aktivite bulunamadı');
  }

  // CSV başlıkları
  const headers = [
    'Tarih',
    'Başlık',
    'Kategori',
    'Başlangıç',
    'Bitiş',
    'Süre (dk)',
    'Süre (saat)',
    'Açıklama'
  ].join(',');

  // CSV satırları
  const rows = activities.map(activity => {
    const duration = activity.duration || 0;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    // Determine category name (mock logic as we don't have categories here)
    // You might want to pass categories too or fetch them
    const categoryName = activity.categoryId;

    return [
      new Date(activity.date).toLocaleDateString('tr-TR'),
      `"${(activity.title || '').replace(/"/g, '""')}"`,
      `"${categoryName}"`,
      activity.startTime?.includes('T')
        ? new Date(activity.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        : activity.startTime || '',
      activity.endTime?.includes('T')
        ? new Date(activity.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        : activity.endTime || '',
      duration,
      `${hours}s ${minutes}dk`,
      `"${(activity.description || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  // CSV içeriği oluştur
  const csvContent = [headers, ...rows].join('\n');

  // BOM ekle ve indir
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${date}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}