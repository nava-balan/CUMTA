import { readDb } from './_db';

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const db = readDb();
    const verifiedHazards = db.hazardReports.filter((r) => r.verificationStatus === 'verified').length;

    return res.status(200).json({
      totalRevenue: db.totalRevenue,
      totalPassengers: db.totalPassengers,
      daysInOperation: db.daysInOperation,
      civicPoints: db.civicPoints,
      totalTickets: db.tickets.length,
      totalHazards: db.hazardReports.length,
      verifiedHazards,
      activeFerries: db.ferries.length,
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
