const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Note = require('../models/Note');

beforeAll(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notes_test_db';
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await Note.deleteMany();
  await mongoose.connection.close();
});

describe('Notes API', () => {
  it('should create a new note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({
        title: 'Test Note',
        content: 'This is a test note content',
        folder: 'General'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'Test Note');
  });

  it('should fetch all notes', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
