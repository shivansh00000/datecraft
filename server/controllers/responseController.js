const Response = require('../models/Response');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');

// @desc    Submit / Save Recipient Response
// @route   POST /api/responses
// @access  Public
exports.submitResponse = async (req, res) => {
  try {
    const { proposalId, visitorId, acceptanceStatus, answers, selectedDate, selectedTime, completionPercentage, timeSpentSeconds, ipHash, userAgent } = req.body;

    if (!proposalId || !visitorId) {
      return res.status(400).json({ success: false, message: 'Proposal ID and Visitor ID are required' });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Look for existing response by this visitor
    let responseObj = await Response.findOne({ proposal: proposalId, visitorId });

    const isNew = !responseObj;
    
    if (isNew) {
      responseObj = new Response({
        proposal: proposalId,
        visitorId,
        ipHash,
        userAgent,
        acceptanceStatus,
        answers,
        selectedDate,
        selectedTime,
        completionPercentage,
        timeSpentSeconds
      });
    } else {
      // Update fields if provided
      if (acceptanceStatus) responseObj.acceptanceStatus = acceptanceStatus;
      if (answers) responseObj.answers = answers;
      if (selectedDate) responseObj.selectedDate = selectedDate;
      if (selectedTime) responseObj.selectedTime = selectedTime;
      if (completionPercentage !== undefined) responseObj.completionPercentage = completionPercentage;
      if (timeSpentSeconds !== undefined) responseObj.timeSpentSeconds += timeSpentSeconds;
    }

    const savedResponse = await responseObj.save();

    // Trigger Notification for creator
    let notifyType = 'open';
    let message = `${proposal.girlName} just opened your proposal page! ❤️`;

    if (acceptanceStatus === 'yes') {
      notifyType = 'accepted';
      message = `OMG! ${proposal.girlName} clicked YES to your proposal! 🎉🍾❤️`;
    } else if (acceptanceStatus === 'no') {
      notifyType = 'open';
      message = `${proposal.girlName} is looking at options... 🥺`;
    } else if (selectedDate || selectedTime) {
      notifyType = 'date_selected';
      const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString() : '';
      message = `${proposal.girlName} selected a date: ${formattedDate} at ${selectedTime || 'anytime'} 📅✨`;
    } else if (completionPercentage === 100) {
      notifyType = 'questions_completed';
      message = `${proposal.girlName} completed all questions in your proposal! 📝❤️`;
    }

    // Only create notification if it represents a meaningful state change
    if (isNew || (acceptanceStatus && acceptanceStatus !== 'pending') || selectedDate || completionPercentage === 100) {
      await Notification.create({
        creator: proposal.creator,
        proposal: proposal._id,
        type: notifyType,
        message
      });
    }

    res.status(200).json({ success: true, response: savedResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Responses for a Proposal
// @route   GET /api/responses/proposal/:proposalId
// @access  Private
exports.getProposalResponses = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Auth verification
    if (proposal.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view responses' });
    }

    const responses = await Response.find({ proposal: req.params.proposalId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: responses.length, responses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
