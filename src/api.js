const API_BASE = import.meta.env.VITE_API_URL || '/api';
const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

function getToken() {
  return localStorage.getItem('nouryum_token') || '';
}

async function request(path, options = {}, customToken) {
  const token = customToken || getToken();
  const headers = {};
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
      signal: controller.signal
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    throw new Error('Unable to connect to server. Please try again.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.message || 'Something went wrong.');
    error.status = response.status;

    /* Broadcast auth errors globally so ToastProvider can catch them */
    if (response.status === 401 || response.status === 403) {
      window.dispatchEvent(
        new CustomEvent('nouryum:auth-error', {
          detail: { message: payload.message || 'Authentication required. Please log in.' }
        })
      );
    }

    throw error;
  }

  return response.json();
}

export const api = {
  health: () => request('/health'),
  loginWithGoogle: (credential) =>
    request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }, 'skip'),
  getMe: (token) => request('/auth/me', {}, token),
  getPrakritiQuestions: () => request('/prakriti/questions'),
  submitPrakriti: (userId, answers) =>
    request('/prakriti/submit', { method: 'POST', body: JSON.stringify({ userId, answers }) }),
  aiSearch: (payload) => request('/ai/search', { method: 'POST', body: JSON.stringify(payload) }),
  aiChat: (payload) => request('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
  generateSymptomQuestions: (disease) =>
    request('/symptoms/generate-questions', { method: 'POST', body: JSON.stringify({ disease }) }),
  analyzeDiseaseSymptoms: (payload) =>
    request('/symptoms/analyze-disease', { method: 'POST', body: JSON.stringify(payload) }),
  analyzeSymptoms: (symptom) =>
    request('/symptom-checker/analyze', { method: 'POST', body: JSON.stringify({ symptom }) }),
  getRecommendations: (prakriti, symptom) =>
    request(`/recommendations?prakriti=${encodeURIComponent(prakriti)}&symptom=${encodeURIComponent(symptom)}`),
  getDietTips: (prakriti) => request(`/diet-tips?prakriti=${encodeURIComponent(prakriti)}`),
  getSeasonalDietTips: (season) => request(`/diet-tips/seasonal?season=${encodeURIComponent(season)}`),
  getDoctors: () => request('/doctors'),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getBookings: (userId) => request(`/bookings/${userId}`),
  getProducts: ({ search = '', category = '', prakriti = '' } = {}) =>
    request(
      `/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&prakriti=${encodeURIComponent(prakriti)}`
    ),
  getCart: (userId) => request(`/cart/${userId}`),
  addToCart: (payload) => request('/cart', { method: 'POST', body: JSON.stringify(payload) }),
  removeFromCart: (payload) => request('/cart/remove', { method: 'POST', body: JSON.stringify(payload) }),
  checkout: (payload) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(payload) }),
  getOrders: (userId) => request(`/orders/${userId}`),
  createPaymentOrder: (payload) => request('/payments/create-order', { method: 'POST', body: JSON.stringify(payload) }),
  verifyPayment: (payload) => request('/payments/verify', { method: 'POST', body: JSON.stringify(payload) }),
  getBlogs: () => request('/blogs'),
  getBlogById: (id) => request(`/blogs/${id}`),
  getPodcasts: () => request('/podcasts'),
  getLabPackage: () => request('/labs/packages'),
  uploadMedicalReport: (payload) => request('/reports/upload', { method: 'POST', body: payload }),
  getFeedbacks: () => request('/feedback'),
  submitFeedback: (payload) => request('/feedback', { method: 'POST', body: JSON.stringify(payload) }),

  /* ── Panchakarma Therapy ── */
  getTherapies: () => request('/therapies'),
  getTherapyPackages: () => request('/therapy-packages'),
  bookTherapy: (payload) => request('/therapy-bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getTherapyBookings: (userId) => request(`/therapy-bookings/${userId}`),

  /* ── Weight Management ── */
  getWeightQuestions: () => request('/weight/questions'),
  submitWeightAssessment: (payload) => request('/weight/assessment', { method: 'POST', body: JSON.stringify(payload) }),
  getWeightAssessments: (userId) => request(`/weight/assessments/${userId}`),
  getWeightAssessmentById: (id) => request(`/weight/assessment/${id}`),
  logWeightProgress: (payload) => request('/weight/progress', { method: 'POST', body: JSON.stringify(payload) }),
  getWeightProgress: (userId) => request(`/weight/progress/${userId}`),
  getWeightRecommendations: () => request('/weight/recommendations'),

  /* ── Profile reports ── */
  getUserReports: (userId) => request(`/user/reports/${userId}`)
};
