// Simple keyword extraction from job description
export function extractKeywordsFromJD(jd: string): string[] {
  if (!jd) return [];
  // Extract words that look like skills/technologies (capitalized, or common tech terms)
  const techTerms = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node', 'Express', 'Django', 'Flask', 'Spring', 'Rails',
    'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST', 'API',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Git', 'Agile', 'Scrum',
    'HTML', 'CSS', 'Sass', 'Less', 'Tailwind', 'Bootstrap', 'Figma', 'UI', 'UX', 'Testing', 'Jest', 'Mocha', 'Cypress',
    'Leadership', 'Communication', 'Teamwork', 'Problem-solving', 'Project Management', 'Machine Learning', 'AI', 'Data Science', 'DevOps', 'Cloud', 'Security', 'Linux', 'Windows', 'MacOS'
  ];
  // Find all capitalized words and tech terms
  const found = new Set<string>();
  const words = jd.match(/\b[A-Z][a-zA-Z0-9+\/#.\-]*\b/g) || [];
  words.forEach(w => found.add(w));
  techTerms.forEach(term => {
    if (jd.toLowerCase().includes(term.toLowerCase())) found.add(term);
  });
  return Array.from(found);
} 