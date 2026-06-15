const express = require('express');
const router = express.Router();
const { recordVisit, getAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');

// Public route to log proposal visit
router.post('/proposal/:proposalId/visit', recordVisit);

// Protected route to read analytics charts and metrics (creator only)
router.get('/proposal/:proposalId', protect, getAnalytics);

module.exports = router;
