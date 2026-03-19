const express = require('express');
const router = express.Router();
const { exportLeadsToExcel } = require('../controllers/leadController');
const authMiddleware = require('../middleware/auth');

router.get('/leads', authMiddleware, exportLeadsToExcel);

module.exports = router;
