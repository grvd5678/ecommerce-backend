import { app } from './setup.js';
import request from 'supertest';

describe('ShopHub API Integration Suite', () => {
  test('GET /health should return 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET / should return running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('E-Commerce API is running');
  });

  test('GET /api/products should return product list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products');
  });
});
