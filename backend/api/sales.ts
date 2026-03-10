// Sales API handler
import { Router } from 'express';
import { verifyJwt, verifyHmac } from '../auth/middleware';
import { query } from '../db';

const router = Router();

router.post('/update', verifyJwt, verifyHmac, async (req, res) => {
  try {
    const { saleId, amount, customerId, sale_date, status, notes } = req.body;
    if (!saleId || !amount || !customerId || !sale_date || !status) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    await query(
      'INSERT INTO sales (saleId, amount, customerId, sale_date, status, notes) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount=?, status=?, notes=?',
      [saleId, amount, customerId, sale_date, status, notes, amount, status, notes]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Sales update error:', err);
    res.status(500).json({ error: 'Database error.' });
  }
});

export default router;
