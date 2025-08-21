import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import { db } from '../database/init';
import { generateToken, authenticateToken } from '../middleware/auth';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types';

const router = express.Router();

// 登录速率限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次尝试
  message: { error: '登录尝试次数过多，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 注册速率限制
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 最多3次注册
  message: { error: '注册次数过多，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 用户注册
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { username, email, password }: RegisterRequest = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: '用户名至少需要3个字符' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少需要6个字符' });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '邮箱格式无效' });
    }

    // 检查用户名和邮箱是否已存在
    db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email],
      async (err, row) => {
        if (err) {
          console.error('数据库查询错误:', err);
          return res.status(500).json({ error: '注册失败，请稍后再试' });
        }

        if (row) {
          return res.status(400).json({ error: '用户名或邮箱已存在' });
        }

        try {
          // 哈希密码
          const saltRounds = 12;
          const passwordHash = await bcrypt.hash(password, saltRounds);

          const userId = uuidv4();
          const now = new Date().toISOString();

          // 创建用户
          db.run(
            'INSERT INTO users (id, username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, username, email, passwordHash, now, now],
            function(insertErr) {
              if (insertErr) {
                console.error('创建用户失败:', insertErr);
                return res.status(500).json({ error: '注册失败，请稍后再试' });
              }

              // 生成JWT令牌
              const token = generateToken({
                id: userId,
                username,
                email
              });

              const response: AuthResponse = {
                token,
                user: {
                  id: userId,
                  username,
                  email
                }
              };

              res.status(201).json(response);
            }
          );
        } catch (hashErr) {
          console.error('密码哈希失败:', hashErr);
          res.status(500).json({ error: '注册失败，请稍后再试' });
        }
      }
    );
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败，请稍后再试' });
  }
});

// 用户登录
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '请输入邮箱和密码' });
    }

    // 查找用户
    db.get(
      'SELECT id, username, email, password_hash FROM users WHERE email = ?',
      [email],
      async (err, row: any) => {
        if (err) {
          console.error('数据库查询错误:', err);
          return res.status(500).json({ error: '登录失败，请稍后再试' });
        }

        if (!row) {
          return res.status(401).json({ error: '邮箱或密码错误' });
        }

        try {
          // 验证密码
          const isValidPassword = await bcrypt.compare(password, row.password_hash);
          
          if (!isValidPassword) {
            return res.status(401).json({ error: '邮箱或密码错误' });
          }

          // 生成JWT令牌
          const token = generateToken({
            id: row.id,
            username: row.username,
            email: row.email
          });

          const response: AuthResponse = {
            token,
            user: {
              id: row.id,
              username: row.username,
              email: row.email
            }
          };

          res.json(response);
        } catch (compareErr) {
          console.error('密码验证失败:', compareErr);
          res.status(500).json({ error: '登录失败，请稍后再试' });
        }
      }
    );
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败，请稍后再试' });
  }
});

// 验证令牌并获取用户信息
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// 刷新令牌
router.post('/refresh', authenticateToken, (req, res) => {
  const token = generateToken(req.user!);
  res.json({ token });
});

export default router;