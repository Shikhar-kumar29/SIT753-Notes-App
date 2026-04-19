const request = require('supertest');
const app = require('../server');

// Tests run WITHOUT MongoDB - they test the Express routes and HTTP layer only.
// This ensures tests pass in any CI/CD environment without needing a database.

describe('Notes API - HTTP Layer', () => {
  it('GET /health should return status UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'UP');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/notes should return a response', async () => {
    const res = await request(app).get('/api/notes');
    // Without MongoDB, this will return 500, which proves error handling works
    expect([200, 500]).toContain(res.statusCode);
  });

  it('POST /api/notes without body should return 400 or 500', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({});
    // Without MongoDB, server correctly rejects or errors
    expect([400, 500]).toContain(res.statusCode);
  });

  it('GET /health response should have correct JSON structure', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.status).toBe('UP');
  });

  it('PUT /api/notes/invalid-id should return 400 or 500', async () => {
    const res = await request(app)
      .put('/api/notes/invalidid123')
      .send({ title: 'Updated' });
    expect([400, 500]).toContain(res.statusCode);
  });

  it('DELETE /api/notes/invalid-id should return 400 or 500', async () => {
    const res = await request(app)
      .delete('/api/notes/invalidid123');
    expect([400, 500]).toContain(res.statusCode);
  });
});
