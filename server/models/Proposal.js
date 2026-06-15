const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // 'hero', 'proposal_question', 'memory_timeline', 'polaroid_gallery', 'video_gallery', 'voice_message', 'love_letter', 'compliment_generator', 'countdown', 'secret_envelope', 'mini_game', 'final_invitation', 'custom_section'
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  data: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const MemorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String }, // e.g. "2024-02-14" or "First Day"
  image: { type: String }, // Image URL
  isScratchCard: { type: Boolean, default: false },
  scratchCoupon: { type: String, default: '' }
});

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  questionText: { type: String, required: true },
  type: { type: String, enum: ['text', 'multiple_choice', 'date_picker', 'time_picker', 'dropdown', 'emoji_selection'], default: 'text' },
  options: [{ type: String }], // for dropdown / multiple choice / emoji
  required: { type: Boolean, default: false }
});

const ProposalSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
  },
  
  // Step 1: Basic Information
  girlName: { type: String, required: true },
  title: { type: String, required: true, default: 'A Special Invitation for You' },
  introMessage: { type: String, default: 'I made something special for you...' },
  closingMessage: { type: String, default: 'Proceed at your own risk because smiling may occur 😌' },
  nickname: { type: String },
  specialNotes: { type: String },

  // Step 2: Theme Selection
  theme: {
    name: { type: String, default: 'Romantic Rose' }, // 'Romantic Rose', 'Starry Night', 'Coffee Date', 'Movie Night', 'Sunset Dream', 'Fairytale', 'Minimal Luxury'
    primaryColor: { type: String, default: '#e11d48' }, // Tailwind rose-600
    secondaryColor: { type: String, default: '#fbcfe8' }, // Tailwind pink-200
    accentColor: { type: String, default: '#db2777' }, // Tailwind pink-600
    fontFamily: { type: String, default: 'Inter' },
    bgStyle: { type: String, default: 'gradient-pink' }, // 'gradient-pink', 'starry-dark', 'warm-cozy', 'cinematic-dark', 'sunset-orange', 'pastel-gold'
    cardStyle: { type: String, default: 'glassmorphism' }, // 'glassmorphism', 'flat-solid', 'soft-shadow'
    buttonStyle: { type: String, default: 'rounded-full' },
    animationIntensity: { type: String, default: 'medium' }, // 'low', 'medium', 'high'
    borderRadius: { type: String, default: '1rem' },
    darkMode: { type: Boolean, default: false },
    confettiType: { type: String, default: 'hearts' }, // 'hearts', 'stars', 'flowers', 'food'
    ambientSound: { type: String, default: 'none' } // 'none', 'rain', 'fireplace', 'waves', 'lofi'
  },

  // Builder Sections
  sections: [SectionSchema],

  // Step 3: Memories
  memories: [MemorySchema],

  // Step 4: Love Letter
  loveLetter: {
    letter: { type: String },
    secretMessage: { type: String },
    futurePlans: { type: String },
    hiddenNotes: { type: String },
    envelopeSealType: { type: String, default: 'wax_seal' }, // 'wax_seal', 'standard_stamp', 'heart_sticker'
    waxSealColor: { type: String, default: '#b91c1c' }
  },

  // Step 5: Media Uploads & General Assets
  media: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'audio'], default: 'image' },
    publicId: { type: String } // Cloudinary public_id
  }],

  // Interactive Questions
  questions: [QuestionSchema],

  // Compliments
  compliments: [{ type: String }], // User customized compliment list

  // Floating sticky notes
  floatingNotes: [{ type: String }],

  // Starry Night Messages (when clicked, stars reveal these)
  starryMessages: [{ type: String }],

  // Mini Games State/Config
  miniGames: {
    hiddenHeartHunt: { type: Boolean, default: false },
    findThreeStars: { type: Boolean, default: false },
    openSecretEnvelope: { type: Boolean, default: true },
    unlockPuzzle: { type: Boolean, default: false },
    memoryQuiz: { type: Boolean, default: false },
    enableSpinWheel: { type: Boolean, default: false },
    spinWheelOptions: { type: [String], default: ['Romantic Dinner 🕯️', 'Arcade & Pizza 🍕', 'Bookstore & Coffee ☕', 'Movie Night 🍿', 'Beach Sunset Walk 🌅', 'Stay-in Cuddle & Cook 🍳'] },
    quizQuestions: [{
      question: { type: String },
      options: [{ type: String }],
      correctAnswer: { type: String }
    }]
  },

  // Funny No Button Behavior
  noButtonBehavior: {
    type: { type: String, enum: ['moving', 'shrinking', 'disabled', 'lock'], default: 'moving' },
    allowEventually: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 7 },
    customPhrases: [{ type: String }] // List of phrases to display as user hovers/clicks No
  },

  // Advanced Proposal Settings
  settings: {
    visibility: { type: String, enum: ['public', 'unlisted', 'password_protected'], default: 'public' },
    password: { type: String },
    expirationDate: { type: Date },
    maxVisitors: { type: Number, default: 0 }, // 0 = unlimited
    allowResponses: { type: Boolean, default: true },
    allowDateSelection: { type: Boolean, default: true }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update middleware for updatedAt
ProposalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Proposal', ProposalSchema);
