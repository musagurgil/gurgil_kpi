const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const notifs = await prisma.notification.findMany({
    where: { link: { in: ['/kpi', '/tickets', '/meeting-rooms'] } }
  });

  let updatedCount = 0;

  for (const n of notifs) {
    if (n.category === 'kpi') {
      let kpiTitle = '';
      if (n.title.startsWith('🚨 KPI Süresi Doldu: ')) kpiTitle = n.title.replace('🚨 KPI Süresi Doldu: ', '');
      else if (n.title.startsWith('📊 Yeni KPI Ataması: ')) kpiTitle = n.title.replace('📊 Yeni KPI Ataması: ', '');
      else if (n.title.startsWith('🎉 KPI Tamamlandı: ')) kpiTitle = n.title.replace('🎉 KPI Tamamlandı: ', '');
      else if (n.title.startsWith('📈 KPI İlerlemesi: ')) kpiTitle = n.title.replace('📈 KPI İlerlemesi: ', '');
      else if (n.title.startsWith('⏰ KPI Deadline Yaklaşıyor: ')) kpiTitle = n.title.replace('⏰ KPI Deadline Yaklaşıyor: ', '');

      if (kpiTitle) {
        const kpi = await prisma.kPITarget.findFirst({ where: { title: kpiTitle } });
        if (kpi) {
          await prisma.notification.update({ where: { id: n.id }, data: { link: `/kpi#${kpi.id}` } });
          updatedCount++;
        }
      }
    } else if (n.category === 'ticket') {
      // Tickets title parsing
      // e.g. "🎫 Ticket Durumu Güncellendi: PC Bozuldu" or "📨 Yeni Ticket: TCK-123"
      let ticketId = null;
      if (n.title.startsWith('🎫 Ticket Durumu Güncellendi: ')) {
        const title = n.title.replace('🎫 Ticket Durumu Güncellendi: ', '');
        const ticket = await prisma.ticket.findFirst({ where: { title } });
        if (ticket) ticketId = ticket.id;
      } else if (n.title.startsWith('📨 Yeni Ticket: ')) {
        const ticketIdMatches = n.message.match(/Yeni Ticket: (.*?)$/); // no this won't work easily
        // but wait, message contains the title or priority. Let's just lookup by finding any ticket assigned to this user that fits.
      }
    }
  }
  console.log(`Updated ${updatedCount} old KPI notifications`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
