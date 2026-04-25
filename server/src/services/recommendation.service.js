import { blogs, dietTips, prakritiQuestions, products as staticProducts } from '../data/store.js';
import { Product } from '../models/product.model.js';
import { isMongoConnected } from '../config/db.js';

/* ─────────────────────────────────────────────────────────────────────────────
   Score each product: 2 = name match, 2 = tag match, 1 = prakriti-only match
   This ensures query-relevant products always rank above generic prakriti ones.
───────────────────────────────────────────────────────────────────────────── */
function scoreProduct(product, query, normalizedPrakriti) {
  const name = (product.name || '').toLowerCase();
  const tags = Array.isArray(product.tags) ? product.tags : [];
  let score = 0;

  // Split query into words so "vitamin d3 deficiency" matches "vitamin" or "d3"
  const queryWords = query.split(/\s+/).filter((w) => w.length > 2);

  // Name match — check full query and individual words
  if (name.includes(query)) score += 3;
  else if (queryWords.some((w) => name.includes(w))) score += 2;

  // Tag match — check full query and individual words against tags
  const tagMatchFull = tags.some((tag) => query.includes(tag) || tag.includes(query));
  const tagMatchWord = queryWords.some((w) => tags.some((tag) => tag.includes(w) || w.includes(tag)));
  if (tagMatchFull) score += 3;
  else if (tagMatchWord) score += 2;

  // Prakriti match — lowest priority, just ensures relevant products appear
  if (tags.includes(normalizedPrakriti)) score += 1;

  return score;
}

function normalizeDoc(doc) {
  // Ensure both Mongoose docs and plain objects expose a consistent `id` field
  return { ...doc, id: doc._id ? doc._id.toString() : doc.id };
}

/* ─────────────────────────────────────────────────────────────────────────────
   findRecommendedProducts — queries MongoDB when connected so admin-added
   products are immediately eligible. Falls back to the static store.
───────────────────────────────────────────────────────────────────────────── */
export async function findRecommendedProducts(disease, prakriti = 'vata') {
  const query = (disease || '').toLowerCase();
  const normalizedPrakriti = (prakriti || 'vata').split('-')[0];

  let pool;
  if (isMongoConnected()) {
    try {
      pool = await Product.find().lean();
    } catch (err) {
      console.error('findRecommendedProducts: MongoDB query failed, using static store.', err.message);
      pool = staticProducts;
    }
  } else {
    pool = staticProducts;
  }

  // Score every product and filter out zero-score ones (no match at all)
  const scored = pool
    .map((p) => ({ product: p, score: scoreProduct(p, query, normalizedPrakriti) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)  // highest relevance first
    .slice(0, 4)
    .map(({ product }) => normalizeDoc(product));

  return scored;
}

/* ─────────────────────────────────────────────────────────────────────────────
   pickPrakriti — unchanged
───────────────────────────────────────────────────────────────────────────── */
export function pickPrakriti(answers) {
  const scores = { vata: 0, pitta: 0, kapha: 0 };

  answers.forEach((answer) => {
    const question = prakritiQuestions.find((q) => q.id === answer.questionId);
    if (!question) return;
    const option = question.options.find((item) => item.value === answer.optionValue);
    if (option && scores[option.dosha] !== undefined) {
      scores[option.dosha] += 1;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [first, second] = sorted;

  if (!first || first[1] === 0) return 'vata';
  if (second && second[1] === first[1]) return `${first[0]}-${second[0]}`;
  return first[0];
}

/* ─────────────────────────────────────────────────────────────────────────────
   calculatePrakritiDetails — unchanged
───────────────────────────────────────────────────────────────────────────── */
export function calculatePrakritiDetails(answers) {
  const scores = { vata: 0, pitta: 0, kapha: 0 };
  let total = 0;

  answers.forEach((answer) => {
    const question = prakritiQuestions.find((q) => q.id === answer.questionId);
    if (!question) return;
    const option = question.options.find((item) => item.value === answer.optionValue);
    if (option && scores[option.dosha] !== undefined) {
      scores[option.dosha] += 1;
      total += 1;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0]?.[0] || 'vata';
  const dominantScore = total > 0 ? Math.round((sorted[0]?.[1] / total) * 100) : 0;
  const second = sorted[1]?.[0] || '';
  const secondScore = total > 0 ? Math.round((sorted[1]?.[1] / total) * 100) : 0;
  const third = sorted[2]?.[0] || '';
  const thirdScore = total > 0 ? Math.round((sorted[2]?.[1] / total) * 100) : 0;

  return { dominant, dominantScore, second, secondScore, third, thirdScore };
}

/* ─────────────────────────────────────────────────────────────────────────────
   getRecommendations — also queries MongoDB for products
───────────────────────────────────────────────────────────────────────────── */
export async function getRecommendations(prakriti, symptom) {
  const normalizedPrakriti = (prakriti || 'vata').split('-')[0];
  const normalizedSymptom = (symptom || '').toLowerCase();

  let productMatches;
  if (isMongoConnected()) {
    try {
      const allProducts = await Product.find().lean();
      productMatches = allProducts
        .filter((p) => {
          const tags = Array.isArray(p.tags) ? p.tags : [];
          return tags.includes(normalizedPrakriti) || tags.includes(normalizedSymptom) || tags.includes('wellness');
        })
        .slice(0, 3)
        .map(normalizeDoc);
    } catch {
      productMatches = staticProducts
        .filter((p) => p.tags.includes(normalizedPrakriti) || p.tags.includes('sleep'))
        .slice(0, 3);
    }
  } else {
    productMatches = staticProducts
      .filter((p) => p.tags.includes(normalizedPrakriti) || p.tags.includes('sleep'))
      .slice(0, 3);
  }

  const blogMatches = blogs.filter((blog) => {
    if (normalizedSymptom.includes('sleep')) {
      return blog.tags.includes('stress') || blog.tags.includes('lifestyle');
    }
    return blog.tags.includes('lifestyle');
  });

  return {
    prakriti: normalizedPrakriti,
    symptom: normalizedSymptom,
    products: productMatches,
    blogs: blogMatches.slice(0, 2),
    dietTips: dietTips[normalizedPrakriti] || []
  };
}

