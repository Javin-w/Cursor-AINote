import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init';
import {
  CreateKnowledgeItemRequest,
  KnowledgeItem,
  UpdateKnowledgeItemRequest,
} from '../types';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

const validStatuses = ['draft', 'published', 'archived'] as const;

const isValidStatus = (status: string): status is KnowledgeItem['status'] =>
  validStatuses.includes(status as KnowledgeItem['status']);

const parseKnowledgeItem = (row: any): KnowledgeItem => {
  let tags: string[] = [];
  if (row.tags) {
    try {
      tags = JSON.parse(row.tags);
      if (!Array.isArray(tags)) {
        tags = [];
      }
    } catch {
      tags = [];
    }
  }

  return {
    ...row,
    tags,
    is_favorite: Boolean(row.is_favorite),
  };
};

// 获取当前用户的知识条目列表（支持筛选）
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const keyword = (req.query.keyword as string)?.trim();
  const category = (req.query.category as string)?.trim();
  const status = (req.query.status as string)?.trim();
  const tag = (req.query.tag as string)?.trim();
  const favorite = (req.query.favorite as string)?.trim();
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const offset = parseInt(req.query.offset as string, 10) || 0;

  if (status && !isValidStatus(status)) {
    res.status(400).json({ error: '无效的状态筛选值' });
    return;
  }

  let query = 'SELECT * FROM knowledge_items WHERE user_id = ?';
  const values: Array<string | number> = [userId];

  if (keyword) {
    query += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
    const searchPattern = `%${keyword}%`;
    values.push(searchPattern, searchPattern, searchPattern);
  }

  if (category) {
    query += ' AND category = ?';
    values.push(category);
  }

  if (status) {
    query += ' AND status = ?';
    values.push(status);
  }

  if (tag) {
    query += ' AND tags LIKE ?';
    values.push(`%"${tag}"%`);
  }

  if (favorite === '1' || favorite === 'true') {
    query += ' AND is_favorite = 1';
  } else if (favorite === '0' || favorite === 'false') {
    query += ' AND is_favorite = 0';
  }

  query += ' ORDER BY is_favorite DESC, updated_at DESC LIMIT ? OFFSET ?';
  values.push(limit, offset);

  db.all(query, values, (err, rows) => {
    if (err) {
      res.status(500).json({ error: '获取知识库列表失败' });
      return;
    }

    const items = (rows as any[]).map(parseKnowledgeItem);
    res.json(items);
  });
});

// 获取知识库统计信息
router.get('/stats/overview', authenticateToken, (req, res) => {
  const userId = req.user!.id;

  db.get(
    `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published_count,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived_count,
        SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favorite_count,
        COUNT(DISTINCT CASE WHEN category IS NOT NULL AND category != '' THEN category END) as category_count
      FROM knowledge_items
      WHERE user_id = ?
    `,
    [userId],
    (err, row: any) => {
      if (err) {
        res.status(500).json({ error: '获取知识库统计失败' });
        return;
      }

      res.json({
        total: row?.total ?? 0,
        draft: row?.draft_count ?? 0,
        published: row?.published_count ?? 0,
        archived: row?.archived_count ?? 0,
        favorite: row?.favorite_count ?? 0,
        categories: row?.category_count ?? 0,
      });
    }
  );
});

// 获取当前用户使用过的分类列表
router.get('/categories/list', authenticateToken, (req, res) => {
  const userId = req.user!.id;

  db.all(
    `
      SELECT DISTINCT category
      FROM knowledge_items
      WHERE user_id = ? AND category IS NOT NULL AND category != ''
      ORDER BY category ASC
    `,
    [userId],
    (err, rows: any[]) => {
      if (err) {
        res.status(500).json({ error: '获取分类列表失败' });
        return;
      }

      res.json(rows.map((row) => row.category));
    }
  );
});

// 获取单个知识条目
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id;

  db.get(
    'SELECT * FROM knowledge_items WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: '获取知识条目失败' });
        return;
      }

      if (!row) {
        res.status(404).json({ error: '知识条目不存在或无权限访问' });
        return;
      }

      res.json(parseKnowledgeItem(row));
    }
  );
});

// 创建知识条目
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const {
    title,
    summary,
    content,
    category = '未分类',
    tags = [],
    source_url,
    status = 'draft',
    is_favorite = false,
  }: CreateKnowledgeItemRequest = req.body;

  if (!title?.trim() || !content?.trim()) {
    res.status(400).json({ error: '标题和内容不能为空' });
    return;
  }

  if (!isValidStatus(status)) {
    res.status(400).json({ error: '无效的状态值' });
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `
      INSERT INTO knowledge_items
      (id, user_id, title, summary, content, category, tags, source_url, status, is_favorite, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      userId,
      title.trim(),
      summary?.trim() || null,
      content.trim(),
      category.trim() || '未分类',
      JSON.stringify(tags.filter((tag) => tag.trim() !== '')),
      source_url?.trim() || null,
      status,
      is_favorite ? 1 : 0,
      now,
      now,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: '创建知识条目失败' });
        return;
      }

      const item: KnowledgeItem = {
        id,
        user_id: userId,
        title: title.trim(),
        summary: summary?.trim() || undefined,
        content: content.trim(),
        category: category.trim() || '未分类',
        tags: tags.filter((tag) => tag.trim() !== ''),
        source_url: source_url?.trim() || undefined,
        status,
        is_favorite,
        created_at: now,
        updated_at: now,
      };

      res.status(201).json(item);
    }
  );
});

// 更新知识条目
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id;
  const updates: string[] = [];
  const values: Array<string | number> = [];
  const now = new Date().toISOString();
  const payload: UpdateKnowledgeItemRequest = req.body;

  if (payload.title !== undefined) {
    const title = payload.title.trim();
    if (!title) {
      res.status(400).json({ error: '标题不能为空' });
      return;
    }

    updates.push('title = ?');
    values.push(title);
  }

  if (payload.summary !== undefined) {
    updates.push('summary = ?');
    values.push(payload.summary.trim() || '');
  }

  if (payload.content !== undefined) {
    const content = payload.content.trim();
    if (!content) {
      res.status(400).json({ error: '内容不能为空' });
      return;
    }

    updates.push('content = ?');
    values.push(content);
  }

  if (payload.category !== undefined) {
    updates.push('category = ?');
    values.push(payload.category.trim() || '未分类');
  }

  if (payload.tags !== undefined) {
    updates.push('tags = ?');
    values.push(JSON.stringify(payload.tags.filter((tag) => tag.trim() !== '')));
  }

  if (payload.source_url !== undefined) {
    updates.push('source_url = ?');
    values.push(payload.source_url.trim() || '');
  }

  if (payload.status !== undefined) {
    if (!isValidStatus(payload.status)) {
      res.status(400).json({ error: '无效的状态值' });
      return;
    }

    updates.push('status = ?');
    values.push(payload.status);
  }

  if (payload.is_favorite !== undefined) {
    updates.push('is_favorite = ?');
    values.push(payload.is_favorite ? 1 : 0);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: '没有提供更新数据' });
    return;
  }

  updates.push('updated_at = ?');
  values.push(now);
  values.push(id, userId);

  db.run(
    `UPDATE knowledge_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
    values,
    function (err) {
      if (err) {
        res.status(500).json({ error: '更新知识条目失败' });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: '知识条目不存在或无权限访问' });
        return;
      }

      res.json({ message: '知识条目更新成功' });
    }
  );
});

// 删除知识条目
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.user!.id;
  const id = req.params.id;

  db.run(
    'DELETE FROM knowledge_items WHERE id = ? AND user_id = ?',
    [id, userId],
    function (err) {
      if (err) {
        res.status(500).json({ error: '删除知识条目失败' });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: '知识条目不存在或无权限访问' });
        return;
      }

      res.json({ message: '知识条目删除成功' });
    }
  );
});

export default router;
