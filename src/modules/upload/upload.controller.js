const R = require('../../utils/response');

const uploadFile = (req, res) => {
  if (!req.file) return R.badRequest(res, 'No file provided');
  return R.created(res, 'File uploaded', {
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
};

module.exports = { uploadFile };
