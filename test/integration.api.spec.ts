import request from 'supertest';
import expressApp from '../backend/server';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config({ path: require('path').resolve(__dirname, '../backend/.env.test') });

let server;
beforeAll((done) => {
  server = http.createServer(expressApp);
  server.listen(() => done());
});

afterAll((done) => {
  server.close(done);
});

describe('Ohio Sales API Integration', () => {
  it('should reject missing JWT/HMAC', async () => {
    const res = await request(server)
      .post('/api/sales/update')
      .send({ saleId: 1, amount: 100, customerId: 2, sale_date: '2026-03-09', status: 'completed', notes: 'Test sale' });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Missing JWT|Missing HMAC/);
  });
  // Add more tests for valid JWT/HMAC, DB errors, etc.
});

describe('Mautic API Integration', () => {
  it('should reject missing JWT/HMAC', async () => {
    const res = await request(server)
      .post('/api/mautic/campaign/edit')
      .send({ id: 1, payload: { name: 'Test Campaign' } });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Missing JWT|Missing HMAC/);
  });
  // Add more tests for valid JWT/HMAC, error handling, etc.
});
