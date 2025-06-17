export const fullstackPlan = {
  id: 'fullstack-accelerated',
  title: 'Full Stack Software Engineer Accelerated',
  description: 'Intensive 1-week program covering essential full-stack interview topics with rapid-fire practice sessions.',
  duration: '1 Week',
  type: 'accelerated' as const,
  difficulty: 'intermediate' as const,
  topics: ['React', 'Node.js', 'System Design', 'Algorithms', 'Behavioral'],
  questionsCount: 35,
  features: ['Daily practice sessions', 'Mock interviews', 'Real-time feedback', 'Progress tracking'],
  popular: true,
  days: [
    {
      day: 1,
      title: 'Foundation & Behavioral Basics',
      description: 'Start with core behavioral questions and introduction techniques',
      questions: [
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-002', title: 'Why do you want to work here?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 10 },
        { id: 'bh-006', title: 'How do you stay updated with new technologies?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-010', title: 'Describe a time when you went above and beyond', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'st-009', title: 'How would you handle working with unfamiliar technology?', category: 'situational' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 2,
      title: 'Frontend Technical Deep Dive',
      description: 'Focus on frontend technologies and frameworks',
      questions: [
        { id: 'fe-001', title: 'Explain the difference between let, const, and var', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'fe-002', title: 'What is the Virtual DOM and how does React use it?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'fe-004', title: 'Explain CSS Flexbox vs CSS Grid', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'fe-008', title: 'What is responsive web design?', category: 'technical' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'fe-007', title: 'Explain event delegation in JavaScript', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 3,
      title: 'Backend & System Fundamentals',
      description: 'Backend development and system design basics',
      questions: [
        { id: 'be-001', title: 'Explain the difference between SQL and NoSQL databases', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'be-002', title: 'What is RESTful API design?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'be-006', title: 'What is caching and how do you implement it?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'be-007', title: 'How do you handle error handling and logging?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'be-009', title: 'What is message queuing and when would you use it?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 4,
      title: 'Problem Solving & Situational',
      description: 'Situational questions and problem-solving scenarios',
      questions: [
        { id: 'st-003', title: 'How would you approach a project with unclear requirements?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-006', title: 'What would you do if you realized you made a mistake in production?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-003', title: 'How do you handle tight deadlines?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 10 },
        { id: 'bh-007', title: 'Describe a time when you had to learn something new quickly', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-007', title: 'How would you convince your team to adopt a new technology?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 5,
      title: 'Advanced Concepts & Leadership',
      description: 'Advanced technical concepts and leadership scenarios',
      questions: [
        { id: 'be-004', title: 'Explain microservices architecture', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'fe-003', title: 'How do you optimize website performance?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 15 },
        { id: 'st-005', title: 'How would you handle conflicting feedback from stakeholders?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 15 },
        { id: 'bh-004', title: 'Tell me about a time you had to work with a difficult team member', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 6,
      title: 'System Design & Scalability',
      description: 'System design principles and scalability challenges',
      questions: [
        { id: 'be-005', title: 'How do you optimize database performance?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'be-008', title: 'Explain load balancing and its types', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'be-010', title: 'How do you design for scalability?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'st-001', title: 'How would you handle a production system outage?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 15 },
        { id: 'st-002', title: 'What would you do if you discovered a security vulnerability?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 7,
      title: 'Mock Interview & Review',
      description: 'Comprehensive mock interview with mixed question types',
      questions: [
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'fe-006', title: 'How do you handle state management in large React applications?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'be-003', title: 'How do you handle authentication and authorization?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'st-010', title: 'What would you do if you disagreed with a technical decision?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    }
  ]
};