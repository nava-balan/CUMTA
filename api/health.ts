export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'online',
    system: 'CHENNAI 360 CUMTA JSON Backend Engine',
    storage: 'JSON File Database',
    timestamp: new Date().toISOString(),
  });
}
