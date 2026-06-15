const User = require('../models/User');
const Proposal = require('../models/Proposal');
const Response = require('../models/Response');
const Visit = require('../models/Visit');

// @desc    Get Platform Stats (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'creator' });
    const totalProposals = await Proposal.countDocuments();
    const totalResponses = await Response.countDocuments();
    const totalViews = await Visit.countDocuments();
    
    // Calculate Yes rate
    const yesCount = await Response.countDocuments({ acceptanceStatus: 'yes' });
    const decCount = await Response.countDocuments({ acceptanceStatus: { $in: ['yes', 'no'] } });
    const acceptanceRate = decCount > 0 ? Math.round((yesCount / decCount) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProposals,
        totalResponses,
        totalViews,
        acceptanceRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete User and Cascade-delete all proposals, responses, visits
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete an admin user' });
    }

    // Get all user proposals
    const proposals = await Proposal.find({ creator: user._id });
    const proposalIds = proposals.map(p => p._id);

    // Cascade deletions
    await Response.deleteMany({ proposal: { $in: proposalIds } });
    await Visit.deleteMany({ proposal: { $in: proposalIds } });
    await Proposal.deleteMany({ creator: user._id });
    
    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User and all their proposals deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
