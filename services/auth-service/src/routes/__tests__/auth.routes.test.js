import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

vi.mock('@moneyswift/database');
vi.mock('../../services/auth.service.js', () => ({
  default: {
    register: vi.fn(),
    login:    vi.fn(),
  },
}));

import app         from '../../app.js';
import AuthService from '../../services/auth.service.js';

describe('Auth Routes — Intégration HTTP', () => {

  describe('POST /api/v1/auth/register', () => {

    it('201 — devrait créer un compte avec des données valides', async () => {
      AuthService.register.mockResolvedValue({
        userId:  'user-uuid-001',
        message: 'Code de vérification envoyé',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ phoneNumber: '+237699000001', fullName: 'Alice Mbarga', pin: '123456' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('userId');
    });

    it('400 — devrait rejeter un corps invalide (PIN manquant)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ phoneNumber: '+237699000001', fullName: 'Alice' }); // pin manquant

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('400 — devrait rejeter un numéro camerounais invalide', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ phoneNumber: '0699000001', fullName: 'Alice', pin: '123456' });

      expect(res.status).toBe(400);
    });

    it('409 — devrait rejeter un numéro déjà utilisé', async () => {
      AuthService.register.mockRejectedValue(
        Object.assign(new Error('déjà associé'), { statusCode: 409 })
      );

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ phoneNumber: '+237699000001', fullName: 'Alice', pin: '123456' });

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {

    it('200 — devrait retourner les tokens si credentials valides', async () => {
      AuthService.login.mockResolvedValue({
        accessToken:  'mock.access.token',
        refreshToken: 'mock.refresh.token',
        user: { id: 'user-001', phoneNumber: '+237699000001', fullName: 'Alice Mbarga' },
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phoneNumber: '+237699000001', pin: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).not.toHaveProperty('pinHash');
    });

    it('401 — devrait rejeter des credentials invalides', async () => {
      AuthService.login.mockRejectedValue(
        Object.assign(new Error('Identifiants incorrects'), { statusCode: 401 })
      );

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ phoneNumber: '+237699000001', pin: '000000' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /health', () => {
    it('200 — devrait retourner le statut du service', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
