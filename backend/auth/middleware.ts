// JWT and HMAC middleware
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

import { Request, Response, NextFunction } from 'express';

export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing JWT.' });
  try {
    const secret = process.env.OHIO_INTEGRATION_SECRET ?? '';
    jwt.verify(token, secret);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid JWT.' });
  }
}

export function verifyHmac(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-galaxy-signature'];
  const timestamp = req.headers['x-galaxy-timestamp'];
  if (!signature || !timestamp) return res.status(401).json({ error: 'Missing HMAC headers.' });
  const body = JSON.stringify(req.body);
  const secret = process.env.OHIO_INTEGRATION_SECRET ?? '';
  const hmac = crypto.createHmac('sha256', secret).update(timestamp + body).digest('hex');
  if (hmac !== signature) return res.status(401).json({ error: 'Invalid HMAC signature.' });
  next();
}
