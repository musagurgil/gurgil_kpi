import fs from 'fs';
import path from 'path';

const BACKUPS_DIR = path.join(process.cwd(), 'backups');

// Setup mock backups
function setupMocks(numMocks) {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR);
  }
  for (let i = 0; i < numMocks; i++) {
    const dir = path.join(BACKUPS_DIR, `backup_mock_${i}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const metadataPath = path.join(dir, 'metadata.json');
    const metadata = {
      id: `mock_${i}`,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      createdByName: 'Admin',
      totalSize: 1000,
      dbFileSize: 500,
      totalRecords: 100,
      tables: [{ name: 'users', recordCount: 100 }]
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  }
}

// Teardown mock backups
function teardownMocks() {
  const backupDirs = fs.readdirSync(BACKUPS_DIR).filter(d => d.startsWith('backup_mock_'));
  for (const dir of backupDirs) {
    const fullPath = path.join(BACKUPS_DIR, dir);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

// Sync execution
function runSync() {
  const start = process.hrtime.bigint();
  const backupDirs = fs.readdirSync(BACKUPS_DIR)
    .filter(d => d.startsWith('backup_'))
    .filter(d => fs.statSync(path.join(BACKUPS_DIR, d)).isDirectory());

  const backups = [];
  for (const dir of backupDirs) {
    const metadataPath = path.join(BACKUPS_DIR, dir, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        backups.push({
          id: metadata.id,
          createdAt: metadata.createdAt,
          createdBy: metadata.createdBy,
          createdByName: metadata.createdByName,
          totalSize: metadata.totalSize,
          dbFileSize: metadata.dbFileSize,
          totalRecords: metadata.totalRecords,
          tableCount: metadata.tables.length,
          tables: metadata.tables
        });
      } catch (e) {
        console.warn(`[BACKUP] Invalid metadata in ${dir}:`, e.message);
      }
    }
  }
  backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const end = process.hrtime.bigint();
  return Number(end - start) / 1e6; // in milliseconds
}

// Async execution
async function runAsync() {
  const start = process.hrtime.bigint();
  const allDirs = await fs.promises.readdir(BACKUPS_DIR);
  const backupDirsPromises = allDirs
    .filter(d => d.startsWith('backup_'))
    .map(async d => {
       const stat = await fs.promises.stat(path.join(BACKUPS_DIR, d));
       return stat.isDirectory() ? d : null;
    });

  const backupDirsResults = await Promise.all(backupDirsPromises);
  const backupDirs = backupDirsResults.filter(d => d !== null);

  const backupsPromises = backupDirs.map(async (dir) => {
    const metadataPath = path.join(BACKUPS_DIR, dir, 'metadata.json');
    try {
      const data = await fs.promises.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(data);
      return {
        id: metadata.id,
        createdAt: metadata.createdAt,
        createdBy: metadata.createdBy,
        createdByName: metadata.createdByName,
        totalSize: metadata.totalSize,
        dbFileSize: metadata.dbFileSize,
        totalRecords: metadata.totalRecords,
        tableCount: metadata.tables.length,
        tables: metadata.tables
      };
    } catch (e) {
      if (e.code === 'ENOENT') {
         return null;
      }
      console.warn(`[BACKUP] Invalid metadata in ${dir}:`, e.message);
      return null;
    }
  });

  const results = await Promise.all(backupsPromises);
  const backups = results.filter(b => b !== null);
  backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const end = process.hrtime.bigint();
  return Number(end - start) / 1e6; // in milliseconds
}

async function main() {
  const numMocks = 1000;
  console.log(`Setting up ${numMocks} mock backups...`);
  setupMocks(numMocks);

  // Warm up
  for (let i = 0; i < 5; i++) {
    runSync();
    await runAsync();
  }

  console.log('Running Sync Benchmark (100 iterations)...');
  let syncTotal = 0;
  for (let i = 0; i < 100; i++) {
    syncTotal += runSync();
  }
  const syncAvg = syncTotal / 100;
  console.log(`Sync Avg Time: ${syncAvg.toFixed(2)} ms`);

  console.log('Running Async Benchmark (100 iterations)...');
  let asyncTotal = 0;
  for (let i = 0; i < 100; i++) {
    asyncTotal += await runAsync();
  }
  const asyncAvg = asyncTotal / 100;
  console.log(`Async Avg Time: ${asyncAvg.toFixed(2)} ms`);

  console.log(`Performance Improvement: ${((syncAvg - asyncAvg) / syncAvg * 100).toFixed(2)}%`);

  console.log('Tearing down mock backups...');
  teardownMocks();
}

main().catch(console.error);
