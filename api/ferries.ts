import { readDb, writeDb } from './_db';

export default function handler(req: any, res: any) {
  const db = readDb();

  if (req.method === 'GET') {
    return res.status(200).json(db.ferries);
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { ferryId, action } = body;

    const ferry = db.ferries.find((f) => f.id === ferryId);
    if (!ferry) {
      return res.status(404).json({ error: `Ferry ${ferryId} not found in JSON store` });
    }

    if (action === 'boost') {
      ferry.batterySoC = Math.min(100, ferry.batterySoC + 15);
    } else if (body.batterySoC !== undefined) {
      ferry.batterySoC = Number(body.batterySoC);
    }

    writeDb(db);

    return res.status(200).json({
      success: true,
      ferry,
      message: `Ferry ${ferry.id} updated in JSON store`,
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
