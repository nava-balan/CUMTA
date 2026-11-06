import { readDb, writeDb, BookedTicket } from './_db';

export default function handler(req: any, res: any) {
  const db = readDb();

  if (req.method === 'GET') {
    return res.status(200).json(db.tickets);
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const ticketCounter = db.tickets.length + 1045;
    const ticketId = `WL-TKT-${ticketCounter}`;

    const newTicket: BookedTicket = {
      id: ticketId,
      routeId: body.routeId || 1,
      routeName: body.routeName || 'Adyar River Corridor',
      fromStation: body.fromStation || 'Saidapet',
      toStation: body.toStation || 'Srinivasapuram / Boat Club',
      departureTime: body.departureTime || '12:00',
      passengerName: body.passengerName || 'Citizen Commuter',
      passengerCount: Number(body.passengerCount) || 1,
      vesselClass: body.vesselClass || 'Eco-Catamaran',
      baseFare: Number(body.baseFare) || 45,
      pointsDiscount: Number(body.pointsDiscount) || 0,
      fare: Number(body.fare) || 45,
      bookedAt: new Date().toISOString(),
      qrCode: `CHN360::${ticketId}::VALID`,
      status: 'confirmed',
    };

    db.tickets.unshift(newTicket);
    db.totalRevenue += newTicket.fare;
    db.totalPassengers += newTicket.passengerCount;
    if (newTicket.pointsDiscount > 0) {
      db.civicPoints = Math.max(0, db.civicPoints - newTicket.pointsDiscount);
    }

    writeDb(db);

    return res.status(201).json({
      success: true,
      ticket: newTicket,
      totalRevenue: db.totalRevenue,
      totalPassengers: db.totalPassengers,
      civicPoints: db.civicPoints,
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
