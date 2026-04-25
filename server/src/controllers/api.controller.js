import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { isMongoConnected } from '../config/db.js';
import { GOOGLE_CLIENT_ID, JWT_SECRET, RAZORPAY_KEY_ID } from '../config/env.js';
import {
  blogs,
  bookings,
  carts,
  dietTips,
  doctors,
  heroSlides,
  orders,
  podcasts,
  prakritiQuestions,
  products,
  reportUploads,
  symptomRemedies,
  users
} from '../data/store.js';
import { ChatMessage } from '../models/chatMessage.model.js';
import { Feedback } from '../models/feedback.model.js';
import { Booking } from '../models/booking.model.js';
import { Order } from '../models/order.model.js';
import { ReportUpload } from '../models/reportUpload.model.js';
import { User } from '../models/user.model.js';
import { SymptomSession } from '../models/symptomSession.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Product } from '../models/product.model.js';
import { Blog } from '../models/blog.model.js';
import { HeroSlide } from '../models/heroSlide.model.js';
import { runGeminiJson, runGeminiText } from '../services/gemini.service.js';
import { createOrder, verifyPaymentSignature, isRazorpayConfigured } from '../services/razorpay.service.js';
import {
  findRecommendedProducts,
  getRecommendations,
  pickPrakriti,
  calculatePrakritiDetails
} from '../services/recommendation.service.js';
import { fallbackDiseaseQuestions, normalizeAnswerText } from '../services/symptom.service.js';

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

/* ───── health ───── */
export function health(_req, res) {
  res.json({ status: 'ok', service: 'nouryum-api' });
}

/* ───── auth ───── */
export async function authGoogle(req, res) {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required.' });
  }

  let name = 'User';
  let email = 'user@nouryum.com';
  let picture = '';
  let googleId = '';

  /* Verify the Google ID token if client ID is configured */
  if (googleClient) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      name = payload.name || name;
      email = payload.email || email;
      picture = payload.picture || '';
      googleId = payload.sub || '';
    } catch (err) {
      return res.status(401).json({ message: 'Invalid Google token.' });
    }
  } else {
    /* Dev mode: decode JWT payload without verification */
    try {
      const parts = credential.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        name = payload.name || payload.given_name || name;
        email = payload.email || email;
        picture = payload.picture || '';
        googleId = payload.sub || '';
      }
    } catch {
      /* Keep defaults */
    }
  }

  /* Find or create user */
  let user;
  if (isMongoConnected()) {
    user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, authProvider: 'google' });
    }
  } else {
    user = users.find((u) => u.email === email);
    if (!user) {
      user = { id: `u_${Date.now()}`, name, email, prakriti: null, healthProfile: {} };
      users.push(user);
    }
  }

  const userId = user._id?.toString() || user.id || 'u1';

  /* Issue JWT session token */
  const sessionToken = jwt.sign(
    { userId, name, email, picture },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    user: { id: userId, name, email, picture, prakriti: user.prakriti || null },
    sessionToken
  });
}

/* ───── auth: get current user ───── */
export async function getMe(req, res) {
  const jwtUser = req.user;

  if (isMongoConnected()) {
    let dbUser = await User.findById(jwtUser.userId).lean().catch(() => null);

    if (!dbUser && jwtUser.email) {
      // Recover from stale token IDs created while app was in in-memory mode.
      dbUser = await User.findOne({ email: jwtUser.email }).lean().catch(() => null);
    }

    if (dbUser) {
      return res.json({
        user: {
          id: dbUser._id.toString(),
          userId: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          prakriti: dbUser.prakriti || null,
          phone: dbUser.phone || '',
          gender: dbUser.gender || '',
          age: dbUser.age || 0
        }
      });
    }
  }

  // In-memory mode: merge prakriti from users array
  const memUser = users.find((u) => u.id === jwtUser.userId || u.email === jwtUser.email);
  return res.json({
    user: {
      ...jwtUser,
      id: jwtUser.userId,
      prakriti: memUser?.prakriti || null
    }
  });
}

/* ───── prakriti ───── */
export function getPrakritiQuestions(_req, res) {
  res.json({ questions: prakritiQuestions });
}

export async function submitPrakriti(req, res) {
  const { userId, answers } = req.body;
  const effectiveUserId = userId || req.user?.userId;

  if (!effectiveUserId || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'userId and answers are required.' });
  }

  const prakriti = pickPrakriti(answers);
  const prakritiDetails = calculatePrakritiDetails(answers);

  if (isMongoConnected()) {
    const updated = await User.findByIdAndUpdate(
      effectiveUserId,
      { prakriti },
      { new: true }
    ).catch(() => null);

    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ prakriti, prakritiDetails, user: { id: updated._id.toString(), name: updated.name, email: updated.email, prakriti: updated.prakriti } });
  }

  // In-memory mode: find by id OR email (JWT userId may not match in-mem id)
  let user = users.find((item) => item.id === effectiveUserId);
  if (!user) {
    // Try matching by email from JWT
    const jwtEmail = req.user?.email;
    user = users.find((item) => item.email === jwtEmail);
  }
  if (!user) {
    // Upsert: create a new in-memory record so prakriti is saved for this session
    user = { id: effectiveUserId, name: req.user?.name || 'User', email: req.user?.email || '', prakriti: null, healthProfile: {} };
    users.push(user);
  }
  user.prakriti = prakriti;

  return res.json({ prakriti, prakritiDetails, user });
}

/* ───── diet ───── */
const seasonalFallbackTips = {
  summer: [
    'Prefer hydrating foods like cucumber, coconut water, and bottle gourd.',
    'Use cooling herbs such as mint and fennel after lunch.',
    'Avoid heavy fried meals in the afternoon heat.'
  ],
  monsoon: [
    'Choose warm, freshly cooked meals and avoid stale food.',
    'Use ginger, black pepper, and cumin to support digestion.',
    'Limit raw salads on rainy days.'
  ],
  winter: [
    'Include warm soups, ghee in moderation, and seasonal root vegetables.',
    'Use digestive spices like cinnamon and ajwain in meals.',
    'Have protein-rich breakfasts to support energy and warmth.'
  ],
  spring: [
    'Prefer light grains, steamed vegetables, and lentil soups.',
    'Reduce excess dairy and sugar to avoid heaviness.',
    'Start mornings with warm water and a short walk.'
  ]
};

export async function getDietTips(req, res) {
  const prakriti = (req.query.prakriti || 'vata').toLowerCase().split('-')[0];
  const fallbackTips = dietTips[prakriti] || [];

  const fallback = {
    prakriti,
    tips: fallbackTips
  };

  const aiPayload = await runGeminiJson(
    `Generate 6 Āyurvedic diet guidance points for a person of ${prakriti} Prakṛti. Write in the style of a classical Svasthavrtta textbook. Use precise Sanskrit terminology with diacritics and a brief parenthetical explanation for each key term on first use (e.g., "Snigdhāhāra (unctuous / oily food)..."). Distinguish Pathya (beneficial) and Apathya (to be avoided) where relevant. Return only JSON with keys prakriti and tips. tips must be an array of 6 strings, each 1–2 sentences, authoritative and specific.`,
    fallback
  );

  return res.json({
    prakriti,
    tips: Array.isArray(aiPayload.tips) && aiPayload.tips.length ? aiPayload.tips : fallbackTips
  });
}

export async function getSeasonalDietTips(req, res) {
  const season = (req.query.season || 'summer').toLowerCase();
  const fallbackTips = seasonalFallbackTips[season] || seasonalFallbackTips.summer;

  const fallback = {
    season,
    tips: fallbackTips
  };

  const aiPayload = await runGeminiJson(
    `Generate 6 Āyurvedic seasonal diet and lifestyle guidance points for the ${season} season (Ṛtu) in the style of a classical Svasthavrtta / Ṛtucaryā textbook. For each point: use precise Sanskrit terminology with diacritics and a brief parenthetical plain-language explanation (e.g., "Mandāgni (reduced digestive fire)..."). Distinguish Pathya (what is beneficial and to be included) from Apathya (what is detrimental and to be avoided). Describe the bodily effects of the season on Doṣas, Agni, and overall Bala (strength). Return only JSON with keys season and tips. tips must be an array of exactly 6 strings, each 2–3 sentences long, written in a composed, authoritative register.`,
    fallback
  );

  return res.json({
    season,
    tips: Array.isArray(aiPayload.tips) && aiPayload.tips.length ? aiPayload.tips : fallbackTips
  });
}

/* ───── symptom legacy ───── */
export function analyzeSymptom(req, res) {
  const { symptom } = req.body;
  const normalized = (symptom || '').toLowerCase().trim();

  const remedies = symptomRemedies[normalized] || {
    title: 'Natural Daily Remedies',
    remedies: [
      {
        heading: 'Hydration and warm meals',
        content: 'Stay hydrated and avoid very cold meals, especially at night.'
      },
      {
        heading: 'Breath work',
        content: 'Practice 5-10 minutes of slow breathing to regulate stress response.'
      }
    ]
  };

  return res.json(remedies);
}

/* ───── AI search ───── */
export async function aiSearch(req, res) {
  const { query = '', prakriti = 'vata' } = req.body;
  if (!query.trim()) {
    return res.status(400).json({ message: 'query is required.' });
  }

  const fallback = {
    summary: `${query} can be understood through an Ayurvedic lens by observing dosha vriddhi (aggravation), agni status, and possible ama accumulation.`,
    ayurvedicAssessment: {
      probableDoshaImbalance: 'Vata-Pitta imbalance',
      agniStatus: 'Vishama Agni (irregular digestive fire)',
      amaSignals: [
        'Bloating or heaviness after meals',
        'Low clarity/mental fog',
        'Variable appetite or sluggish digestion'
      ]
    },
    pathyaSuggestions: [
      'Prefer warm, freshly cooked, easy-to-digest meals.',
      'Use deepana-pachana spices in mild quantity (jeera, ajwain, dry ginger).',
      'Follow regular meal timing and avoid late-night heavy food.'
    ],
    apathyaAvoid: [
      'Cold, stale, refrigerated foods in excess',
      'Irregular sleep and meal schedule',
      'Frequent overeating and highly processed snacks'
    ],
    dinacharyaTips: [
      'Wake and sleep at consistent times.',
      'Take a short post-meal walk for better digestion.',
      'Include 8-12 minutes of nadi-shodhana or deep breathing daily.'
    ],
    caution: 'Seek clinical consultation for persistent or severe symptoms.',
    followUpQuestions: [
      'How long have you had these symptoms?',
      'What time of day is the symptom worst?',
      'Do you have any existing medical condition?'
    ]
  };

  const aiPayload = await runGeminiJson(
    `You are an authoritative Āyurvedic wellness scholar. For the disease / health query: "${query}", compose a structured Svasthavrtta-style analysis. Return ONLY JSON with keys: summary, ayurvedicAssessment, pathyaSuggestions, apathyaAvoid, dinacharyaTips, caution, followUpQuestions.

summary: 3–5 sentences written in the register of a classical Āyurvedic textbook. Name the probable Doṣa vṛddhi (aggravation), Agni status (e.g., Viṣama Agni — irregular digestive fire), and Āma sañcaya (accumulation of metabolic residue). Include brief plain-language parenthetical explanations for each Sanskrit term on first use.

ayurvedicAssessment: object with keys probableDoshaImbalance (string with Sanskrit term + explanation), agniStatus (string), amaSignals (array of 3–4 concise observations stating the Āyurvedic sign and its plain meaning).

pathyaSuggestions: array of 4–5 items. Label each "Pathya —" and write in the Svasthavrtta format: specify the Sanskrit category (e.g., "Ushṇāhāra (warm food)", "Deepana-Pachana (digestive-stimulating) spices") followed by a practical 1–2 sentence instruction.

apathyaAvoid: array of 4–5 items. Label each "Apathya —" and name the category in Sanskrit with explanation, then state what to avoid and why in Āyurvedic terms.

dinacharyaTips: array of 4–5 items written as Dīnacaryā (daily regimen) prescriptions, referencing classical practices (Abhyaṅga, Vyāyāma, Nidrā, etc.) with parenthetical explanations.

followUpQuestions: exactly 3 clinically relevant questions.
caution: one sentence directing the person to consult a certified Āyurvedic physician for persistent complaints. Keep the entire output safe and non-diagnostic.`,
    fallback
  );

  return res.json({
    ...aiPayload,
    productRecommendations: await findRecommendedProducts(query, prakriti),
    blogs: blogs.slice(0, 2)
  });
}

/* ───── AI chat ───── */
export async function aiChat(req, res) {
  const { userId = 'u1', disease = '', message = '', history = [] } = req.body;
  if (!message.trim()) {
    return res.status(400).json({ message: 'message is required.' });
  }

  const historyText = history
    .slice(-6)
    .map((item) => `${item.role}: ${item.content}`)
    .join('\n');

  const fallbackReply =
    'Based on your symptoms, maintain warm meals, fixed sleep timing, and gentle breathing routines. Share symptom duration and severity for personalized next steps.';

  const reply = await runGeminiText(
    `You are a safe Ayurveda support assistant. Keep response under 90 words. Disease: ${disease}.\nConversation:\n${historyText}\nUser: ${message}`,
    fallbackReply
  );

  if (isMongoConnected()) {
    await ChatMessage.create({ userId, disease, message, reply });
  }

  return res.json({ reply });
}

/* ───── symptom questions ───── */
export async function generateSymptomQuestions(req, res) {
  const { disease = '' } = req.body;
  if (!disease.trim()) {
    return res.status(400).json({ message: 'disease is required.' });
  }

  const fallback = {
    disease,
    questions: fallbackDiseaseQuestions(disease)
  };

  const aiPayload = await runGeminiJson(
    `Generate 6 concise symptom-assessment questions for disease: ${disease}. Return only JSON with keys disease and questions. questions is array of {id,prompt,type,options}. type must be single-choice. each options array should have 3-5 short values.`,
    fallback
  );

  const questions = Array.isArray(aiPayload.questions) && aiPayload.questions.length
    ? aiPayload.questions
    : fallback.questions;

  return res.json({ disease, questions });
}

/* ───── disease analysis ───── */
export async function analyzeDisease(req, res) {
  const { userId = 'u1', disease = '', answers = [], prakriti = 'vata' } = req.body;

  if (!disease.trim()) {
    return res.status(400).json({ message: 'disease is required.' });
  }

  const answerSummary = normalizeAnswerText(answers);
  const fallback = {
    title: `Natural support plan for ${disease}`,
    riskLevel: 'medium',
    ayurvedicNarrative:
      `${disease} can often be interpreted as a pattern of dosha vriddhi (dosha aggravation) with reduced agni bala (digestive-metabolic strength) and mild ama sanchaya (toxin-like metabolic residue). In practical terms, this can show up as irregular appetite, post-meal heaviness, low clarity, and inconsistent energy. A chikitsa approach focuses on langhana (lightening), deepana-pachana (supporting digestive fire and metabolism), and gentle nidana-parivarjana (removing triggering habits). The aim is not instant suppression but steady restoration of samya avastha (functional balance) through ahara (diet), vihara (lifestyle), and dinacharya (daily rhythm).`,
    ayurvedicAssessment: {
      probableDoshaImbalance: 'Vata-Pitta imbalance',
      agniStatus: 'Vishama-Manda Agni (irregular and mildly low digestive fire)',
      amaSignals: [
        'Bloating/heaviness after meals',
        'Low digestive clarity and gas tendency',
        'Variable appetite or sluggish metabolism',
        'Coated tongue sensation or post-meal dullness',
        'Afternoon energy dip with mental fog'
      ]
    },
    remedyPlan: [
      {
        heading: 'Sleep and daily rhythm',
        content:
          'Sleep before 10:30-11 PM and wake at a consistent time to stabilize vata and support hormonal rhythm. Keep dinner light and finish 2.5-3 hours before bed to protect nocturnal agni repair.'
      },
      {
        heading: 'Ahara with agni support',
        content:
          'Prefer ushna (warm), freshly cooked, moderately unctuous meals. Include jeera, dhania, dry ginger, or ajwain in small quantities to aid deepana-pachana and reduce ama tendency.'
      },
      {
        heading: 'Vata-shamana stress reset',
        content:
          'Practice 10-15 minutes of nadi-shodhana, bhramari, or guided relaxation twice daily. Gentle grounding reduces rajasic overstimulation and helps restore manovaha srotas balance.'
      },
      {
        heading: 'Meal timing discipline',
        content:
          'Follow fixed meal windows and avoid frequent snacking to protect jatharagni consistency. Largest meal near midday (when agni is naturally stronger) often improves digestion and steadier energy.'
      },
      {
        heading: 'Mridu vyayama and recovery',
        content:
          'Choose gentle-to-moderate movement like brisk walking, yoga flow, or stretching rather than exhaustive activity during symptom flare. This supports circulation without aggravating vata or pitta.'
      }
    ],
    dietTips: [
      'Prefer warm, freshly cooked meals over refrigerated leftovers to reduce ama load.',
      'Start lunch with a small portion of ginger-lime-salt (if tolerated) for deepana support.',
      'Use mung-based soups, soft khichdi, and lightly spiced vegetable stews on heavy days.',
      'Sip warm water or cumin-coriander-fennel infusion through the day instead of iced drinks.',
      'Keep dinner lighter than lunch and avoid dense sweets late night.',
      'Observe satmya (individual tolerance) and reduce foods that repeatedly trigger bloating or burning.'
    ],
    lifestyleTips: [
      'Walk 20-30 minutes daily, ideally after meals for better post-prandial digestion.',
      'Maintain consistent sleep/wake timing to reduce circadian disruption.',
      'Reduce late-evening screen stimulation and bright light exposure.',
      'Practice abhyanga (warm oil self-massage) 3-4 times weekly if suitable for your constitution.',
      'Include brief mindfulness pauses between tasks to lower stress-driven vata aggravation.',
      'Avoid suppressing natural urges (vegavidharana), which can disturb systemic balance.'
    ],
    pathyaSuggestions: [
      'Prefer ushna (warm), freshly cooked laghu (light) meals.',
      'Use deepana-pachana spices like jeera, ajwain, and dry ginger in moderation.',
      'Keep meal and sleep timings consistent to stabilize agni.',
      'Choose seasonal produce and simple one-pot meals during symptom flares.',
      'Use small portions with mindful chewing to improve grahana (assimilation).'
    ],
    apathyaAvoid: [
      'Cold, stale, refrigerated foods in excess',
      'Irregular routine, late-night heavy meals',
      'Frequent processed or packaged snacks',
      'Excess caffeine on empty stomach and repeated meal skipping',
      'Overexertion, sleep deprivation, and highly erratic daily schedule'
    ],
    dinacharyaTips: [
      'Wake and sleep at fixed times.',
      'Take a short walk after lunch/dinner.',
      'Practice nadi-shodhana or deep breathing for 8-12 minutes daily.',
      'Take largest meal around midday and keep evening meals lighter.',
      'Reserve 15 minutes of quiet wind-down before bedtime.'
    ],
    caution: 'If symptoms worsen or persist, consult a certified Ayurvedic physician.'
  };

  const aiPayload = await runGeminiJson(
    `You are an authoritative Āyurvedic wellness scholar composing a Svasthavrtta-style clinical assessment. Patient disease / condition: ${disease}. Patient answers to symptom questions: ${answerSummary}.

Return ONLY JSON with keys: title, riskLevel, ayurvedicNarrative, ayurvedicAssessment, remedyPlan, dietTips, lifestyleTips, pathyaSuggestions, apathyaAvoid, dinacharyaTips, caution.

title: a dignified, specific clinical title for this assessment (e.g., "Āyurvedic Assessment for Chronic Viṣama Agni with Vāta-Pitta Imbalance").

riskLevel: one of "low" | "medium" | "high".

ayurvedicNarrative: 150–200 words written in the register of a classical Svasthavrtta or Ṛtucaryā textbook chapter. Must include: probable Doṣa vṛddhi (aggravation), Agni avasthā (state of digestive fire), Āma sañcaya (metabolic residue accumulation), affected Srotas (channels), and the Cikitsā sūtra (treatment principle). Provide a brief parenthetical plain-language explanation for every Sanskrit term on first use.

ayurvedicAssessment: object with: probableDoshaImbalance (Sanskrit name + plain meaning), agniStatus (Sanskrit type + plain meaning), amaSignals (array of 4–5 items — each stating the Āyurvedic clinical sign and its everyday observable manifestation).

remedyPlan: array of 5–6 objects {heading, content}. Each heading should be an Āyurvedic category (e.g., "Ahāra Vidhāna (Dietary Regimen)", "Vyāyāma (Exercise)", "Nidrā (Sleep Regimen)", "Shodhanā or Śamana Cikitsā"). Each content: 2–3 authoritative sentences using Pathya/Apathya framing and classical terminology with parenthetical explanations.

dietTips: array of 6 items. Format each as: "Pathya — [Sanskrit category with explanation]: [specific instruction]." or "Apathya — [Sanskrit category]: [what to avoid and why in Āyurvedic terms]."

lifestyleTips: array of 6 items in Dīnacaryā (daily regimen) and Ṛtucaryā (seasonal regimen) style, naming classical practices (Abhyaṅga, Vyāyāma, Prāṇāyāma, etc.) with parenthetical explanations.

pathyaSuggestions: array of 5 items, each starting with "Pathya —" and written with classical Āyurvedic specificity.

apathyaAvoid: array of 5 items, each starting with "Apathya —" and specifying the Āyurvedic rationale for avoidance.

dinacharyaTips: array of 5 items structured as classical Dīnacaryā prescriptions.

caution: one composed sentence recommending consultation with a certified Āyurvedic physician for persistent or severe complaints.

Keep the entire output safe, non-diagnostic, and clinically responsible.`,
    fallback
  );

  const productRecommendations = await findRecommendedProducts(disease, prakriti);
  const blogRecommendations = blogs
    .filter((blog) => {
      const merged = `${blog.title} ${blog.excerpt}`.toLowerCase();
      const query = disease.toLowerCase();
      return merged.includes(query) || blog.tags.includes('lifestyle') || blog.tags.includes('stress');
    })
    .slice(0, 3);

  const analysis = {
    ...fallback,
    ...aiPayload,
    productRecommendations,
    blogRecommendations
  };

  if (isMongoConnected()) {
    await SymptomSession.create({
      userId,
      disease,
      generatedQuestions: [],
      answers,
      analysis
    });
  }

  return res.json(analysis);
}

/* ───── recommendations ───── */
export async function recommendations(req, res) {
  const { prakriti, symptom } = req.query;
  res.json(await getRecommendations(prakriti, symptom));
}

/* ───── doctors ───── */
export async function getDoctors(_req, res) {
  if (isMongoConnected()) {
    const docs = await Doctor.find().lean();
    const formatted = docs.map(d => ({ ...d, id: d._id.toString() }));
    return res.json({ doctors: formatted });
  }
  res.json({ doctors });
}

export async function createBooking(req, res) {
  const {
    userId,
    doctorId,
    slot,
    paymentMethod,
    customerName,
    customerEmail,
    customerPhone,
    razorpayOrderId = '',
    razorpayPaymentId = ''
  } = req.body;

  if (!doctorId || !slot || !customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({
      message: 'doctorId, slot, customerName, customerEmail and customerPhone are required.'
    });
  }

  let doctor;
  if (isMongoConnected()) {
    try {
      doctor = await Doctor.findById(doctorId).lean();
    } catch {}
  }
  if (!doctor) {
    doctor = doctors.find((d) => d.id === doctorId);
  }

  if (!doctor) {
    return res.status(404).json({ message: 'Doctor not found.' });
  }

  const effectiveUserId = userId || req.user?.userId || 'u1';

  const booking = {
    id: `bk_${Date.now()}`,
    userId: effectiveUserId,
    doctorId,
    doctorName: doctor.name,
    slot,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod: paymentMethod || 'UPI',
    razorpayOrderId,
    razorpayPaymentId,
    fee: doctor.consultationFee,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected()) {
    const savedBooking = await Booking.create(booking);
    return res.status(201).json({
      booking: {
        ...booking,
        id: savedBooking._id.toString()
      }
    });
  }

  bookings.push(booking);
  return res.status(201).json({ booking });
}

/* ───── products ───── */
export async function getProducts(req, res) {
  const { search = '', category = '', prakriti = '' } = req.query;
  const normalizedSearch = search.toLowerCase();
  const normalizedCategory = category.toLowerCase();
  const normalizedPrakriti = prakriti.toLowerCase();

  let prods = products;
  if (isMongoConnected()) {
    const docs = await Product.find().lean();
    prods = docs.map(p => ({ ...p, id: p._id.toString() }));
  }

  const filtered = prods.filter((product) => {
    const nameMatch = product.name ? product.name.toLowerCase().includes(normalizedSearch) : false;
    const searchMatch = !normalizedSearch || nameMatch;
    const categoryMatch = !normalizedCategory || product.category === normalizedCategory;
    const tagsMatch = product.tags ? product.tags.some(t => t.toLowerCase() === normalizedPrakriti) : false;
    const prakritiMatch = !normalizedPrakriti || tagsMatch;

    return searchMatch && categoryMatch && prakritiMatch;
  });

  res.json({ products: filtered });
}

/* ───── cart ───── */
export async function getCart(req, res) {
  const { userId } = req.params;
  const cart = carts[userId] || [];

  const enriched = await Promise.all(
    cart.map(async (item) => {
      let product;
      if (isMongoConnected()) {
        try {
          product = await Product.findById(item.productId).lean();
        } catch {}
      }
      if (!product) {
        product = products.find((p) => p.id === item.productId);
      }

      return {
        ...item,
        name: product ? product.name : 'Unknown',
        priceInr: product ? product.priceInr : 0,
        image: product ? product.image : ''
      };
    })
  );

  res.json({ cart: enriched });
}

export async function addToCart(req, res) {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'userId and productId are required.' });
  }

  let product;
  if (isMongoConnected()) {
    try {
      product = await Product.findById(productId).lean();
    } catch {}
  }
  if (!product) {
    product = products.find((item) => item.id === productId);
  }

  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  if (!carts[userId]) {
    carts[userId] = [];
  }

  const existing = carts[userId].find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity || 1;
  } else {
    carts[userId].push({ productId, quantity: quantity || 1 });
  }

  return res.status(201).json({ cart: carts[userId] });
}

export function removeFromCart(req, res) {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'userId and productId are required.' });
  }

  if (!carts[userId]) {
    return res.json({ cart: [] });
  }

  carts[userId] = carts[userId].filter((item) => item.productId !== productId);
  return res.json({ cart: carts[userId] });
}

/* ───── checkout ───── */
export async function checkout(req, res) {
  const {
    userId,
    customerName = 'Unknown',
    contactNumber = '',
    address = '',
    pincode = '',
    paymentMethod = 'razorpay',
    razorpayOrderId = '',
    razorpayPaymentId = '',
    razorpaySignature = ''
  } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required.' });
  }

  if (!isRazorpayConfigured()) {
    return res.status(503).json({ message: 'Payment gateway is not configured.' });
  }

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ message: 'Successful Razorpay payment is required before checkout.' });
  }

  const isPaymentValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isPaymentValid) {
    return res.status(400).json({ message: 'Payment verification failed. Order was not created.' });
  }

  const cart = carts[userId] || [];
  if (!cart.length) {
    return res.status(400).json({ message: 'Cart is empty.' });
  }

  const lineItemsList = await Promise.all(
    cart.map(async (item) => {
      let product;
      if (isMongoConnected()) {
        try {
          product = await Product.findById(item.productId).lean();
        } catch {}
      }
      if (!product) {
        product = products.find((p) => p.id === item.productId);
      }

      if (!product) {
        return null;
      }

      return {
        productId: product.id || product._id.toString(),
        name: product.name,
        quantity: item.quantity,
        unitPriceInr: product.priceInr,
        totalInr: product.priceInr * item.quantity
      };
    })
  );

  const lineItems = lineItemsList.filter(Boolean);

  const totalInr = lineItems.reduce((sum, item) => sum + item.totalInr, 0);

  const order = {
    id: `ord_${Date.now()}`,
    userId,
    customerName,
    contactNumber,
    address,
    pincode,
    status: 'paid',
    shipmentStatus: 'packed',
    paymentMethod,
    razorpayOrderId,
    razorpayPaymentId,
    createdAt: new Date().toISOString(),
    lineItems,
    totalInr
  };

  if (isMongoConnected()) {
    const savedOrder = await Order.create({
      userId,
      customerName,
      contactNumber,
      address,
      pincode,
      status: order.status,
      shipmentStatus: order.shipmentStatus,
      paymentMethod,
      razorpayOrderId,
      razorpayPaymentId,
      lineItems,
      totalInr
    });

    carts[userId] = [];

    return res.status(201).json({
      order: {
        ...order,
        id: savedOrder._id.toString()
      }
    });
  }

  if (!orders[userId]) {
    orders[userId] = [];
  }
  orders[userId].push(order);
  carts[userId] = [];

  return res.status(201).json({ order });
}

export async function getOrders(req, res) {
  const { userId } = req.params;

  if (isMongoConnected()) {
    const mongoOrders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json({
      orders: mongoOrders.map((item) => ({
        id: item._id.toString(),
        userId: item.userId,
        customerName: item.customerName,
        contactNumber: item.contactNumber,
        address: item.address,
        pincode: item.pincode,
        status: item.status,
        shipmentStatus: item.shipmentStatus,
        paymentMethod: item.paymentMethod,
        razorpayOrderId: item.razorpayOrderId || '',
        razorpayPaymentId: item.razorpayPaymentId || '',
        lineItems: item.lineItems,
        totalInr: item.totalInr,
        createdAt: item.createdAt
      }))
    });
  }

  res.json({ orders: orders[userId] || [] });
}

export async function getBookings(req, res) {
  const { userId } = req.params;

  if (isMongoConnected()) {
    const mongoBookings = await Booking.find({ userId }).sort({ createdAt: -1 }).lean();
    const formatted = mongoBookings.map(b => ({ ...b, id: b._id.toString() }));
    return res.json({ bookings: formatted });
  }

  const memBookings = bookings.filter(b => b.userId === userId);
  return res.json({ bookings: memBookings });
}

/* ───── payments (Razorpay) ───── */
export async function createPaymentOrder(req, res) {
  const { amount, receipt = 'rcpt_nouryum' } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Valid amount is required.' });
  }

  if (!isRazorpayConfigured()) {
    return res.status(503).json({ message: 'Payment gateway is not configured.' });
  }

  try {
    const order = await createOrder(amount, receipt);
    return res.json({
      order,
      key: RAZORPAY_KEY_ID
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create payment order.' });
  }
}

export function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!isRazorpayConfigured()) {
    return res.status(503).json({ message: 'Payment gateway is not configured.' });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Payment details are required.' });
  }

  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment verification failed.' });
  }

  return res.json({ success: true, message: 'Payment verified.' });
}

/* ───── blogs ───── */
export async function getBlogs(_req, res) {
  if (isMongoConnected()) {
    const allBlogs = await Blog.find().sort({ createdAt: -1 }).lean();
    const formatted = allBlogs.map((b) => ({ ...b, id: b._id.toString() }));
    return res.json({ blogs: formatted });
  }

  return res.json({ blogs });
}

export async function getBlogById(req, res) {
  if (!isMongoConnected()) {
    const blog = blogs.find((item) => item.id === req.params.id);
    if (blog) return res.json({ blog });
    return res.status(404).json({ message: 'Blog not found.' });
  }

  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (blog) return res.json({ blog: { ...blog, id: blog._id.toString() } });
  } catch {
    // Invalid id format or cast error
  }
  return res.status(404).json({ message: 'Blog not found.' });
}

/* ───── podcasts ───── */
export function getPodcasts(_req, res) {
  res.json({ podcasts });
}

/* ───── hero slides ───── */
export async function getHeroSlides(_req, res) {
  if (isMongoConnected()) {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    return res.json({
      heroSlides: slides.map((slide) => ({
        id: slide._id.toString(),
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        image: slide.image || '',
        order: Number(slide.order) || 0,
        isActive: Boolean(slide.isActive)
      }))
    });
  }

  const activeSlides = heroSlides
    .filter((slide) => slide.isActive !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  return res.json({ heroSlides: activeSlides });
}

/* ───── labs ───── */
export function getLabPackage(_req, res) {
  res.json({
    package: {
      id: 'report-upload',
      title: 'Upload Previous Medical Report',
      tests: []
    }
  });
}

export async function uploadMedicalReport(req, res) {
  const { userId, name, email, reportFileType, reportFileSize } = req.body;
  const reportFileName = req.file ? (req.file.cloudUrl || `/uploads/${req.file.filename}`) : (req.body.reportFileName || '');

  if (!name || !email || !reportFileName) {
    return res.status(400).json({ message: 'name, email and reportFileName/file are required.' });
  }

  const payload = {
    userId: userId || req.user?.userId || 'u1',
    name,
    email,
    reportFileName,
    reportFileType: reportFileType || 'application/octet-stream',
    reportFileSize: Number(reportFileSize) || 0,
    createdAt: new Date().toISOString()
  };

  if (isMongoConnected()) {
    const saved = await ReportUpload.create(payload);
    return res.status(201).json({
      report: {
        ...payload,
        id: saved._id.toString()
      }
    });
  }

  const memoryReport = {
    ...payload,
    id: `rep_${Date.now()}`
  };
  reportUploads.unshift(memoryReport);

  return res.status(201).json({
    report: memoryReport
  });
}

/* ───── feedback ───── */
const inMemoryFeedbacks = [
  { id: 'f2', name: 'Zara Khan', rating: 5, comment: 'Booking a doctor appointment was so easy. The Ayurvedic approach really works for my sleep issues.', createdAt: '2025-12-15' },
  { id: 'f3', name: 'Rohit Mehra', rating: 4, comment: 'Great product selection and the AI symptom checker gave me helpful insights. Highly recommend.', createdAt: '2026-01-02' }
];

export async function getFeedbacks(_req, res) {
  if (isMongoConnected()) {
    try {
      const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(50);
      return res.json({ feedbacks });
    } catch {
      /* fall through to in-memory */
    }
  }

  return res.json({ feedbacks: inMemoryFeedbacks });
}

export async function submitFeedback(req, res) {
  const { name, rating, comment } = req.body;

  if (!name || !rating) {
    return res.status(400).json({ message: 'name and rating are required.' });
  }

  if (isMongoConnected()) {
    try {
      const feedback = await Feedback.create({ name, rating: Number(rating), comment: comment || '' });
      return res.status(201).json({ feedback });
    } catch {
      /* fall through */
    }
  }

  const feedback = {
    id: `f_${Date.now()}`,
    name,
    rating: Number(rating),
    comment: comment || '',
    createdAt: new Date().toISOString()
  };
  inMemoryFeedbacks.unshift(feedback);
  return res.status(201).json({ feedback });
}

