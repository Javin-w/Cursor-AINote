import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from '../database/init';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: '访问令牌无效' });
    }

    const jwtPayload = payload as JwtPayload;
    
    // 验证用户是否仍然存在
    db.get(
      'SELECT id, username, email FROM users WHERE id = ?',
      [jwtPayload.id],
      (dbErr, row: any) => {
        if (dbErr || !row) {
          return res.status(403).json({ error: '用户不存在' });
        }

        req.user = {
          id: row.id,
          username: row.username,
          email: row.email
        };

        next();
      }
    );
  });
};

export const generateToken = (user: { id: string; email: string; username: string }): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '7d' } // 7天过期
  );
};