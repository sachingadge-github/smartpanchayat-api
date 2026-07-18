const service = require('./gramsabha.service');
const R = require('../../utils/response');

const listMeetings = async (req, res, next) => {
  try {
    const { panchayat_id } = req.query;
    if (!panchayat_id) return R.badRequest(res, 'panchayat_id is required');
    const data = await service.listMeetings(panchayat_id);
    return R.success(res, 'Meetings fetched', data);
  } catch (e) { next(e); }
};

const submitAttendance = async (req, res, next) => {
  try {
    const { meeting_id, attending } = req.body;
    if (!meeting_id) return R.badRequest(res, 'meeting_id is required');
    const data = await service.submitAttendance(meeting_id, req.user.id, attending !== false);
    return R.success(res, 'Attendance submitted', data);
  } catch (e) { next(e); }
};

const listPolls = async (req, res, next) => {
  try {
    const { panchayat_id } = req.query;
    if (!panchayat_id) return R.badRequest(res, 'panchayat_id is required');
    const data = await service.listPolls(panchayat_id, req.user.id);
    return R.success(res, 'Polls fetched', data);
  } catch (e) { next(e); }
};

const submitVote = async (req, res, next) => {
  try {
    const { option_id } = req.body;
    if (!option_id) return R.badRequest(res, 'option_id is required');
    const data = await service.submitVote(req.params.id, option_id, req.user.id);
    return R.success(res, 'Vote submitted', data);
  } catch (e) { next(e); }
};

module.exports = { listMeetings, submitAttendance, listPolls, submitVote };
