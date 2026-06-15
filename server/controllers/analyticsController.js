const Visit = require('../models/Visit');
const Response = require('../models/Response');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');

// @desc    Register a new unique visit / log view
// @route   POST /api/analytics/proposal/:proposalId/visit
// @access  Public
exports.recordVisit = async (req, res) => {
  try {
    const { visitorId, userAgent, ipHash, source } = req.body;
    const proposalId = req.params.proposalId;

    if (!visitorId) {
      return res.status(400).json({ success: false, message: 'Visitor ID is required' });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Check if user has already visited in this session to prevent spamming
    const existingVisit = await Visit.findOne({
      proposal: proposalId,
      visitorId,
      timestamp: { $gt: new Date(Date.now() - 15 * 60 * 1000) } // last 15 minutes
    });

    if (!existingVisit) {
      await Visit.create({
        proposal: proposalId,
        visitorId,
        ipHash,
        userAgent,
        source: source || 'Direct'
      });

      // Notify creator about page opening
      await Notification.create({
        creator: proposal.creator,
        proposal: proposal._id,
        type: 'open',
        message: `Your proposal for ${proposal.girlName} was just opened! ❤️`
      });
    }

    res.status(200).json({ success: true, message: 'Visit logged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get consolidated analytics reports for a Proposal
// @route   GET /api/analytics/proposal/:proposalId
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const proposalId = req.params.proposalId;
    const proposal = await Proposal.findById(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Auth verification
    if (proposal.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view analytics' });
    }

    const visits = await Visit.find({ proposal: proposalId });
    const responses = await Response.find({ proposal: proposalId });

    // 1. Core Metrics
    const totalViews = visits.length;
    const uniqueVisitors = new Set(visits.map(v => v.visitorId)).size;
    const repeatVisitors = Math.max(0, totalViews - uniqueVisitors);

    const acceptances = responses.filter(r => r.acceptanceStatus === 'yes').length;
    const rejections = responses.filter(r => r.acceptanceStatus === 'no').length;
    const totalDecisions = acceptances + rejections;

    const acceptanceRate = totalDecisions > 0 ? Math.round((acceptances / totalDecisions) * 100) : 0;
    
    const completions = responses.filter(r => r.completionPercentage === 100).length;
    const completionRate = uniqueVisitors > 0 ? Math.round((completions / uniqueVisitors) * 100) : 0;

    // 2. Average Time Spent
    const totalTime = responses.reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0);
    const avgTimeSpent = responses.length > 0 ? Math.round(totalTime / responses.length) : 0;

    // 3. Bounce Rate (visitors who spent less than 5 seconds and did not answer questions)
    const singleBounces = responses.filter(r => r.timeSpentSeconds < 5 && r.answers.length === 0).length;
    const bounceRate = uniqueVisitors > 0 ? Math.round((singleBounces / uniqueVisitors) * 100) : 0;

    // 4. Device / Browser Breakdowns
    const deviceBreakdown = { mobile: 0, tablet: 0, desktop: 0 };
    const countryBreakdown = {};
    const browserBreakdown = {};
    const trafficSources = {};

    visits.forEach(v => {
      // Device
      const dev = v.userAgent?.device || 'desktop';
      deviceBreakdown[dev] = (deviceBreakdown[dev] || 0) + 1;

      // Country
      const country = v.userAgent?.country || 'Unknown';
      countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;

      // Browser
      const browser = v.userAgent?.browser || 'Unknown';
      browserBreakdown[browser] = (browserBreakdown[browser] || 0) + 1;

      // Source
      const src = v.source || 'Direct';
      trafficSources[src] = (trafficSources[src] || 0) + 1;
    });

    // 5. Questionnaire Answer Distribution
    const questionDistribution = {};
    responses.forEach(r => {
      r.answers.forEach(ans => {
        if (!questionDistribution[ans.questionId]) {
          questionDistribution[ans.questionId] = {
            questionText: ans.questionText || 'Custom Question',
            answers: {}
          };
        }
        const textVal = ans.answerText;
        questionDistribution[ans.questionId].answers[textVal] = 
          (questionDistribution[ans.questionId].answers[textVal] || 0) + 1;
      });
    });

    // 6. Date / Time Preferences
    const datePreferences = [];
    const timePreferences = {};
    responses.forEach(r => {
      if (r.selectedDate) {
        datePreferences.push(r.selectedDate);
      }
      if (r.selectedTime) {
        timePreferences[r.selectedTime] = (timePreferences[r.selectedTime] || 0) + 1;
      }
    });

    // 7. Timeline of visits (last 7 days helper)
    const visitorTimeline = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const count = visits.filter(v => v.timestamp.toISOString().startsWith(dateString)).length;
      visitorTimeline.push({ date: dateString, count });
    }

    res.status(200).json({
      success: true,
      analytics: {
        totalViews,
        uniqueVisitors,
        repeatVisitors,
        acceptanceRate,
        completionRate,
        avgTimeSpent,
        bounceRate,
        totalAcceptances: acceptances,
        pendingResponses: totalViews - responses.length,
        deviceBreakdown,
        countryBreakdown,
        browserBreakdown,
        trafficSources,
        questionDistribution,
        datePreferences,
        timePreferences,
        visitorTimeline
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
