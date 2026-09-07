import recovered from '../../content/published-pages.json';
export const publicPages = recovered.filter(p => p.status === 'PUBLISHED');
export const collectionInfo = {
  climb: { title: 'The Second Climb', headline: 'Still learning. Still climbing.', description: 'On reinvention, building, and the long game. Lessons from a life inside the system, and the work of starting again.' },
  'case-studies': { title: 'Case Studies', headline: 'The test is in the field.', description: 'What works in practice, what the data can prove, and what it means for the people running our infrastructure.' },
  'ai-watch': { title: 'AI Watch', headline: 'Beyond the AI headlines.', description: 'A practical lens on artificial intelligence for water and public infrastructure. Start with the foundations: connected data, clear requirements, and evidence of what works.' },
};
