import { blogs, dietTips, prakritiQuestions, products } from '../data/store.js';

export function findRecommendedProducts(disease, prakriti = 'vata') {
  const query = (disease || '').toLowerCase();
  const normalizedPrakriti = (prakriti || 'vata').split('-')[0];

  return products
    .filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query);
      const tagMatch = product.tags.some((tag) => query.includes(tag) || tag.includes(query));
      const prakritiMatch = product.tags.includes(normalizedPrakriti);

      return nameMatch || tagMatch || prakritiMatch;
    })
    .slice(0, 4);
}

export function pickPrakriti(answers) {
  const scores = { vata: 0, pitta: 0, kapha: 0 };

  answers.forEach((answer) => {
    const question = prakritiQuestions.find((q) => q.id === answer.questionId);
    if (!question) {
      return;
    }

    const option = question.options.find((item) => item.value === answer.optionValue);
    if (option && scores[option.dosha] !== undefined) {
      scores[option.dosha] += 1;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [first, second] = sorted;

  if (!first || first[1] === 0) {
    return 'vata';
  }

  if (second && second[1] === first[1]) {
    return `${first[0]}-${second[0]}`;
  }

  return first[0];
}

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


export function getRecommendations(prakriti, symptom) {
  const normalizedPrakriti = (prakriti || 'vata').split('-')[0];
  const normalizedSymptom = (symptom || '').toLowerCase();

  const productMatches = products.filter(
    (product) => product.tags.includes(normalizedPrakriti) || product.tags.includes('sleep')
  );

  const blogMatches = blogs.filter((blog) => {
    if (normalizedSymptom.includes('sleep')) {
      return blog.tags.includes('stress') || blog.tags.includes('lifestyle');
    }

    return blog.tags.includes('lifestyle');
  });

  return {
    prakriti: normalizedPrakriti,
    symptom: normalizedSymptom,
    products: productMatches.slice(0, 3),
    blogs: blogMatches.slice(0, 2),
    dietTips: dietTips[normalizedPrakriti] || []
  };
}
