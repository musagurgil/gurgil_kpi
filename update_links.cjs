const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const notifs = await prisma.notification.findMany({
    where: { link: { in: ['/kpi', '/tickets', '/meeting-rooms'] } }
  });

  let updatedKpi = 0;

  for (const n of notifs) {
    if (n.category === 'kpi' && n.link === '/kpi') {
      let kpiTitle = '';
      if (n.title.startsWith('🚨 KPI Süresi Doldu: ')) kpiTitle = n.title.replace('🚨 KPI Süresi Doldu: ', '');
      else if (n.title.startsWith('�� Yeni KPI Ataması: ')) kpiTitle = n.title.replace('📊 Yeni KPI Ataması: ', '');
      else if (n.title.startsWith('🎉 KPI Tamamlandı: ')) kpiTitle = n.title.replace('🎉 KPI Tamamlandı: ', '');
      else if (n.title.startsWith('📈 KPI İlerlemesi: ')) kpiTitle = n.title.replace('📈 KPI İlerlemesi: ', '');
      else if (n.title.startsWith('⏰ KPI Deadline Yaklaşıyor: ')) kpiTitle = n.title.replace('⏰ KPI Deadline Yaklaşıyor: ', '');

      if (kpiTitle) {
        const kpi = await prisma.kpiTarget.findFirst({ where: { title: kpiTitle } });
        if (kpi) {
          await prisma.notification.update({ where: { id: n.id }, data: { link: `/kpi#${kpi.id}` } });
          updatedKpi++;
        }
      }
    }
  }
  console.log(`Updated ${updatedKpi} old KPI notifications`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
