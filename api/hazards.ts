import { readDb, writeDb, HazardReport, getHaversineDistanceMeters } from './_db';

export default function handler(req: any, res: any) {
  const db = readDb();

  if (req.method === 'GET') {
    return res.status(200).json(db.hazardReports);
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { category, severity, lat, lng, description, imageUrl, reporterName, gccZone } = body;

    const reportLat = Number(lat) || 13.0213;
    const reportLng = Number(lng) || 80.2231;

    // Backend 50-Meter Spatial De-Duplication on JSON dataset
    const duplicateMatch = db.hazardReports.find((r) => {
      if (r.category !== category) return false;
      const dist = getHaversineDistanceMeters(reportLat, reportLng, r.lat, r.lng);
      return dist <= 50; // Strict 50m threshold
    });

    if (duplicateMatch) {
      const nextSeverity: 'low' | 'medium' | 'high' | 'critical' =
        duplicateMatch.severity === 'low'
          ? 'medium'
          : duplicateMatch.severity === 'medium'
          ? 'high'
          : 'critical';

      duplicateMatch.severity = nextSeverity;
      duplicateMatch.duplicateCount += 1;
      duplicateMatch.upvotes += 1;

      writeDb(db);

      return res.status(200).json({
        deduplicated: true,
        message: 'Spatial de-duplication match found within 50 meters. Escalated severity in JSON record.',
        report: duplicateMatch,
      });
    }

    const hazardCounter = db.hazardReports.length + 720;
    const fixHours = severity === 'critical' ? 4 : severity === 'high' ? 12 : 24;

    const newReport: HazardReport = {
      id: `HZR-${hazardCounter}`,
      category: category || 'potholes',
      severity: severity || 'high',
      lat: reportLat,
      lng: reportLng,
      description: description || 'Reported civic issue',
      imageUrl: imageUrl || '',
      reporterName: reporterName || 'Civic Contributor',
      reportedAt: new Date().toISOString(),
      gccZone: gccZone || 'Zone 9 - Teynampet',
      upvotes: 1,
      duplicateCount: 0,
      aiConfidence: 96.8,
      verificationStatus: 'pending-ai',
      assignedWard: `Ward ${Math.floor(110 + Math.random() * 40)}`,
      estimatedFixHours: fixHours,
      rewardPoints: severity === 'critical' ? 50 : 25,
    };

    db.hazardReports.unshift(newReport);
    writeDb(db);

    return res.status(201).json({
      deduplicated: false,
      message: 'New hazard report registered in JSON database.',
      report: newReport,
    });
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { reportId, action, status, newSeverity } = body;

    const report = db.hazardReports.find((r) => r.id === reportId);
    if (!report) {
      return res.status(404).json({ error: `Report ${reportId} not found in JSON store` });
    }

    let awardedPoints = 0;

    if (action === 'verify' || status === 'verified') {
      if (report.verificationStatus !== 'verified') {
        report.verificationStatus = 'verified';
        awardedPoints = 100;
        db.civicPoints += awardedPoints;
      }
    } else if (action === 'upvote') {
      report.upvotes += 1;
      awardedPoints = 5;
      db.civicPoints += awardedPoints;
    } else if (action === 'escalate' && newSeverity) {
      report.severity = newSeverity;
      report.duplicateCount += 1;
      report.upvotes += 1;
    }

    writeDb(db);

    return res.status(200).json({
      success: true,
      report,
      civicPoints: db.civicPoints,
      awardedPoints,
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
