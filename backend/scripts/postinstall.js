import { runSeed } from './seed.js';

if (process.env.VERCEL) {
  process.exit(0);
}

try {
  await runSeed({ closeAfter: true });
} catch {
  process.exit(0);
}
