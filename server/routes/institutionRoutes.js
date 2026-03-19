const express = require('express');
const router = express.Router();
const {
  getAllInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  getStats,
} = require('../controllers/institutionController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getAllInstitutions);
router.get('/filter', getAllInstitutions);
router.get('/stats', getStats);
router.get('/:id', getInstitutionById);

// Admin protected routes
router.post('/', authMiddleware, upload.single('image'), createInstitution);
router.put('/:id', authMiddleware, upload.single('image'), updateInstitution);
router.delete('/:id', authMiddleware, deleteInstitution);

module.exports = router;
