import { readDb } from './_db';

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const db = readDb();
    return res.status(200).json(db);
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
