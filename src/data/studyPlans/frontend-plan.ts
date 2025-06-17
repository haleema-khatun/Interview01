export const frontendPlan = {
  id: 'frontend-comprehensive',
  title: 'Frontend Developer Comprehensive',
  description: 'Complete 1-month frontend specialization covering modern frameworks and best practices.',
  duration: '1 Month',
  type: 'comprehensive' as const,
  difficulty: 'intermediate' as const,
  topics: ['React', 'Vue', 'Angular', 'CSS', 'JavaScript', 'Performance', 'Testing'],
  questionsCount: 150,
  features: ['Project-based learning', 'Code challenges', 'Performance optimization', 'Portfolio review'],
  days: [
    {
      day: 1,
      title: 'JavaScript Fundamentals',
      description: 'Core JavaScript concepts and ES6+ features',
      questions: [
        { id: 'fe-001', title: 'Explain the difference between let, const, and var', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'fe-007', title: 'Explain event delegation in JavaScript', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-006', title: 'How do you stay updated with new technologies?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-007', title: 'Describe a time when you had to learn something new quickly', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 2,
      title: 'React Fundamentals',
      description: 'React basics, components, and state management',
      questions: [
        { id: 'fe-002', title: 'What is the Virtual DOM and how does React use it?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'fe-005', title: 'What are React Hooks and why were they introduced?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-009', title: 'How would you handle working with unfamiliar technology?', category: 'situational' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-002', title: 'Describe a challenging project you worked on', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 3,
      title: 'CSS & Layout',
      description: 'Modern CSS, Flexbox, Grid, and responsive design',
      questions: [
        { id: 'fe-004', title: 'Explain CSS Flexbox vs CSS Grid', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'fe-008', title: 'What is responsive web design and how do you implement it?', category: 'technical' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-003', title: 'How do you handle tight deadlines?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 10 },
        { id: 'st-003', title: 'How would you approach a project with unclear requirements?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 4,
      title: 'Advanced React & State Management',
      description: 'Complex state management and React patterns',
      questions: [
        { id: 'fe-006', title: 'How do you handle state management in large React applications?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-009', title: 'How do you prioritize your work when everything seems urgent?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-007', title: 'How would you convince your team to adopt a new technology?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-004', title: 'Tell me about a time you had to work with a difficult team member', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 5,
      title: 'Performance & Optimization',
      description: 'Web performance, optimization techniques, and best practices',
      questions: [
        { id: 'fe-003', title: 'How do you optimize website performance?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-006', title: 'What would you do if you realized you made a mistake in production?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-010', title: 'Describe a time when you went above and beyond', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 6,
      title: 'Accessibility & PWAs',
      description: 'Web accessibility and Progressive Web Apps',
      questions: [
        { id: 'fe-009', title: 'How do you ensure web accessibility?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'fe-010', title: 'Explain the concept of Progressive Web Apps (PWAs)', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 15 },
        { id: 'st-010', title: 'What would you do if you disagreed with a technical decision?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 7,
      title: 'Frontend Mock Interview',
      description: 'Comprehensive frontend interview simulation',
      questions: [
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'fe-002', title: 'What is the Virtual DOM and how does React use it?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'fe-006', title: 'How do you handle state management in large React applications?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'fe-003', title: 'How do you optimize website performance?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'st-005', title: 'How would you handle conflicting feedback from stakeholders?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 15 },
      ],
      completed: false
    }
  ]
};