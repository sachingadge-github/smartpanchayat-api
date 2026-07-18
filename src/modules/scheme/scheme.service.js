const { pool } = require('../../config/database');
const logger   = require('../../utils/logger')('scheme.service');

const list = async ({ category, search, page = 1, limit = 10 }) => {
  page  = parseInt(page, 10);
  limit = parseInt(limit, 10);
  logger.debug('list', { category, search, page, limit });
  let where = 'WHERE 1=1';
  const params = [];
  if (category) { where += ' AND category = ?'; params.push(category); }
  if (search)   { where += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  const offset = (page - 1) * limit;
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM schemes ${where} ORDER BY name LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) as total FROM schemes ${where}`, params);
    logger.debug('list result', { total, returned: rows.length });
    return { rows, total, page, limit, pages: Math.ceil(total / limit) };
  } catch (err) {
    logger.error('list failed', { category, search, page, limit, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getById = async (id) => {
  id = parseInt(id, 10);
  logger.debug('getById', { id });
  try {
    const [rows] = await pool.execute(`SELECT * FROM schemes WHERE id = ? LIMIT 1`, [id]);
    if (!rows.length) throw Object.assign(new Error('Scheme not found'), { statusCode: 404 });
    return rows[0];
  } catch (err) {
    if (!err.statusCode) logger.error('getById failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const toggleBookmark = async (schemeId, citizenId, add) => {
  schemeId  = parseInt(schemeId, 10);
  citizenId = parseInt(citizenId, 10);
  logger.debug('toggleBookmark', { schemeId, citizenId, add });
  const scheme = await getById(schemeId);
  try {
    if (add) {
      await pool.execute(
        `INSERT IGNORE INTO scheme_bookmarks (scheme_id, citizen_id) VALUES (?, ?)`,
        [schemeId, citizenId]
      );
    } else {
      await pool.execute(
        `DELETE FROM scheme_bookmarks WHERE scheme_id = ? AND citizen_id = ?`,
        [schemeId, citizenId]
      );
    }
    return { scheme_id: schemeId, is_bookmarked: add };
  } catch (err) {
    logger.error('toggleBookmark failed', { schemeId, citizenId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const listWithBookmarks = async (params, citizenId) => {
  const result = await list(params);
  if (!citizenId) return result;
  const [bmarks] = await pool.execute(
    `SELECT scheme_id FROM scheme_bookmarks WHERE citizen_id = ?`,
    [parseInt(citizenId, 10)]
  );
  const bset = new Set(bmarks.map(b => b.scheme_id));
  return { ...result, rows: result.rows.map(r => ({ ...r, is_bookmarked: bset.has(r.id) })) };
};

module.exports = { list, listWithBookmarks, getById, toggleBookmark };
