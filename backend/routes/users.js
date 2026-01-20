import express from 'express';
import { validateId } from '../middleware/validation.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { db } from '../models/index.js';

const { User } = db;

export function createUsersRouter() {
  const router = express.Router();

  router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'email', 'role', 'createdAt']
      });
      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  router.put('/:id/role', validateId, verifyToken, requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      user.role = role;
      await user.save();
      res.json({ id: user.id, email: user.email, role: user.role });
    } catch (err) {
      console.error('Error updating user role:', err);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });

  return router;
}