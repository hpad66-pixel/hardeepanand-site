import recovered from '../../content/published-pages.json';
import {isVisible} from './content.js';
export const visiblePages = (prod = true) => recovered.filter(p=>isVisible(p.status,prod));
export const publicPages = recovered.filter(p => p.status === 'PUBLISHED');
export const collectionInfo = {
  climb: { title: 'Writing', headline: 'All the writing. One place.', description: 'Essays on water, AI, and lifelong learning.' },
  'case-studies': { title: 'Case Studies', headline: 'The test is in the field.', description: 'What works in practice, what the data can prove, and what it means for the people running our infrastructure.' },
  'ai-watch': { title: 'AI Watch', headline: 'Beyond the AI headlines.', description: 'A practical lens on artificial intelligence for water and public infrastructure. Start with the foundations: connected data, clear requirements, and evidence of what works.' },
};
