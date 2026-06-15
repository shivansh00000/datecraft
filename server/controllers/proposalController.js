const Proposal = require('../models/Proposal');
const Response = require('../models/Response');
const Visit = require('../models/Visit');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// Utility to generate unique slug
const generateUniqueSlug = () => {
  return crypto.randomBytes(4).toString('hex'); // e.g. "abc123xyz"
};

// @desc    Create a new Proposal with default layout templates
// @route   POST /api/proposals
// @access  Private
exports.createProposal = async (req, res) => {
  try {
    const { girlName, title, templateName } = req.body;

    if (!girlName) {
      return res.status(400).json({ success: false, message: 'Please provide recipient name' });
    }

    const slug = generateUniqueSlug();

    // Default template configurations
    let themeConfig = {
      name: 'Romantic Rose',
      primaryColor: '#e11d48',
      secondaryColor: '#fbcfe8',
      accentColor: '#db2777',
      fontFamily: 'Inter',
      bgStyle: 'gradient-pink',
      cardStyle: 'glassmorphism',
      buttonStyle: 'rounded-full',
      animationIntensity: 'medium',
      borderRadius: '1rem',
      darkMode: false
    };

    if (templateName === 'Starry Night') {
      themeConfig = {
        name: 'Starry Night',
        primaryColor: '#6366f1', // Indigo
        secondaryColor: '#1e1b4b', // Dark purple
        accentColor: '#fbbf24', // Amber stars
        fontFamily: 'Outfit',
        bgStyle: 'starry-dark',
        cardStyle: 'glassmorphism',
        buttonStyle: 'rounded-lg',
        animationIntensity: 'high',
        borderRadius: '0.75rem',
        darkMode: true
      };
    } else if (templateName === 'Coffee Date') {
      themeConfig = {
        name: 'Coffee Date',
        primaryColor: '#b45309', // Amber 700
        secondaryColor: '#fef3c7', // Amber 100
        accentColor: '#78350f', // Amber 900
        fontFamily: 'Outfit',
        bgStyle: 'warm-cozy',
        cardStyle: 'soft-shadow',
        buttonStyle: 'rounded-md',
        animationIntensity: 'low',
        borderRadius: '0.5rem',
        darkMode: false
      };
    } else if (templateName === 'Movie Night') {
      themeConfig = {
        name: 'Movie Night',
        primaryColor: '#dc2626', // Red 600
        secondaryColor: '#171717', // Neutral 900
        accentColor: '#ef4444', // Red 500
        fontFamily: 'Outfit',
        bgStyle: 'cinematic-dark',
        cardStyle: 'flat-solid',
        buttonStyle: 'rounded-md',
        animationIntensity: 'medium',
        borderRadius: '0.25rem',
        darkMode: true
      };
    }

    const newProposal = new Proposal({
      creator: req.user.id,
      slug,
      girlName,
      title: title || `A Special Surprise for ${girlName} ❤️`,
      theme: themeConfig,
      sections: [
        { id: 'sec-hero', type: 'hero', enabled: true, order: 0, data: {} },
        { id: 'sec-proposal', type: 'proposal_question', enabled: true, order: 1, data: {} },
        { id: 'sec-memories', type: 'memory_timeline', enabled: true, order: 2, data: {} },
        { id: 'sec-polaroid', type: 'polaroid_gallery', enabled: true, order: 3, data: {} },
        { id: 'sec-envelope', type: 'secret_envelope', enabled: true, order: 4, data: {} },
        { id: 'sec-compliments', type: 'compliment_generator', enabled: true, order: 5, data: {} },
        { id: 'sec-game', type: 'mini_game', enabled: true, order: 6, data: {} },
        { id: 'sec-invite', type: 'final_invitation', enabled: true, order: 7, data: {} }
      ],
      memories: [
        { title: 'The First Time We Spoke', description: 'Everything changed the moment you said hello.', date: 'Day 1', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400' },
        { title: 'The First Joke', description: 'When you laughed at my terrible humor and made me feel like the luckiest person.', date: 'Week 2', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=400' }
      ],
      loveLetter: {
        letter: `Dear ${girlName},\n\nWriting this brings back so many wonderful memories. Ever since you entered my life, everything has been brighter and happier.\n\nYou make me laugh, support my wildest ideas, and just being around you is the best part of my day.`,
        secretMessage: 'I have a confession: I was nervous typing this, but I wanted to make you smile. 🙈',
        futurePlans: 'Let\'s go get some coffee, walk around the city, and argue about what movie to watch next.',
        hiddenNotes: 'You look beautiful reading this right now.'
      },
      questions: [
        { id: 'q-free', questionText: 'When are you free for our date? 📅', type: 'date_picker', required: true },
        { id: 'q-vibe', questionText: 'What works best for you? ☕', type: 'multiple_choice', options: ['Coffee date ☕', 'Dinner & walk 🌇', 'Movie night 🎬', 'Arcade / gaming 🎮'], required: true }
      ],
      compliments: [
        'You have an unfair advantage at being adorable.',
        'You make ordinary days feel like a movie.',
        'You are my absolute favorite notification.',
        'You are the reason my phone battery runs out so fast from smiling.',
        'If being cute was a crime, you would be serving a life sentence.'
      ],
      floatingNotes: [
        'You look cute today ❤️',
        'Best decision incoming 🌹',
        'Main character energy ✨',
        'Smile, it looks good on you!'
      ],
      starryMessages: [
        'You light up my sky ✨',
        'A shooting star just for your wishes 💫',
        'Reserved for holding hands under the stars.',
        'Infinite galaxies, but I\'d still choose you.'
      ],
      noButtonBehavior: {
        type: 'moving',
        allowEventually: true,
        maxAttempts: 7,
        customPhrases: [
          'Are you sure? 🥺',
          'I already built a whole website for this! 😭',
          'Free food is included, you know! 🍕',
          'Okay, now this is getting personal 😔',
          'Is that your final answer? 💔',
          'Just click YES already! ❤️',
          'Okay, I will let you click No now... but please don\'t 🥺'
        ]
      },
      settings: {
        visibility: 'public',
        allowResponses: true,
        allowDateSelection: true
      }
    });

    const savedProposal = await newProposal.save();
    res.status(201).json({ success: true, proposal: savedProposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Proposals for logged-in user
// @route   GET /api/proposals
// @access  Private
exports.getProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ creator: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: proposals.length, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Public Proposal by Slug
// @route   GET /api/proposals/slug/:slug
// @access  Public
exports.getProposalBySlug = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({ slug: req.params.slug });

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.status === 'archived') {
      return res.status(403).json({ success: false, message: 'This invitation has been archived' });
    }

    res.status(200).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Single Proposal Details
// @route   GET /api/proposals/:id
// @access  Private
exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Check ownership
    if (proposal.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to view this proposal' });
    }

    res.status(200).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Proposal Configurations
// @route   PUT /api/proposals/:id
// @access  Private
exports.updateProposal = async (req, res) => {
  try {
    let proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Check ownership
    if (proposal.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this proposal' });
    }

    proposal = await Proposal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Duplicate/Clone Proposal
// @route   POST /api/proposals/:id/duplicate
// @access  Private
exports.duplicateProposal = async (req, res) => {
  try {
    const original = await Proposal.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ success: false, message: 'Original proposal not found' });
    }

    // Check ownership
    if (original.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to duplicate this proposal' });
    }

    // Clone details
    const cloneData = original.toObject();
    delete cloneData._id;
    delete cloneData.createdAt;
    delete cloneData.updatedAt;
    
    cloneData.slug = generateUniqueSlug();
    cloneData.girlName = `${original.girlName} (Copy)`;
    cloneData.creator = req.user.id;

    const duplicated = await Proposal.create(cloneData);

    res.status(201).json({ success: true, proposal: duplicated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Proposal
// @route   DELETE /api/proposals/:id
// @access  Private
exports.deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Check ownership
    if (proposal.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this proposal' });
    }

    // Delete responses and visits associated with this proposal as clean cascade
    await Response.deleteMany({ proposal: proposal._id });
    await Visit.deleteMany({ proposal: proposal._id });
    await Notification.deleteMany({ proposal: proposal._id });
    
    await proposal.deleteOne();

    res.status(200).json({ success: true, message: 'Proposal and all associated logs deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
