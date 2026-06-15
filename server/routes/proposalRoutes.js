const express = require('express');
const router = express.Router();
const { 
  createProposal, 
  getProposals, 
  getProposalById, 
  getProposalBySlug, 
  updateProposal, 
  duplicateProposal, 
  deleteProposal 
} = require('../controllers/proposalController');
const { protect } = require('../middlewares/auth');

// Public route to view experience
router.get('/slug/:slug', getProposalBySlug);

// Protected routes (creator operations)
router.use(protect);
router.route('/')
  .post(createProposal)
  .get(getProposals);

router.route('/:id')
  .get(getProposalById)
  .put(updateProposal)
  .delete(deleteProposal);

router.post('/:id/duplicate', duplicateProposal);

module.exports = router;
