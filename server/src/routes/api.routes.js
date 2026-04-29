import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import {
  addToCart,
  aiChat,
  aiSearch,
  analyzeDisease,
  analyzeSymptom,
  authGoogle,
  checkout,
  createBooking,
  createPaymentOrder,
  generateSymptomQuestions,
  getBlogById,
  getBlogs,
  getCart,
  getDietTips,
  getSeasonalDietTips,
  getDoctors,
  getHeroSlides,
  getFeedbacks,
  getLabPackage,
  getMe,
  getOrders,
  getBookings,
  getPodcasts,
  getPrakritiQuestions,
  getProducts,
  health,
  recommendations,
  removeFromCart,
  submitFeedback,
  submitPrakriti,
  uploadMedicalReport,
  verifyPayment
} from '../controllers/api.controller.js';
import {
  getTherapies,
  getTherapyPackages,
  bookTherapy,
  getTherapyBookings,
  getWeightQuestions,
  submitWeightAssessment,
  getWeightAssessments,
  getWeightAssessmentById,
  logWeightProgress,
  getWeightProgress,
  getWeightRecommendations,
  getUserReports
} from '../controllers/weight.controller.js';
import { getProductById, getSitePagePublic } from '../controllers/api.controller.js';

const router = Router();

/* ── Public routes ── */
router.get('/health', health);
router.post('/auth/google', authGoogle);
router.get('/hero-slides', getHeroSlides);
router.get('/blogs', getBlogs);
router.get('/blogs/:id', getBlogById);
router.get('/podcasts', getPodcasts);
router.get('/feedback', getFeedbacks);
router.get('/doctors', getDoctors);
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.get('/prakriti/questions', getPrakritiQuestions);
router.get('/therapies', getTherapies);
router.get('/therapy-packages', getTherapyPackages);
router.get('/site-page/:slug', getSitePagePublic);

/* ── Protected routes (require login) ── */
router.get('/auth/me', authRequired, getMe);

router.post('/prakriti/submit', authRequired, submitPrakriti);
router.get('/diet-tips', authRequired, getDietTips);
router.get('/diet-tips/seasonal', authRequired, getSeasonalDietTips);

router.post('/symptom-checker/analyze', authRequired, analyzeSymptom);
router.post('/ai/search', authRequired, aiSearch);
router.post('/ai/chat', authRequired, aiChat);
router.post('/symptoms/generate-questions', authRequired, generateSymptomQuestions);
router.post('/symptoms/analyze-disease', authRequired, analyzeDisease);
router.get('/recommendations', authRequired, recommendations);

router.post('/bookings', authRequired, createBooking);
router.get('/bookings/:userId', authRequired, getBookings);

router.get('/cart/:userId', authRequired, getCart);
router.post('/cart', authRequired, addToCart);
router.post('/cart/remove', authRequired, removeFromCart);
router.post('/orders/checkout', authRequired, checkout);
router.get('/orders/:userId', authRequired, getOrders);

router.post('/payments/create-order', authRequired, createPaymentOrder);
router.post('/payments/verify', authRequired, verifyPayment);

import { uploadReportPdf, uploadToCloud } from '../middlewares/upload.middleware.js';

router.get('/labs/packages', authRequired, getLabPackage);
router.post('/reports/upload', authRequired, uploadReportPdf.single('file'), uploadToCloud, uploadMedicalReport);

router.post('/feedback', authRequired, submitFeedback);

/* ── Panchakarma Therapy routes ── */
router.post('/therapy-bookings', authRequired, bookTherapy);
router.get('/therapy-bookings/:userId', authRequired, getTherapyBookings);

/* ── Weight Management routes ── */
router.get('/weight/questions', authRequired, getWeightQuestions);
router.post('/weight/assessment', authRequired, submitWeightAssessment);
router.get('/weight/assessments/:userId', authRequired, getWeightAssessments);
router.get('/weight/assessment/:id', authRequired, getWeightAssessmentById);
router.post('/weight/progress', authRequired, logWeightProgress);
router.get('/weight/progress/:userId', authRequired, getWeightProgress);
router.get('/weight/recommendations', authRequired, getWeightRecommendations);

/* ── Profile reports ── */
router.get('/user/reports/:userId', authRequired, getUserReports);

export default router;
