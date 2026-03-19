const express = require('express');
const router = express.Router();
const { adminLogin, getAdminProfile } = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

router.post('/login', adminLogin);
router.get('/me', authMiddleware, getAdminProfile);

module.exports = router;
