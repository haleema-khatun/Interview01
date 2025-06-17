export const backendPlan = {
  id: 'backend-intensive',
  title: 'Backend Developer Intensive',
  description: 'Comprehensive 2-week backend engineering program focusing on APIs, databases, system design, and scalability.',
  duration: '2 Weeks',
  type: 'intensive' as const,
  difficulty: 'intermediate' as const,
  topics: ['APIs', 'Databases', 'System Design', 'Microservices', 'Security', 'Performance'],
  questionsCount: 70,
  features: ['Architecture design', 'Database optimization', 'Security best practices', 'Scalability patterns'],
  days: [
    {
      day: 1,
      title: 'API Design & RESTful Services',
      description: 'Best practices for designing robust APIs',
      questions: [
        { id: 'be-002', title: 'What is RESTful API design and its principles?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'fs-007', title: 'Describe your experience with API design and implementation', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-006', title: 'How do you stay updated with new technologies?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 2,
      title: 'Database Systems & Optimization',
      description: 'Database design, optimization, and management',
      questions: [
        { id: 'be-001', title: 'Explain the difference between SQL and NoSQL databases', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'be-005', title: 'How do you optimize database performance?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'bh-002', title: 'Describe a challenging project you worked on', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-009', title: 'How would you handle working with unfamiliar technology?', category: 'situational' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 3,
      title: 'Authentication & Security',
      description: 'Securing backend systems and applications',
      questions: [
        { id: 'be-003', title: 'How do you handle authentication and authorization?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'fs-005', title: 'Explain your approach to authentication and authorization', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'st-002', title: 'What would you do if you discovered a security vulnerability?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-007', title: 'Describe a time when you had to learn something new quickly', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 4,
      title: 'Microservices & Distributed Systems',
      description: 'Designing and implementing microservices architecture',
      questions: [
        { id: 'be-004', title: 'Explain microservices architecture', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'be-009', title: 'What is message queuing and when would you use it?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-009', title: 'How do you prioritize your work when everything seems urgent?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-003', title: 'How would you approach a project with unclear requirements?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 5,
      title: 'Caching & Performance',
      description: 'Optimizing backend performance with caching strategies',
      questions: [
        { id: 'be-006', title: 'What is caching and how do you implement it?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'be-010', title: 'How do you design for scalability?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'bh-003', title: 'How do you handle tight deadlines?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-007', title: 'How would you convince your team to adopt a new technology?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 6,
      title: 'Error Handling & Logging',
      description: 'Robust error management and monitoring',
      questions: [
        { id: 'be-007', title: 'How do you handle error handling and logging?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'fs-008', title: 'How do you handle error management across the full stack?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'st-001', title: 'How would you handle a production system outage?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 7,
      title: 'System Design & Scalability',
      description: 'Designing scalable and resilient backend systems',
      questions: [
        { id: 'be-008', title: 'Explain load balancing and its types', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'be-010', title: 'How do you design for scalability?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'st-010', title: 'What would you do if you disagreed with a technical decision?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-010', title: 'Describe a time when you went above and beyond', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 15 },
      ],
      completed: false
    }
  ]
};