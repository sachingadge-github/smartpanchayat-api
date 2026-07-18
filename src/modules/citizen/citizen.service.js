const { pool } = require('../../config/database');

const getProfile = async (id) => {
  const [rows] = await pool.execute(
    `SELECT c.*, p.name as panchayat_name, p.taluka, p.district
     FROM citizens c
     LEFT JOIN panchayats p ON c.panchayat_id = p.id
     WHERE c.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) throw Object.assign(new Error('Citizen not found'), { statusCode: 404 });
  return rows[0];
};

const updateProfile = async (id, data) => {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];
  await pool.execute(`UPDATE citizens SET ${fields}, updated_at = NOW() WHERE id = ?`, values);
  return getProfile(id);
};

const updatePhoto = async (id, photoUrl) => {
  await pool.execute(
    `UPDATE citizens SET photo_url = ?, updated_at = NOW() WHERE id = ?`,
    [photoUrl, id]
  );
  return getProfile(id);
};

module.exports = { getProfile, updateProfile, updatePhoto };
