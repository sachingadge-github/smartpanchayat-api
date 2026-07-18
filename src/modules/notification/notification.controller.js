const service = require('./notification.service');
const R = require('../../utils/response');

const registerToken = async (req, res, next) => {
  try {
    await service.registerToken(req.user.id, req.body.token, req.body.platform);
    return R.success(res, 'Device token registered');
  } catch (e) { next(e); }
};

const removeToken = async (req, res, next) => {
  try {
    await service.removeToken(req.user.id, req.body.token);
    return R.success(res, 'Device token removed');
  } catch (e) { next(e); }
};

// Send to a specific citizen (admin use)
const sendToUser = async (req, res, next) => {
  try {
    const { citizen_id, title, body, data } = req.body;
    const result = await service.sendToUser(citizen_id, title, body, data || {});
    return R.success(res, 'Notification sent', result);
  } catch (e) { next(e); }
};

// Broadcast to all citizens of a panchayat (admin use)
const sendToPanchayat = async (req, res, next) => {
  try {
    const { panchayat_id, title, body, data } = req.body;
    const result = await service.sendToPanchayat(panchayat_id, title, body, data || {});
    return R.success(res, 'Notification broadcast sent', result);
  } catch (e) { next(e); }
};

const list = async (req, res, next) => {
  try {
    const panchayatId = req.user.panchayat_id || 0;
    const data = await service.listByUser(req.user.id, panchayatId);
    return R.success(res, 'Notifications fetched', data);
  } catch (e) { next(e); }
};

const markRead = async (req, res, next) => {
  try {
    await service.markRead(req.params.id, req.user.id);
    return R.success(res, 'Marked as read');
  } catch (e) { next(e); }
};

const markAllRead = async (req, res, next) => {
  try {
    const panchayatId = req.user.panchayat_id || 0;
    await service.markAllRead(req.user.id, panchayatId);
    return R.success(res, 'All notifications marked as read');
  } catch (e) { next(e); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const panchayatId = req.user.panchayat_id || 0;
    const unread_count = await service.getUnreadCount(req.user.id, panchayatId);
    return R.success(res, 'Unread count fetched', { unread_count });
  } catch (e) { next(e); }
};

module.exports = { registerToken, removeToken, sendToUser, sendToPanchayat, list, markRead, markAllRead, getUnreadCount };
