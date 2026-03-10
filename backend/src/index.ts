
import express from 'express';
const app = express();

import { verifyToken } from '../shared/jwtAuth';
import { Request, Response, NextFunction } from 'express';

function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (user) {
      req.user = user;
      return next();
    }
  }
  res.sendStatus(401);
}

// Example: protect an API route
app.get('/api/secure-data', authenticateJWT, async (req, res) => {
  res.json({ data: 'Secure data for Ohio Website', user: req.user });
});
