import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '../types';

const router = express.Router();

// 获取所有笔记
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  
  db.all(
    'SELECT * FROM notes ORDER BY updated_at DESC LIMIT ? OFFSET ?',
    [limit, offset],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: '获取笔记失败' });
        return;
      }
      
      const notes = rows.map((row: any) => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : []
      }));
      
      res.json(notes);
    }
  );
});

// 获取单个笔记
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM notes WHERE id = ?', [req.params.id], (err, row: any) => {
    if (err) {
      res.status(500).json({ error: '获取笔记失败' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: '笔记不存在' });
      return;
    }
    
    const note = {
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : []
    };
    
    res.json(note);
  });
});

// 创建笔记
router.post('/', (req, res) => {
  const { title, content, tags = [] }: CreateNoteRequest = req.body;
  
  if (!title || !content) {
    res.status(400).json({ error: '标题和内容不能为空' });
    return;
  }
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  db.run(
    'INSERT INTO notes (id, title, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, title, content, JSON.stringify(tags), now, now],
    function(err) {
      if (err) {
        res.status(500).json({ error: '创建笔记失败' });
        return;
      }
      
      const note: Note = {
        id,
        title,
        content,
        tags,
        created_at: now,
        updated_at: now
      };
      
      res.status(201).json(note);
    }
  );
});

// 更新笔记
router.put('/:id', (req, res) => {
  const { title, content, tags }: UpdateNoteRequest = req.body;
  const id = req.params.id;
  const now = new Date().toISOString();
  
  // 构建动态更新语句
  const updates: string[] = [];
  const values: any[] = [];
  
  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  
  if (content !== undefined) {
    updates.push('content = ?');
    values.push(content);
  }
  
  if (tags !== undefined) {
    updates.push('tags = ?');
    values.push(JSON.stringify(tags));
  }
  
  if (updates.length === 0) {
    res.status(400).json({ error: '没有提供更新数据' });
    return;
  }
  
  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  db.run(
    `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        res.status(500).json({ error: '更新笔记失败' });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: '笔记不存在' });
        return;
      }
      
      res.json({ message: '笔记更新成功' });
    }
  );
});

// 删除笔记
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM notes WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: '删除笔记失败' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: '笔记不存在' });
      return;
    }
    
    res.json({ message: '笔记删除成功' });
  });
});

// 搜索笔记
router.get('/search/:query', (req, res) => {
  const query = `%${req.params.query}%`;
  
  db.all(
    'SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY updated_at DESC',
    [query, query],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: '搜索失败' });
        return;
      }
      
      const notes = rows.map((row: any) => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : []
      }));
      
      res.json(notes);
    }
  );
});

export default router;