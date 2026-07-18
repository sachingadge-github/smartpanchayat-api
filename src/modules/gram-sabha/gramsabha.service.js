const { pool } = require('../../config/database');
const logger   = require('../../utils/logger')('gramsabha.service');

// ── Meetings ──────────────────────────────────────────────────────────────────

const listMeetings = async (panchayatId) => {
  panchayatId = parseInt(panchayatId, 10);
  logger.debug('listMeetings', { panchayatId });
  try {
    const [rows] = await pool.execute(
      `SELECT m.*,
         (SELECT COUNT(*) FROM gram_sabha_attendance a WHERE a.meeting_id = m.id AND a.attending = 1) AS attendees
       FROM gram_sabha_meetings m
       WHERE m.panchayat_id = ?
       ORDER BY m.date DESC`,
      [panchayatId]
    );
    return rows.map(r => ({
      ...r,
      agenda: r.agenda ? (typeof r.agenda === 'string' ? JSON.parse(r.agenda) : r.agenda) : [],
    }));
  } catch (err) {
    logger.error('listMeetings failed', { panchayatId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const getMeeting = async (id) => {
  id = parseInt(id, 10);
  try {
    const [rows] = await pool.execute(
      `SELECT m.*,
         (SELECT COUNT(*) FROM gram_sabha_attendance a WHERE a.meeting_id = m.id AND a.attending = 1) AS attendees
       FROM gram_sabha_meetings m WHERE m.id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) throw Object.assign(new Error('Meeting not found'), { statusCode: 404 });
    const row = rows[0];
    return { ...row, agenda: row.agenda ? (typeof row.agenda === 'string' ? JSON.parse(row.agenda) : row.agenda) : [] };
  } catch (err) {
    if (!err.statusCode) logger.error('getMeeting failed', { id, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const submitAttendance = async (meetingId, citizenId, attending) => {
  meetingId  = parseInt(meetingId, 10);
  citizenId  = parseInt(citizenId, 10);
  logger.info('submitAttendance', { meetingId, citizenId, attending });
  try {
    await pool.execute(
      `INSERT INTO gram_sabha_attendance (meeting_id, citizen_id, attending)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE attending = VALUES(attending)`,
      [meetingId, citizenId, attending ? 1 : 0]
    );
    return getMeeting(meetingId);
  } catch (err) {
    logger.error('submitAttendance failed', { meetingId, citizenId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

// ── Polls ─────────────────────────────────────────────────────────────────────

const listPolls = async (panchayatId, citizenId) => {
  panchayatId = parseInt(panchayatId, 10);
  citizenId   = parseInt(citizenId, 10);
  logger.debug('listPolls', { panchayatId, citizenId });
  try {
    const [polls] = await pool.execute(
      `SELECT * FROM gram_sabha_polls WHERE panchayat_id = ? ORDER BY created_at DESC`,
      [panchayatId]
    );

    const result = [];
    for (const poll of polls) {
      const [options] = await pool.execute(
        `SELECT id, text, votes FROM gram_sabha_poll_options WHERE poll_id = ?`,
        [poll.id]
      );
      const [[{ voted }]] = await pool.execute(
        `SELECT COUNT(*) as voted FROM gram_sabha_votes WHERE poll_id = ? AND citizen_id = ?`,
        [poll.id, citizenId]
      );
      const total_votes = options.reduce((s, o) => s + (o.votes || 0), 0);
      result.push({ ...poll, options, total_votes, user_voted: voted > 0 });
    }
    return result;
  } catch (err) {
    logger.error('listPolls failed', { panchayatId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

const submitVote = async (pollId, optionId, citizenId) => {
  pollId    = parseInt(pollId, 10);
  optionId  = parseInt(optionId, 10);
  citizenId = parseInt(citizenId, 10);
  logger.info('submitVote', { pollId, optionId, citizenId });
  try {
    // Check if already voted
    const [[{ voted }]] = await pool.execute(
      `SELECT COUNT(*) as voted FROM gram_sabha_votes WHERE poll_id = ? AND citizen_id = ?`,
      [pollId, citizenId]
    );
    if (voted > 0) throw Object.assign(new Error('Already voted on this poll'), { statusCode: 409 });

    // Verify option belongs to poll
    const [optRows] = await pool.execute(
      `SELECT id FROM gram_sabha_poll_options WHERE id = ? AND poll_id = ?`,
      [optionId, pollId]
    );
    if (!optRows.length) throw Object.assign(new Error('Option not found'), { statusCode: 404 });

    await pool.execute(
      `INSERT INTO gram_sabha_votes (poll_id, option_id, citizen_id) VALUES (?, ?, ?)`,
      [pollId, optionId, citizenId]
    );
    await pool.execute(
      `UPDATE gram_sabha_poll_options SET votes = votes + 1 WHERE id = ?`,
      [optionId]
    );

    const [options] = await pool.execute(
      `SELECT id, text, votes FROM gram_sabha_poll_options WHERE poll_id = ?`,
      [pollId]
    );
    const total_votes = options.reduce((s, o) => s + (o.votes || 0), 0);
    return { poll_id: pollId, option_id: optionId, options, total_votes, user_voted: true };
  } catch (err) {
    if (!err.statusCode) logger.error('submitVote failed', { pollId, optionId, citizenId, sqlMessage: err.sqlMessage, code: err.code });
    throw err;
  }
};

module.exports = { listMeetings, getMeeting, submitAttendance, listPolls, submitVote };
