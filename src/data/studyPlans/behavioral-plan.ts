export const behavioralPlan = {
  id: 'behavioral-accelerated',
  title: 'Behavioral Interview Accelerated',
  description: 'Fast-track behavioral interview preparation focusing on STAR method and common scenarios.',
  duration: '1 Week',
  type: 'accelerated' as const,
  difficulty: 'beginner' as const,
  topics: ['STAR Method', 'Leadership', 'Conflict Resolution', 'Team Collaboration'],
  questionsCount: 30,
  features: ['STAR framework training', 'Story development', 'Video practice', 'Feedback analysis'],
  days: [
    {
      day: 1,
      title: 'Introduction & STAR Method Basics',
      description: 'Learn the STAR method and practice basic introduction questions',
      questions: [
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-006', title: 'How do you stay updated with new technologies?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-010', title: 'Describe a time when you went above and beyond', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 15 },
        { id: 'bh-007', title: 'Describe a time when you had to learn something new quickly', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 2,
      title: 'Project & Challenge Management',
      description: 'Focus on project management and overcoming challenges',
      questions: [
        { id: 'bh-002', title: 'Describe a challenging project you worked on', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-003', title: 'How do you handle tight deadlines?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-009', title: 'How do you prioritize your work when everything seems urgent?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-003', title: 'How would you approach a project with unclear requirements?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 3,
      title: 'Teamwork & Collaboration',
      description: 'Practice teamwork scenarios and collaboration challenges',
      questions: [
        { id: 'bh-004', title: 'Tell me about a time you had to work with a difficult team member', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-004', title: 'What would you do if a team member consistently missed deadlines?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-005', title: 'How would you handle conflicting feedback from stakeholders?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'st-007', title: 'How would you convince your team to adopt a new technology?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 4,
      title: 'Failure & Learning',
      description: 'Discuss failures, mistakes, and learning experiences',
      questions: [
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-006', title: 'What would you do if you realized you made a mistake in production?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-009', title: 'How would you handle working with unfamiliar technology?', category: 'situational' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'st-008', title: 'What would you do if you had to deliver bad news to a client?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 5,
      title: 'Leadership & Conflict Resolution',
      description: 'Advanced leadership scenarios and conflict management',
      questions: [
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'st-010', title: 'What would you do if you disagreed with a technical decision?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-001', title: 'How would you handle a production system outage?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'st-002', title: 'What would you do if you discovered a security vulnerability?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
      ],
      completed: false
    },
    {
      day: 6,
      title: 'Communication & Client Relations',
      description: 'Focus on communication skills and client management',
      questions: [
        { id: 'bh-001', title: 'Tell me about yourself (Advanced)', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 10 },
        { id: 'bh-002', title: 'Describe a challenging project (Leadership focus)', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-004', title: 'Working with difficult team members (Advanced)', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-010', title: 'Going above and beyond (Impact focus)', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 7,
      title: 'Mock Interview & Final Review',
      description: 'Comprehensive behavioral interview simulation',
      questions: [
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-002', title: 'Describe a challenging project you worked on', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'st-005', title: 'How would you handle conflicting feedback from stakeholders?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
      ],
      completed: false
    }
  ]
};