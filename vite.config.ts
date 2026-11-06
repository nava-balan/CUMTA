import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

function jsonBackendPlugin(): Plugin {
  return {
    name: 'json-backend-dev-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const dbPath = path.resolve(__dirname, 'api/data/db.json');
        const readDb = () => {
          try {
            return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
          } catch {
            return {};
          }
        };
        const writeDb = (data: any) => {
          try {
            fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
          } catch (e) {
            console.error('[DEV DB] Write error:', e);
          }
        };

        const parsedUrl = new URL(req.url, 'http://localhost');
        const pathname = parsedUrl.pathname;

        res.setHeader('Content-Type', 'application/json');

        if (pathname === '/api/health') {
          res.statusCode = 200;
          return res.end(JSON.stringify({ status: 'online', storage: 'JSON File Database' }));
        }

        if (pathname === '/api/data' && req.method === 'GET') {
          res.statusCode = 200;
          return res.end(JSON.stringify(readDb()));
        }

        if (pathname === '/api/tickets') {
          const db = readDb();
          if (req.method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify(db.tickets || []));
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => (body += chunk));
            req.on('end', () => {
              try {
                const payload = JSON.parse(body || '{}');
                const ticketId = `WL-TKT-${(db.tickets?.length || 0) + 1045}`;
                const newTicket = {
                  id: ticketId,
                  ...payload,
                  bookedAt: new Date().toISOString(),
                  qrCode: `CHN360::${ticketId}::VALID`,
                  status: 'confirmed',
                };
                db.tickets = [newTicket, ...(db.tickets || [])];
                db.totalRevenue = (db.totalRevenue || 0) + (Number(newTicket.fare) || 0);
                db.totalPassengers = (db.totalPassengers || 0) + (Number(newTicket.passengerCount) || 1);
                if (newTicket.pointsDiscount > 0) {
                  db.civicPoints = Math.max(0, (db.civicPoints || 0) - newTicket.pointsDiscount);
                }
                writeDb(db);
                res.statusCode = 201;
                return res.end(JSON.stringify({ success: true, ticket: newTicket }));
              } catch (e: any) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
        }

        if (pathname === '/api/hazards') {
          const db = readDb();
          if (req.method === 'GET') {
            res.statusCode = 200;
            return res.end(JSON.stringify(db.hazardReports || []));
          }
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => (body += chunk));
            req.on('end', () => {
              try {
                const payload = JSON.parse(body || '{}');
                const hazardId = `HZR-${(db.hazardReports?.length || 0) + 721}`;
                const newReport = {
                  id: hazardId,
                  ...payload,
                  upvotes: 1,
                  duplicateCount: 0,
                  verificationStatus: 'pending-ai',
                  reportedAt: new Date().toISOString(),
                };
                db.hazardReports = [newReport, ...(db.hazardReports || [])];
                writeDb(db);
                res.statusCode = 201;
                return res.end(JSON.stringify({ deduplicated: false, report: newReport }));
              } catch (e: any) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
          if (req.method === 'PATCH') {
            let body = '';
            req.on('data', (chunk: any) => (body += chunk));
            req.on('end', () => {
              try {
                const payload = JSON.parse(body || '{}');
                const report = db.hazardReports?.find((r: any) => r.id === payload.reportId);
                if (report) {
                  if (payload.action === 'verify') {
                    report.verificationStatus = 'verified';
                    db.civicPoints = (db.civicPoints || 0) + 100;
                  } else if (payload.action === 'escalate') {
                    report.severity = payload.newSeverity || report.severity;
                    report.duplicateCount = (report.duplicateCount || 0) + 1;
                  }
                  writeDb(db);
                }
                res.statusCode = 200;
                return res.end(JSON.stringify({ success: true, report }));
              } catch (e: any) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
        }

        if (pathname === '/api/ferries' && req.method === 'GET') {
          const db = readDb();
          res.statusCode = 200;
          return res.end(JSON.stringify(db.ferries || []));
        }

        if (pathname === '/api/stats' && req.method === 'GET') {
          const db = readDb();
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              totalRevenue: db.totalRevenue,
              totalPassengers: db.totalPassengers,
              daysInOperation: db.daysInOperation,
              civicPoints: db.civicPoints,
            })
          );
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), jsonBackendPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
