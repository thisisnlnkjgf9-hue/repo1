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
  orders,
  podcasts,
  prakritiQuestions,
  products,
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
import { runGeminiJson, runGeminiText } from '../services/gemini.service.js';
import { createOrder, verifyPaymentSignature } from '../services/razorpay.service.js';
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
    try {
      const dbUser = await User.findById(jwtUser.userId).lean();
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
    } catch {
      // fall through to in-memory
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
    `Generate 6 concise Ayurvedic diet tips for prakriti: ${prakriti}. Return only JSON with keys prakriti and tips. tips must be an array of short actionable strings.`,
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
    `Generate 6 concise Ayurvedic seasonal diet tips for ${season} season in India. Return only JSON with keys season and tips. tips must be an array of short actionable strings.`,
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
    summary: `${query} can be supported with a targeted routine, better sleep timing, anti-inflammatory diet choices, and stress regulation practices.`,
    caution: 'Seek clinical consultation for persistent or severe symptoms.',
    followUpQuestions: [
      'How long have you had these symptoms?',
      'What time of day is the symptom worst?',
      'Do you have any existing medical condition?'
    ]
  };

  const aiPayload = await runGeminiJson(
    `You are an Ayurvedic wellness assistant. Return only JSON with keys summary,caution,followUpQuestions for disease/query: ${query}. followUpQuestions must contain 3 concise items.`,
    fallback
  );

  return res.json({
    ...aiPayload,
    productRecommendations: findRecommendedProducts(query, prakriti),
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
    remedyPlan: [
      {
        heading: 'Sleep and daily rhythm',
        content: 'Sleep before 11 PM, wake at a fixed time, and avoid heavy dinners.'
      },
      {
        heading: 'Soothing food routine',
        content: 'Prefer warm, simple meals with digestive spices and avoid processed sugar.'
      },
      {
        heading: 'Stress reset',
        content: 'Practice 10 minutes of guided breathing or meditation twice daily.'
      }
    ],
    dietTips: ['Use freshly cooked meals.', 'Hydrate through the day.', 'Limit very cold foods at night.'],
    lifestyleTips: ['Walk 20-30 minutes daily.', 'Reduce screen exposure before sleep.'],
    caution: 'If symptoms worsen or persist, consult a certified doctor.'
  };

  const aiPayload = await runGeminiJson(
    `Patient disease: ${disease}. Answers: ${answerSummary}. Return only JSON with keys title,riskLevel,remedyPlan,dietTips,lifestyleTips,caution. remedyPlan must be array of {heading,content}. Keep advice safe and non-diagnostic.`,
    fallback
  );

  const productRecommendations = findRecommendedProducts(disease, prakriti);
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
export function recommendations(req, res) {
  const { prakriti, symptom } = req.query;
  res.json(getRecommendations(prakriti, symptom));
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
    razorpayPaymentId = ''
  } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required.' });
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
    status: razorpayPaymentId ? 'paid' : 'processing',
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

  try {
    const order = await createOrder(amount, receipt);
    return res.json({
      order,
      key: RAZORPAY_KEY_ID || 'demo_key'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create payment order.' });
  }
}

export function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ message: 'Payment details are required.' });
  }

  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature || '');

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment verification failed.' });
  }

  return res.json({ success: true, message: 'Payment verified.' });
}

/* ───── blogs ───── */
export async function getBlogs(_req, res) {
  if (!isMongoConnected()) {
    return res.status(503).json({ message: 'MongoDB is not connected. Blogs are available only from cloud database.' });
  }
  const allBlogs = await Blog.find().sort({ createdAt: -1 }).lean();
  const formatted = allBlogs.map(b => ({ ...b, id: b._id.toString() }));
  return res.json({ blogs: formatted });
}

export async function getBlogById(req, res) {
  if (!isMongoConnected()) {
    return res.status(503).json({ message: 'MongoDB is not connected. Blogs are available only from cloud database.' });
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

  return res.status(201).json({
    report: {
      ...payload,
      id: `rep_${Date.now()}`
    }
  });
}

/* ───── feedback ───── */
const inMemoryFeedbacks = [
  { id: 'f1', name: 'Pallavi Pal', rating: 5, comment: 'Nouryum helped me understand my Prakriti and gave me a personalized diet plan. Wonderful platform!', createdAt: '2025-12-10' },
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

