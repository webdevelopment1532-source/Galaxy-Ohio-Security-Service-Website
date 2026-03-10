// Mautic API Express handler
import { Router } from 'express';
import { verifyJwt, verifyHmac } from '../auth/middleware';
import { editCampaign, deleteCampaign, deployCampaign, searchContacts } from '../mautic/mauticApi';

const router = Router();

router.post('/campaign/edit', verifyJwt, verifyHmac, async (req, res) => {
  try {
    const { id, payload } = req.body;
    const result = await editCampaign(id, payload);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Mautic edit error.' });
  }
});

router.delete('/campaign/delete', verifyJwt, verifyHmac, async (req, res) => {
  try {
    const { id } = req.body;
    const result = await deleteCampaign(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Mautic delete error.' });
  }
});

router.post('/campaign/deploy', verifyJwt, verifyHmac, async (req, res) => {
  try {
    const { id } = req.body;
    const result = await deployCampaign(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Mautic deploy error.' });
  }
});

router.get('/contacts/search', verifyJwt, verifyHmac, async (req, res) => {
  try {
    const queryParam = req.query.query;
    const queryStr = typeof queryParam === 'string' ? queryParam : '';
    const result = await searchContacts(queryStr);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Mautic search error.' });
  }
});

export default router;
