const express = require('express');
const router = express.Router();
const { submitResponse, getProposalResponses } = require('../controllers/responseController');
const { protect } = require('../middlewares/auth');

// Public route to submit response
router.post('/', submitResponse);

// Protected route to read responses (creator only)
router.get('/proposal/:proposalId', protect, getProposalResponses);

module.exports = router;
