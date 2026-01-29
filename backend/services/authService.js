import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/constants.js';
import { ROLES } from '../config/roles.js';
import { db } from '../models/index.js';

const { User } = db;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '7d';

export async function registerUser(data) {
  const { email, password } = data;

  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (email.trim().length === 0 || password.trim().length === 0) {
    const error = new Error('Email and password cannot be empty');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (password.trim().length < CONFIG.MIN_PASSWORD_LENGTH) {
    const error = new Error(`Password must be at least ${CONFIG.MIN_PASSWORD_LENGTH} characters`);
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    const error = new Error('Invalid email format');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const existingUser = await User.findOne({
    where: { email: email.trim().toLowerCase() },
  })
  if (existingUser) {
    const error = new Error('Email already registered');
    error.code = 'CONFLICT';
    throw error;
  }

  // First user becomes admin
  const userCount = await User.count();
  const role = userCount === 0 ? ROLES.ADMIN : ROLES.USER;

  const user = await User.create({
    email: email.trim().toLowerCase(),
    password: password.trim(),
    role
  });

  return {
    id: user.id,
    email: user.email
  };
}

export async function loginUser(data) {
  const { email, password } = data;

  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

	const user = await User.findOne({
		where: { email: email.trim().toLowerCase() },
	})
  if (!user) {
    const error = new Error('Invalid credentials');
    error.code = 'AUTH_ERROR';
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.code = 'AUTH_ERROR';
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
}

export async function getCurrentUser(userId) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'email', 'role', 'createdAt']
  });

  if (!user) {
    const error = new Error('User not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  return user;
}