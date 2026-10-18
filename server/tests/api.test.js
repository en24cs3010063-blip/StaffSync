const request = require('supertest');
const { app } = require('../server');
const { connectDB, disconnectDB } = require('../config/db');
const seedData = require('../scripts/seed');

describe('StaffSync HRMS Backend API Suite', () => {
  let hrToken;
  let managerToken;
  let employeeToken;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
    await seedData(false);

    // Login HR
    const hrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hr@staffsync.demo', password: 'Demo@12345' });
    hrToken = hrRes.body.token;

    // Login Manager
    const mgrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@staffsync.demo', password: 'Demo@12345' });
    managerToken = mgrRes.body.token;

    // Login Employee
    const empRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@staffsync.demo', password: 'Demo@12345' });
    employeeToken = empRes.body.token;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Health Check & Public Routes', () => {
    it('GET /api/health returns 200 and system status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.system).toBe('StaffSync HRMS API');
    });

    it('GET /api/unknown-endpoint returns 404', async () => {
      const res = await request(app).get('/api/unknown-endpoint');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Authentication & Role Permissions', () => {
    it('Fails login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'hr@staffsync.demo', password: 'WrongPassword' });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me returns current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${hrToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.user.role).toBe('admin');
      expect(res.body.user.email).toBe('hr@staffsync.demo');
    });

    it('Employee cannot access HR-only routes like POST /api/departments', async () => {
      const res = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ name: 'Illegal Dept', code: 'ILL' });
      expect(res.statusCode).toBe(403);
    });

    it('HR can create a new department', async () => {
      const res = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          name: 'Quality Assurance',
          code: 'QA',
          description: 'Software QA, Automation and Testing',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.code).toBe('QA');
    });
  });

  describe('3. Attendance Management & Duplicate Prevention', () => {
    it('Employee can check in successfully', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ note: 'Morning check in test' });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Present');
    });

    it('Rejects duplicate check in on the same day', async () => {
      const res = await request(app)
        .post('/api/attendance/check-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ note: 'Duplicate attempt' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already checked in/i);
    });

    it('Employee can check out', async () => {
      const res = await request(app)
        .post('/api/attendance/check-out')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ note: 'Evening check out test' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.checkOut).toBeDefined();
    });
  });

  describe('4. Leave Application & Management', () => {
    it('Rejects leave request when end date is before start date', async () => {
      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'sick',
          startDate: '2026-11-20',
          endDate: '2026-11-10',
          reason: 'Invalid date range test',
        });
      expect(res.statusCode).toBe(400);
    });

    it('Manager can view pending leave requests', async () => {
      const res = await request(app)
        .get('/api/leaves?status=Pending')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('5. Announcements & Analytics', () => {
    it('HR can publish announcements', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          title: 'Office Renovation Complete',
          content: 'The 3rd floor lounge is now open for collaborative work.',
          category: 'Company News',
          priority: 'Medium',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.title).toBe('Office Renovation Complete');
    });

    it('Admin analytics endpoint returns dashboard stats', async () => {
      const res = await request(app)
        .get('/api/analytics/admin')
        .set('Authorization', `Bearer ${hrToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.totalEmployees).toBeGreaterThan(0);
      expect(Array.isArray(res.body.attendanceTrend)).toBe(true);
    });
  });
});
