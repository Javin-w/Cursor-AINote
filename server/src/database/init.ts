import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../data/app.db');

export const db = new sqlite3.Database(dbPath);

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 创建用户表
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建笔记表（添加用户关联）
      db.run(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // 创建任务表（添加用户关联）
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          priority TEXT NOT NULL DEFAULT 'medium',
          due_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `, (taskErr) => {
        if (taskErr) {
          reject(taskErr);
          return;
        }

        // 创建个人知识库表
        db.run(`
          CREATE TABLE IF NOT EXISTS knowledge_items (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            summary TEXT,
            content TEXT NOT NULL,
            category TEXT DEFAULT '未分类',
            tags TEXT,
            source_url TEXT,
            status TEXT NOT NULL DEFAULT 'draft',
            is_favorite INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
          )
        `, (knowledgeErr) => {
          if (knowledgeErr) {
            reject(knowledgeErr);
          } else {
            console.log('数据库初始化完成');
            resolve();
          }
        });
      });
    });
  });
};