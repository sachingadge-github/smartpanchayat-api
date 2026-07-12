const Joi = require('joi');

const CATEGORIES = ['road', 'water', 'streetlight', 'garbage', 'drainage', 'tree', 'other'];
const STATUS = ['open', 'in_progress', 'resolved', 'rejected'];

const create = Joi.object({
  panchayat_id: Joi.number().integer().positive().required(),
  category: Joi.string().valid(...CATEGORIES).required(),
  description: Joi.string().min(10).max(1000).required(),
  location: Joi.string().max(300),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
});

const updateStatus = Joi.object({
  status: Joi.string().valid(...STATUS).required(),
  remark: Joi.string().max(500),
});

const list = Joi.object({
  status: Joi.string().valid(...STATUS),
  category: Joi.string().valid(...CATEGORIES),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

module.exports = { create, updateStatus, list };
