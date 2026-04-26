const { UserDocument, User } = require('../models');

// @desc    Get current user documents
// @route   GET /api/documents/my
// @access  Private
const getMyDocuments = async (req, res) => {
  try {
    let doc = await UserDocument.findOne({ where: { user_id: req.user.user_id } });
    if (!doc) {
      doc = await UserDocument.create({ user_id: req.user.user_id });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload or update a document URL
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  const { type, url } = req.body; // type: 'gov_id' or 'license'
  try {
    let doc = await UserDocument.findOne({ where: { user_id: req.user.user_id } });
    if (!doc) {
      doc = await UserDocument.create({ user_id: req.user.user_id });
    }

    if (type === 'gov_id') {
      doc.gov_id_url = url;
      doc.gov_id_status = 'Pending';
    } else if (type === 'license') {
      doc.license_url = url;
      doc.license_status = 'Pending';
    } else {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user documents (Admin)
// @route   GET /api/documents/admin/all
// @access  Private/Admin
const getAllDocuments = async (req, res) => {
  try {
    const docs = await UserDocument.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify or Reject a document (Admin)
// @route   PUT /api/documents/admin/:id/verify
// @access  Private/Admin
const verifyDocument = async (req, res) => {
  const { type, status } = req.body; // type: 'gov_id' or 'license', status: 'Verified' or 'Rejected'
  try {
    const doc = await UserDocument.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (type === 'gov_id') {
      doc.gov_id_status = status;
    } else if (type === 'license') {
      doc.license_status = status;
    } else {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    await doc.save();
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyDocuments,
  uploadDocument,
  getAllDocuments,
  verifyDocument
};
