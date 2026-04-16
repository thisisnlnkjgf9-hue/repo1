export function fallbackDiseaseQuestions(disease) {
  return [
    {
      id: 'gq_1',
      prompt: `How long have you had ${disease}?`,
      type: 'single-choice',
      options: ['< 1 week', '1-4 weeks', '1-3 months', '3+ months']
    },
    {
      id: 'gq_2',
      prompt: 'How severe are your symptoms right now?',
      type: 'single-choice',
      options: ['Mild', 'Moderate', 'Severe']
    },
    {
      id: 'gq_3',
      prompt: 'Which symptom affects you most?',
      type: 'single-choice',
      options: ['Sleep', 'Digestion', 'Stress', 'Low energy']
    },
    {
      id: 'gq_4',
      prompt: 'Do your symptoms increase at night?',
      type: 'single-choice',
      options: ['Yes', 'No', 'Sometimes']
    },
    {
      id: 'gq_5',
      prompt: 'Any known related condition?',
      type: 'single-choice',
      options: ['Diabetes', 'Thyroid', 'Blood pressure', 'None']
    }
  ];
}

export function normalizeAnswerText(answers) {
  return (answers || [])
    .map((item) => `${item.prompt || item.question || item.questionId}: ${item.answer || item.value || ''}`)
    .join('; ');
}
