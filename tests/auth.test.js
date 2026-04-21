const request = require('supertest');
const app = require('../server');
const { sequelize, User } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new fan user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Fan',
          email: 'testfan@test.com',
          password: 'password123',
          role: 'fan'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'testfan@test.com');
      expect(res.body.user).toHaveProperty('role', 'fan');
      expect(res.body.user).not.toHaveProperty('password');
    });
    
    it('should register a new artist user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Artist',
          email: 'testartist@test.com',
          password: 'artist123',
          role: 'artist',
          bio: 'Test artist bio'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.user.role).toBe('artist');
    });
    
    it('should return 409 for duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate',
          email: 'testfan@test.com',
          password: 'password123',
          role: 'fan'
        });
      
      expect(res.statusCode).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });
    
    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Invalid User',
          email: 'notanemail',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(400);
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testfan@test.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'testfan@test.com');
    });
    
    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testfan@test.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
    
    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(401);
    });
  });
  
  describe('GET /api/auth/me', () => {
    let token;
    
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testfan@test.com', password: 'password123' });
      token = res.body.token;
    });
    
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('email', 'testfan@test.com');
    });
    
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
    
    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(res.statusCode).toBe(401);
    });
  });
});