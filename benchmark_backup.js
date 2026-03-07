import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, 'test_data.json');

// Generate some dummy data
const data = {
  departments: Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Dept ${i}` })),
  profiles: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `User ${i}` })),
  tickets: Array.from({ length: 50000 }, (_, i) => ({ id: i, title: `Ticket ${i}` }))
};
fs.writeFileSync(dataPath, JSON.stringify(data));

async function runBenchmark() {
  console.log('Running Sync Benchmark...');
  let startSync = performance.now();
  for (let i = 0; i < 100; i++) {
    const parsed = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
  let endSync = performance.now();
  console.log(`Sync took: ${endSync - startSync}ms`);

  console.log('Running Async Benchmark...');
  let startAsync = performance.now();
  for (let i = 0; i < 100; i++) {
    const parsed = JSON.parse(await fs.promises.readFile(dataPath, 'utf8'));
  }
  let endAsync = performance.now();
  console.log(`Async took: ${endAsync - startAsync}ms`);

  fs.unlinkSync(dataPath);
}

runBenchmark();
