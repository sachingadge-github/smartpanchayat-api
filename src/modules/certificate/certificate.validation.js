const Joi = require('joi');

const TYPES = ['birth', 'death', 'income', 'residence'];
const STATUS = ['pending', 'under_review', 'approved', 'rejected', 'ready'];

const apply = Joi.object({
  panchayat_id: Joi.number().integer().positive().required(),
  type: Joi.string().valid(...TYPES).required(),
  applicant_name: Joi.string().min(2).max(100).required(),
  details: Joi.object().required(),
});

const updateStatus = Joi.object({
  status: Joi.string().valid(...STATUS).required(),
  remark: Joi.string().max(500),
  pdf_url: Joi.string().uri().when('status', { is: 'ready', then: Joi.required() }),
});

const list = Joi.object({
  status: Joi.string().valid(...STATUS),
  type: Joi.string().valid(...TYPES),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

module.exports = { apply, updateStatus, list };
