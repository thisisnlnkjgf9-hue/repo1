import { Therapy } from '../models/therapy.model.js';
import { TherapyPackage } from '../models/therapyPackage.model.js';
import { TherapyBooking } from '../models/therapyBooking.model.js';
import { ReportUpload } from '../models/reportUpload.model.js';
import { WeightAssessment } from '../models/weightAssessment.model.js';
import { WeightProgress } from '../models/weightProgress.model.js';
import { User } from '../models/user.model.js';
import { Doctor } from '../models/doctor.model.js';
import { Product } from '../models/product.model.js';
import { runGeminiJson } from '../services/gemini.service.js';
import {
  digestionQuestions,
  lifestyleQuestions,
  sleepQuestions
} from '../data/weightAndTherapy.js';
import { prakritiQuestions } from '../data/store.js';
import { pickPrakriti } from '../services/recommendation.service.js';

/* ═══════════════════════════════════════════════════════
   Panchakarma Therapies
   ═══════════════════════════════════════════════════════ */

export async function getTherapies(_req, res) {
  const therapies = await Therapy.find().lean();
  res.json({ therapies: therapies.map(t => ({ ...t, id: t._id.toString() })) });
}

export async function getTherapyPackages(_req, res) {
  const packages = await TherapyPackage.find().lean();
  res.json({ packages: packages.map(p => ({ ...p, id: p._id.toString() })) });
}

export async function bookTherapy(req, res) {
  const {
    packageId = '',
    packageName = '',
    therapyId = '',
    therapyName = '',
    customerName,
    customerEmail,
    customerPhone,
    preferredDate = '',
    address = '',
    totalPriceInr,
    paymentMethod = 'razorpay',
    razorpayOrderId = '',
    razorpayPaymentId = ''
  } = req.body;

  const userId = req.user?.userId;

  if (!customerName || !customerEmail || !customerPhone || !totalPriceInr) {
    return res.status(400).json({ message: 'customerName, customerEmail, customerPhone and totalPriceInr are required.' });
  }

  const booking = await TherapyBooking.create({
    userId,
    packageId,
    packageName,
    therapyId,
    therapyName,
    customerName,
    customerEmail,
    customerPhone,
    preferredDate,
    address,
    totalPriceInr,
    paymentMethod,
    razorpayOrderId,
    razorpayPaymentId
  });

  res.status(201).json({ booking: { ...booking.toObject(), id: booking._id.toString() } });
}

export async function getTherapyBookings(req, res) {
  const userId = req.params.userId || req.user?.userId;
  const bookings = await TherapyBooking.find({ userId }).sort({ createdAt: -1 }).lean();
  res.json({ bookings: bookings.map(b => ({ ...b, id: b._id.toString() })) });
}

/* ═══════════════════════════════════════════════════════
   Weight Management — Assessment Questions
   ═══════════════════════════════════════════════════════ */

export function getWeightQuestions(_req, res) {
  res.json({
    prakritiQuestions,
    digestionQuestions,
    lifestyleQuestions,
    sleepQuestions
  });
}

/* ═══════════════════════════════════════════════════════
   Weight Management — Submit Full Assessment
   ═══════════════════════════════════════════════════════ */

function computeScore(answers, questions) {
  let total = 0;
  let max = 0;
  for (const q of questions) {
    max += 3;
    const ans = answers[q.id];
    if (ans) {
      const opt = q.options.find(o => o.value === ans);
      if (opt) total += opt.score;
    }
  }
  return max > 0 ? Math.round((total / max) * 100) : 0;
}

export async function submitWeightAssessment(req, res) {
  const userId = req.user?.userId;
  const {
    prakritiAnswers = [],
    digestionAnswers = {},
    lifestyleAnswers = {},
    sleepAnswers = {}
  } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Authenticated user required.' });
  }

  /* Score each section */
  const digestionScore = computeScore(digestionAnswers, digestionQuestions);
  const lifestyleScore = computeScore(lifestyleAnswers, lifestyleQuestions);
  const sleepScore = computeScore(sleepAnswers, sleepQuestions);
  const overall = Math.round((digestionScore + lifestyleScore + sleepScore) / 3);

  /* Determine prakriti */
  const prakriti = prakritiAnswers.length > 0
    ? pickPrakriti(prakritiAnswers)
    : 'unknown';

  /* Build answer summary for AI */
  const answerSummary = {
    prakriti,
    digestion: Object.entries(digestionAnswers).map(([k, v]) => {
      const q = digestionQuestions.find(q => q.id === k);
      return `${q?.prompt || k}: ${v}`;
    }).join('; '),
    lifestyle: Object.entries(lifestyleAnswers).map(([k, v]) => {
      const q = lifestyleQuestions.find(q => q.id === k);
      return `${q?.prompt || k}: ${v}`;
    }).join('; '),
    sleep: Object.entries(sleepAnswers).map(([k, v]) => {
      const q = sleepQuestions.find(q => q.id === k);
      return `${q?.prompt || k}: ${v}`;
    }).join('; '),
    scores: { digestionScore, lifestyleScore, sleepScore, overall }
  };

  /* AI report */
  const fallbackReport = {
    title: 'Your Ayurvedic Weight Management Report',
    overallHealth: overall >= 70 ? 'Good' : overall >= 40 ? 'Moderate' : 'Needs Attention',
    agniStatus: digestionScore >= 70 ? 'Strong Agni' : digestionScore >= 40 ? 'Variable Agni' : 'Weak Agni (Mandagni)',
    doshaImbalance: prakriti === 'kapha' ? 'Kapha excess likely contributing to weight gain' : prakriti === 'vata' ? 'Vata imbalance may affect metabolism' : 'Pitta-driven metabolism — manage with cooling foods',
    dietPlan: {
      breakfast: 'Moong dal chilla with mint chutney',
      lunch: 'Lauki sabzi + 2 multigrain roti + buttermilk',
      dinner: 'Light khichdi with ghee',
      snacks: 'Roasted makhana or seasonal fruit'
    },
    herbalSupport: [
      { name: 'Triphala', timing: 'Night, before sleep', purpose: 'Detox & digestion' },
      { name: 'Jeera water', timing: 'Morning, empty stomach', purpose: 'Metabolism boost' },
      { name: 'Ajwain tea', timing: 'After lunch', purpose: 'Anti-bloating' }
    ],
    lifestyleRecommendations: [
      'Walk 30 minutes after dinner',
      'Practice Surya Namaskar (5 rounds) every morning',
      'Avoid day sleep — rest only at night',
      'Drink warm water throughout the day'
    ],
    dinacharyaTips: [
      'Wake before 6 AM',
      'Oil pulling with sesame oil',
      'Eat largest meal at noon',
      'Sleep before 10 PM'
    ],
    cautionNote: 'This report is for wellness guidance only. Consult a certified Ayurvedic physician for clinical treatment.'
  };

  const aiReport = await runGeminiJson(
    `Generate a comprehensive Ayurvedic weight management report. Patient prakriti: ${prakriti}. Assessment summary: ${JSON.stringify(answerSummary)}. Return JSON with keys: title, overallHealth, agniStatus, doshaImbalance, dietPlan (object with breakfast/lunch/dinner/snacks), herbalSupport (array of {name,timing,purpose}), lifestyleRecommendations (array of strings), dinacharyaTips (array of strings), cautionNote. Keep advice safe, non-diagnostic, Ayurveda-focused.`,
    fallbackReport
  );

  /* Save assessment */
  const assessment = await WeightAssessment.create({
    userId,
    prakritiAnswers,
    digestionAnswers,
    lifestyleAnswers,
    sleepAnswers,
    scores: { digestion: digestionScore, lifestyle: lifestyleScore, sleep: sleepScore, overall },
    prakriti,
    aiReport,
    status: 'completed'
  });

  /* Update user profile with prakriti and report reference */
  await User.findByIdAndUpdate(userId, {
    prakriti,
    $push: {
      assessmentReports: {
        type: 'weight-full',
        assessmentId: assessment._id.toString(),
        summary: `Overall: ${overall}% | Digestion: ${digestionScore}% | Lifestyle: ${lifestyleScore}% | Sleep: ${sleepScore}%`,
        createdAt: new Date()
      }
    }
  }).catch(() => null);

  res.json({
    assessment: {
      id: assessment._id.toString(),
      scores: { digestion: digestionScore, lifestyle: lifestyleScore, sleep: sleepScore, overall },
      prakriti,
      aiReport
    }
  });
}

/* ═══════════════════════════════════════════════════════
   Weight Management — Get User Assessments
   ═══════════════════════════════════════════════════════ */

export async function getWeightAssessments(req, res) {
  const userId = req.params.userId || req.user?.userId;
  const assessments = await WeightAssessment.find({ userId }).sort({ createdAt: -1 }).lean();
  res.json({
    assessments: assessments.map(a => ({
      ...a,
      id: a._id.toString()
    }))
  });
}

export async function getWeightAssessmentById(req, res) {
  const assessment = await WeightAssessment.findById(req.params.id).lean();
  if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
  res.json({ assessment: { ...assessment, id: assessment._id.toString() } });
}

/* ═══════════════════════════════════════════════════════
   Weight Management — Daily Progress Tracking
   ═══════════════════════════════════════════════════════ */

export async function logWeightProgress(req, res) {
  const userId = req.user?.userId;
  const {
    date,
    weight = 0,
    waist = 0,
    energy = 5,
    digestionScore = 50,
    sleepHours = 7,
    waterGlasses = 8,
    exerciseMinutes = 0,
    mealFollowed = false,
    notes = ''
  } = req.body;

  if (!userId || !date) {
    return res.status(400).json({ message: 'date is required.' });
  }

  const entry = await WeightProgress.findOneAndUpdate(
    { userId, date },
    { weight, waist, energy, digestionScore, sleepHours, waterGlasses, exerciseMinutes, mealFollowed, notes },
    { upsert: true, new: true }
  );

  res.json({ progress: { ...entry.toObject(), id: entry._id.toString() } });
}

export async function getWeightProgress(req, res) {
  const userId = req.params.userId || req.user?.userId;
  const entries = await WeightProgress.find({ userId }).sort({ date: -1 }).limit(90).lean();
  res.json({
    progress: entries.map(e => ({ ...e, id: e._id.toString() }))
  });
}

/* ═══════════════════════════════════════════════════════
   Weight Management — AI Recommendations
   ═══════════════════════════════════════════════════════ */

export async function getWeightRecommendations(req, res) {
  const userId = req.user?.userId;

  /* Get latest assessment */
  const latest = await WeightAssessment.findOne({ userId }).sort({ createdAt: -1 }).lean();
  const prakriti = latest?.prakriti || 'vata';

  /* Get relevant products */
  const products = await Product.find({
    $or: [
      { tags: { $in: ['weight', 'digestion', 'gut', prakriti] } },
      { name: { $regex: /weight|digest|metabol/i } }
    ]
  }).limit(4).lean();

  /* Get relevant doctors */
  const doctors = await Doctor.find({
    $or: [
      { specialization: { $regex: /panchkarma|weight|ayurveda/i } },
      {}
    ]
  }).limit(3).lean();

  /* Get relevant packages */
  const packages = await TherapyPackage.find({
    $or: [
      { slug: { $in: ['weight-loss-pcos', '3-day-detox-reset'] } },
      { featured: true }
    ]
  }).limit(3).lean();

  res.json({
    prakriti,
    products: products.map(p => ({ ...p, id: p._id.toString() })),
    doctors: doctors.map(d => ({ ...d, id: d._id.toString() })),
    packages: packages.map(p => ({ ...p, id: p._id.toString() })),
    assessment: latest ? {
      id: latest._id.toString(),
      scores: latest.scores,
      aiReport: latest.aiReport
    } : null
  });
}

/* ═══════════════════════════════════════════════════════
   Profile — All Assessment Reports
   ═══════════════════════════════════════════════════════ */

export async function getUserReports(req, res) {
  const userId = req.params.userId || req.user?.userId;

  const user = await User.findById(userId).lean();
  const assessments = await WeightAssessment.find({ userId }).sort({ createdAt: -1 }).lean();
  const therapyBookings = await TherapyBooking.find({ userId }).sort({ createdAt: -1 }).lean();
  const uploadedReports = await ReportUpload.find({ userId }).sort({ createdAt: -1 }).lean();

  res.json({
    reports: (user?.assessmentReports || []),
    uploadedReports: uploadedReports.map(r => ({ ...r, id: r._id.toString() })),
    assessments: assessments.map(a => ({ ...a, id: a._id.toString() })),
    therapyBookings: therapyBookings.map(b => ({ ...b, id: b._id.toString() }))
  });
}
