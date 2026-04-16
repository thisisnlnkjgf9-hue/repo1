/* ═══════════════════════════════════════════════════════
   Panchakarma therapies & packages seed data
   ═══════════════════════════════════════════════════════ */

export const therapies = [
  {
    name: 'Snehan',
    slug: 'snehan',
    description: 'Full body oleation using medicated oils to pacify Vata & nourish tissues.',
    bestFor: ['Joint pain', 'Dry skin', 'Stress', 'Neurological issues'],
    duration: '45–60 min',
    priceInr: 499,
    icon: '🫗'
  },
  {
    name: 'Swedan (Steam Therapy)',
    slug: 'swedan',
    description: 'Herbal steam therapy to open channels and remove toxins.',
    bestFor: ['Ama', 'Stiffness', 'Obesity', 'Cold disorders'],
    duration: '15–20 min',
    priceInr: 399,
    icon: '♨️'
  },
  {
    name: 'Nasya',
    slug: 'nasya',
    description: 'Nasal administration of medicated oil for head & brain detox.',
    bestFor: ['Sinusitis', 'Migraine', 'Hair fall', 'Mental clarity'],
    duration: '20–30 min',
    priceInr: 399,
    icon: '💧'
  },
  {
    name: 'Shirodhara',
    slug: 'shirodhara',
    description: 'Continuous oil flow on forehead to calm nervous system.',
    bestFor: ['Stress', 'Anxiety', 'Insomnia', 'Hormonal imbalance'],
    duration: '45–60 min',
    priceInr: 599,
    icon: '🧘'
  },
  {
    name: 'Udvartan',
    slug: 'udvartan',
    description: 'Dry powder massage for fat metabolism & Kapha reduction.',
    bestFor: ['Obesity', 'Cellulite', 'PCOS', 'Lymphatic drainage'],
    duration: '30–45 min',
    priceInr: 499,
    icon: '✋'
  },
  {
    name: 'Basti',
    slug: 'basti',
    description: 'Medicated enema therapy – "Ardha Chikitsa" for Vata disorders. Types: Anuvasana (oil) and Niruha (decoction).',
    bestFor: ['Constipation', 'Arthritis', 'Neurological disorders'],
    duration: '30–45 min',
    priceInr: 499,
    icon: '🏺'
  }
];

export const therapyPackages = [
  {
    name: 'Quick Detox Starter',
    slug: 'quick-detox-starter',
    tagline: 'For first-time users',
    badge: '',
    includes: [
      { day: 'Day 1', therapies: ['Snehan', 'Swedan'] }
    ],
    totalSessions: 2,
    durationDays: 1,
    actualPriceInr: 898,
    offerPriceInr: 799,
    resultPromise: 'Try Panchakarma in one session',
    extras: [],
    bestFor: 'First-time experience',
    featured: false
  },
  {
    name: '3-Day Detox Reset',
    slug: '3-day-detox-reset',
    tagline: 'Most popular entry package',
    badge: 'Most Popular',
    includes: [
      { day: 'Day 1', therapies: ['Snehan', 'Swedan'] },
      { day: 'Day 2', therapies: ['Udvartan', 'Swedan'] },
      { day: 'Day 3', therapies: ['Nasya'] }
    ],
    totalSessions: 5,
    durationDays: 3,
    actualPriceInr: 2295,
    offerPriceInr: 1999,
    resultPromise: 'Feel lighter in 3 days',
    extras: [],
    bestFor: 'Visible lightness + digestion improvement',
    featured: true
  },
  {
    name: 'Stress Relief Therapy',
    slug: 'stress-relief-therapy',
    tagline: 'For anxiety / sleep issues',
    badge: '',
    includes: [
      { day: 'Sessions 1-2', therapies: ['Shirodhara'] },
      { day: 'Session 3', therapies: ['Nasya'] }
    ],
    totalSessions: 3,
    durationDays: 3,
    actualPriceInr: 1597,
    offerPriceInr: 1399,
    resultPromise: 'Better sleep in 2 sessions',
    extras: ['Sleep Score Improvement Tracker'],
    bestFor: 'Anxiety, sleep issues, urban stress',
    featured: false
  },
  {
    name: 'Weight Loss & PCOS Plan',
    slug: 'weight-loss-pcos',
    tagline: 'Your strongest Ayurvedic niche',
    badge: 'Trending',
    includes: [
      { day: 'Sessions 1-3', therapies: ['Udvartan'] },
      { day: 'Sessions 4-6', therapies: ['Swedan'] },
      { day: 'Session 7', therapies: ['Nasya'] }
    ],
    totalSessions: 7,
    durationDays: 7,
    actualPriceInr: 3096,
    offerPriceInr: 2699,
    resultPromise: 'Visible inch loss in 1 week',
    extras: ['Diet chart (Pathya-based)', 'Inch loss tracking'],
    bestFor: 'Weight loss, PCOS management',
    featured: true
  },
  {
    name: 'Vata Balance Package',
    slug: 'vata-balance',
    tagline: 'Premium + clinical positioning',
    badge: '',
    includes: [
      { day: 'Sessions 1-2', therapies: ['Snehan'] },
      { day: 'Sessions 3-4', therapies: ['Basti'] },
      { day: 'Session 5', therapies: ['Nasya'] }
    ],
    totalSessions: 5,
    durationDays: 5,
    actualPriceInr: 2395,
    offerPriceInr: 2099,
    resultPromise: 'Best for joint pain, anxiety & hormonal imbalance',
    extras: [],
    bestFor: 'Joint pain, anxiety, hormonal imbalance',
    featured: false
  },
  {
    name: '7-Day Complete Panchakarma',
    slug: '7-day-complete',
    tagline: 'Flagship package',
    badge: 'Premium',
    includes: [
      { day: 'Days 1-2', therapies: ['Snehan'] },
      { day: 'Days 1,3,5', therapies: ['Swedan'] },
      { day: 'Days 2,4', therapies: ['Udvartan'] },
      { day: 'Days 3,6', therapies: ['Nasya'] },
      { day: 'Day 4', therapies: ['Shirodhara'] },
      { day: 'Days 5,7', therapies: ['Basti'] }
    ],
    totalSessions: 12,
    durationDays: 7,
    actualPriceInr: 5390,
    offerPriceInr: 4499,
    resultPromise: 'Complete detox transformation in 7 days',
    extras: ['Free consultation', 'Daily WhatsApp follow-up', 'Detox progress report'],
    bestFor: 'Complete detoxification & rejuvenation',
    featured: true
  }
];

/* ═══════════════════════════════════════════════════════
   Weight Management Assessment Questions
   ═══════════════════════════════════════════════════════ */

export const digestionQuestions = [
  {
    id: 'dq1',
    prompt: 'How would you describe your appetite?',
    options: [
      { value: 'strong', label: 'Strong and regular', score: 3 },
      { value: 'irregular', label: 'Irregular', score: 2 },
      { value: 'low', label: 'Low / no hunger', score: 1 }
    ]
  },
  {
    id: 'dq2',
    prompt: 'Do you feel heaviness after meals?',
    options: [
      { value: 'always', label: 'Always', score: 1 },
      { value: 'sometimes', label: 'Sometimes', score: 2 },
      { value: 'rarely', label: 'Rarely', score: 3 }
    ]
  },
  {
    id: 'dq3',
    prompt: 'How often do you experience bloating or gas?',
    options: [
      { value: 'frequently', label: 'Frequently', score: 1 },
      { value: 'occasionally', label: 'Occasionally', score: 2 },
      { value: 'never', label: 'Never', score: 3 }
    ]
  },
  {
    id: 'dq4',
    prompt: 'How is your bowel movement?',
    options: [
      { value: 'regular', label: 'Regular and well-formed', score: 3 },
      { value: 'constipation', label: 'Constipation / hard stools', score: 1 },
      { value: 'loose', label: 'Loose stools', score: 2 }
    ]
  },
  {
    id: 'dq5',
    prompt: 'Do you feel sleepy or tired after eating?',
    options: [
      { value: 'yes-often', label: 'Yes, often', score: 1 },
      { value: 'sometimes', label: 'Sometimes', score: 2 },
      { value: 'no', label: 'No', score: 3 }
    ]
  }
];

export const lifestyleQuestions = [
  {
    id: 'lq1',
    prompt: 'What is your daily physical activity level?',
    options: [
      { value: 'active', label: 'Active (exercise daily)', score: 3 },
      { value: 'moderate', label: 'Moderate', score: 2 },
      { value: 'sedentary', label: 'Sedentary', score: 1 }
    ]
  },
  {
    id: 'lq2',
    prompt: 'How regular are your meal timings?',
    options: [
      { value: 'very-regular', label: 'Very regular', score: 3 },
      { value: 'sometimes-irregular', label: 'Sometimes irregular', score: 2 },
      { value: 'completely-irregular', label: 'Completely irregular', score: 1 }
    ]
  },
  {
    id: 'lq3',
    prompt: 'Do you skip meals?',
    options: [
      { value: 'often', label: 'Often', score: 1 },
      { value: 'sometimes', label: 'Sometimes', score: 2 },
      { value: 'never', label: 'Never', score: 3 }
    ]
  },
  {
    id: 'lq4',
    prompt: 'How would you describe your stress levels?',
    options: [
      { value: 'high', label: 'High', score: 1 },
      { value: 'moderate', label: 'Moderate', score: 2 },
      { value: 'low', label: 'Low', score: 3 }
    ]
  },
  {
    id: 'lq5',
    prompt: 'How much time do you spend sitting daily?',
    options: [
      { value: 'less-4', label: '< 4 hours', score: 3 },
      { value: '4-8', label: '4–8 hours', score: 2 },
      { value: 'more-8', label: '> 8 hours', score: 1 }
    ]
  }
];

export const sleepQuestions = [
  {
    id: 'sq1',
    prompt: 'How many hours do you sleep daily?',
    options: [
      { value: '7-8', label: '7–8 hours', score: 3 },
      { value: '5-6', label: '5–6 hours', score: 2 },
      { value: 'less-5', label: 'Less than 5 hours', score: 1 }
    ]
  },
  {
    id: 'sq2',
    prompt: 'Do you fall asleep easily?',
    options: [
      { value: 'yes', label: 'Yes', score: 3 },
      { value: 'takes-time', label: 'Takes time', score: 2 },
      { value: 'difficulty', label: 'Difficulty sleeping', score: 1 }
    ]
  },
  {
    id: 'sq3',
    prompt: 'Do you wake up feeling refreshed?',
    options: [
      { value: 'yes', label: 'Yes', score: 3 },
      { value: 'sometimes', label: 'Sometimes', score: 2 },
      { value: 'no', label: 'No', score: 1 }
    ]
  },
  {
    id: 'sq4',
    prompt: 'Do you wake up during the night?',
    options: [
      { value: 'frequently', label: 'Frequently', score: 1 },
      { value: 'occasionally', label: 'Occasionally', score: 2 },
      { value: 'rarely', label: 'Rarely', score: 3 }
    ]
  },
  {
    id: 'sq5',
    prompt: 'What is your usual sleep time?',
    options: [
      { value: 'before-10', label: 'Before 10 PM', score: 3 },
      { value: '10-12', label: '10 PM – 12 AM', score: 2 },
      { value: 'after-12', label: 'After 12 AM', score: 1 }
    ]
  }
];
