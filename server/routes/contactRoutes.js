const express = require('express');
const router = express.Router();
const { createContactMessage, getContactMessages, deleteContactMessage } = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');

router.post('/', createContactMessage);
router.get('/', authMiddleware, getContactMessages);
router.delete('/:id', authMiddleware, deleteContactMessage);

module.exports = router;

