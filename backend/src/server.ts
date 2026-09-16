// =========================================================================
// INTERVIEW GUIDE: server.ts - The Ignition Switch (Engine Starter)
// Yeh file hamare backend ki entry point hai jahan actually app start hota hai.
// Yahan "Clustering" use ki gayi hai jo is project ko Production-Ready banati hai.
// =========================================================================

import 'dotenv/config';
import cluster from 'cluster';
import os from 'os';
import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { initSocketIOServer } from './realtime/socket.server';

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;
const isClusterEnabled = process.env.NODE_ENV === 'production' && process.env.DISABLE_CLUSTER !== 'true';

if (isClusterEnabled && cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking server across ${numCPUs} CPU cores for load balancing...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`Worker process ${worker.process.pid} died (Code: ${code}). Restarting...`);
    cluster.fork();
  });

} else {
  connectDB()
    .then(() => {
      const httpServer = http.createServer(app);
      initSocketIOServer(httpServer);

      httpServer.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`🚀 HTTP & Socket.IO Server listening on 0.0.0.0:${PORT} (PID: ${process.pid})`);
      });
    })
    .catch((error) => {
      console.error(`Process ${process.pid} - MongoDB connection error:`, error);
      process.exit(1);
    });
}

