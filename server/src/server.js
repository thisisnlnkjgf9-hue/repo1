import app from './app.js';
import { connectMongo } from './config/db.js';
import { PORT } from './config/env.js';
import { seedDatabase } from './data/seed.js';
import { isMongoConnected } from './config/db.js';

export async function startServer() {
  await connectMongo();

  if (isMongoConnected()) {
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`Nouryum API running at http://localhost:${PORT}`);
  });
}
