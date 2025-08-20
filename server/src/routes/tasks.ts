import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';

const router = express.Router();

// 获取所有任务
router.get('/', (req, res) => {
  const status = req.query.status as string;
  const priority = req.query.priority as string;
  
  let query = 'SELECT * FROM tasks';
  const conditions: string[] = [];
  const values: any[] = [];
  
  if (status) {
    conditions.push('status = ?');
    values.push(status);
  }
  
  if (priority) {
    conditions.push('priority = ?');
    values.push(priority);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY priority DESC, created_at DESC';
  
  db.all(query, values, (err, rows) => {
    if (err) {
      res.status(500).json({ error: '获取任务失败' });
      return;
    }
    
    res.json(rows);
  });
});

// 获取单个任务
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: '获取任务失败' });
      return;
    }
    
    if (!row) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    
    res.json(row);
  });
});

// 创建任务
router.post('/', (req, res) => {
  const { title, description, priority = 'medium', due_date }: CreateTaskRequest = req.body;
  
  if (!title) {
    res.status(400).json({ error: '任务标题不能为空' });
    return;
  }
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  db.run(
    'INSERT INTO tasks (id, title, description, priority, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, description, priority, due_date, now, now],
    function(err) {
      if (err) {
        res.status(500).json({ error: '创建任务失败' });
        return;
      }
      
      const task: Task = {
        id,
        title,
        description,
        status: 'pending',
        priority: priority as 'low' | 'medium' | 'high',
        due_date,
        created_at: now,
        updated_at: now
      };
      
      res.status(201).json(task);
    }
  );
});

// 更新任务
router.put('/:id', (req, res) => {
  const { title, description, status, priority, due_date }: UpdateTaskRequest = req.body;
  const id = req.params.id;
  const now = new Date().toISOString();
  
  // 构建动态更新语句
  const updates: string[] = [];
  const values: any[] = [];
  
  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  
  if (priority !== undefined) {
    updates.push('priority = ?');
    values.push(priority);
  }
  
  if (due_date !== undefined) {
    updates.push('due_date = ?');
    values.push(due_date);
  }
  
  if (updates.length === 0) {
    res.status(400).json({ error: '没有提供更新数据' });
    return;
  }
  
  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  db.run(
    `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        res.status(500).json({ error: '更新任务失败' });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: '任务不存在' });
        return;
      }
      
      res.json({ message: '任务更新成功' });
    }
  );
});

// 删除任务
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: '删除任务失败' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: '任务不存在' });
      return;
    }
    
    res.json({ message: '任务删除成功' });
  });
});

// 获取任务统计
router.get('/stats/overview', (req, res) => {
  const stats = {
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    high_priority: 0
  };
  
  db.get('SELECT COUNT(*) as total FROM tasks', (err, totalRow: any) => {
    if (err) {
      res.status(500).json({ error: '获取统计失败' });
      return;
    }
    
    stats.total = totalRow.total;
    
    db.get('SELECT COUNT(*) as count FROM tasks WHERE status = "pending"', (err, pendingRow: any) => {
      if (!err) stats.pending = pendingRow.count;
      
      db.get('SELECT COUNT(*) as count FROM tasks WHERE status = "in_progress"', (err, progressRow: any) => {
        if (!err) stats.in_progress = progressRow.count;
        
        db.get('SELECT COUNT(*) as count FROM tasks WHERE status = "completed"', (err, completedRow: any) => {
          if (!err) stats.completed = completedRow.count;
          
          db.get('SELECT COUNT(*) as count FROM tasks WHERE priority = "high"', (err, highRow: any) => {
            if (!err) stats.high_priority = highRow.count;
            
            res.json(stats);
          });
        });
      });
    });
  });
});

export default router;