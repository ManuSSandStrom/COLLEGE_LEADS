const express = require('express');
const router = express.Router();
const {
  createLead,
  getAllLeads,
  deleteLead,
  exportLeadsToExcel,
  getLeadStats,
} = require('../controllers/leadController');
const authMiddleware = require('../middleware/auth');

// Public
router.post('/', createLead);

// Admin protected
router.get('/', authMiddleware, getAllLeads);
router.get('/stats', authMiddleware, getLeadStats);
router.delete('/:id', authMiddleware, deleteLead);

module.exports = router;
