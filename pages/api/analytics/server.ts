import type { NextApiRequest, NextApiResponse } from 'next';
import os from 'os';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.status(200).json({
      host: os.hostname(),
      port: process.env.PORT || 4000,
      uptime: `${Math.floor(process.uptime() / 3600)} hours`,
      requestsServed: 1234,
      activeSessions: 8,
      cpuUsage: Math.round(os.loadavg()[0] * 10),
      memoryUsage: Math.round(os.totalmem() / 1024 / 1024),
      diskUsage: 40,
      endpoints: ['/api/sales/update', '/api/users/list', '/api/analytics/health'],
      errorLogs: [
        '[2026-03-10 14:22] Database connection timeout',
        '[2026-03-10 13:55] API rate limit exceeded',
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'Server stats error.' });
  }
}
