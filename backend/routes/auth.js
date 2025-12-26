import express from 'express';
import * as authService from '../services/authService.js';
import { verifyToken } from '../middleware/auth.js';

export function createAuthRouter() {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
      const user = await authService.registerUser(req.body);
      res.status(201).json({
        message: 'Registration successful',
        user
      });
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === 'CONFLICT') {
        return res.status(409).json({ error: err.message });
      }
      console.error('Error registering user:', err);
      res.status(500).json({ error: 'Failed to register' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const result = await authService.loginUser(req.body);
      res.json(result);
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR') {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === 'AUTH_ERROR') {
        return res.status(401).json({ error: err.message });
      }
      console.error('Error logging in:', err);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  router.get('/me', verifyToken, async (req, res) => {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      res.json(user);
    } catch (err) {
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({ error: err.message });
      }
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  return router;
}