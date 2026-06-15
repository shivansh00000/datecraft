// Pre-written structures for romantic generation
const loveLetterTemplates = [
  "My dearest {name},\n\nEvery single day I spend with you makes me realize how lucky I am to have you in my life. You bring a smile to my face when I least expect it and warmth to my heart when things get tough. I love the way you laugh, the way you look at me, and your sweet nickname '{nickname}'. You have completely changed my world for the better.\n\nI can't wait to create more memories with you, share more laughter, and enjoy every sunset together.\n\nAlways yours,\n{creatorName}",
  
  "Hey {nickname},\n\nI wanted to write down some thoughts that I don\'t say often enough. You are one of the most incredible people I have ever met. You are kind, beautiful, and you have this main character energy that lights up any room you walk into. Ever since our first memory, I knew there was something magical about us.\n\nNo matter what we do—whether it\'s getting coffee, walking around talking for hours, or just sitting in silence—I enjoy every second of it. Thanks for being you.\n\nWith all my love,\n{creatorName}",
  
  "To the most beautiful girl, {name},\n\nI still smile when I think about our first joke and how easily we clicked. You have this unique superpower of making my bad days good, and my good days perfect. You are my absolute favorite notification. I built this special page for you to show you a fraction of how much you mean to me.\n\nWill you make me the happiest person and join me on this date? I promise to make it unforgettable.\n\nWith love,\n{creatorName}"
];

const compliments = [
  "You have an unfair advantage at being adorable.",
  "You make ordinary days feel like a scene from a movie.",
  "You're my absolute favorite notification.",
  "You look cute reading this right now. Yes, you!",
  "Your smile is my absolute favorite thing in the universe.",
  "I'm convinced you are made of stardust and smiles.",
  "You look cute even when you're mad or rolling your eyes.",
  "You possess total main character energy. 👑",
  "If being beautiful was a crime, you'd be serving a life sentence."
];

const dateIdeas = [
  "A quiet coffee date at that hidden botanical garden shop. ☕🌿",
  "Stargazing under the night sky with hot chocolate and cozy blankets. 🌌✨",
  "A sunset picnic at the beach, watching the waves roll in. 🌇🍕",
  "An evening walk around the downtown art district followed by ice cream. 🍦🎨",
  "A cozy movie night where we make homemade pizza and build a fort. 🎬🍕",
  "A playful arcade date, challenging each other to Mario Kart. 🎮🏎️",
  "A library date finding books for each other, followed by a warm tea. 📚🍂"
];

const romanticQuestions = [
  "What is our ultimate vibe? 🌅",
  "Pick our next adventure! 🗺️",
  "What is your absolute favorite dessert that I should buy you? 🍰",
  "Are we getting coffee, tea, or a huge dinner? 🍕",
  "If we went stargazing, what music should we play? 🎶"
];

// @desc    Generate Romantic Content using template engine
// @route   POST /api/ai/generate
// @access  Private
exports.generateContent = async (req, res) => {
  try {
    const { type, girlName, nickname, creatorName } = req.body;
    
    const nameVal = girlName || 'Name';
    const nickVal = nickname || nameVal;
    const creatorVal = creatorName || req.user.name;

    let result = '';

    switch (type) {
      case 'love_letter':
        const letterIndex = Math.floor(Math.random() * loveLetterTemplates.length);
        result = loveLetterTemplates[letterIndex]
          .replace(/{name}/g, nameVal)
          .replace(/{nickname}/g, nickVal)
          .replace(/{creatorName}/g, creatorVal);
        break;
      
      case 'compliment':
        result = compliments[Math.floor(Math.random() * compliments.length)];
        break;

      case 'date_ideas':
        // Return 3 random date ideas
        const shuffled = [...dateIdeas].sort(() => 0.5 - Math.random());
        result = shuffled.slice(0, 3);
        break;

      case 'question':
        result = romanticQuestions[Math.floor(Math.random() * romanticQuestions.length)];
        break;

      case 'caption':
        const captions = [
          `The day I met ${nameVal} changed everything.`,
          `Laughter is louder when shared with ${nickVal}.`,
          `Throwback to one of my favorite days with you.`,
          `Our vibes are simply unmatched. ✨`,
          `A special page for a special girl.`
        ];
        result = captions[Math.floor(Math.random() * captions.length)];
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid generation type' });
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
