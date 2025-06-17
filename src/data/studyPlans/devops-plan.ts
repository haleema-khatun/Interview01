export const devopsPlan = {
  id: 'devops-accelerated',
  title: 'DevOps Engineer Accelerated',
  description: 'Fast-track DevOps interview preparation covering CI/CD, infrastructure as code, containerization, and cloud technologies.',
  duration: '1 Week',
  type: 'accelerated' as const,
  difficulty: 'intermediate' as const,
  topics: ['CI/CD', 'Infrastructure as Code', 'Containers', 'Monitoring', 'Cloud', 'Security'],
  questionsCount: 35,
  features: ['Hands-on scenarios', 'System design challenges', 'Incident response', 'Best practices'],
  popular: true,
  days: [
    {
      day: 1,
      title: 'CI/CD & Automation',
      description: 'Continuous integration, delivery, and deployment pipelines',
      questions: [
        { id: 'do-001', title: 'Explain your experience with CI/CD pipelines', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'fs-003', title: 'Describe your experience with CI/CD pipelines', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-006', title: 'How do you stay updated with new technologies?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 2,
      title: 'Infrastructure as Code',
      description: 'IaC tools, practices, and implementation strategies',
      questions: [
        { id: 'do-002', title: 'How do you approach infrastructure as code?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'cc-004', title: 'How do you approach cloud cost optimization?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-002', title: 'Describe a challenging project you worked on', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-009', title: 'How would you handle working with unfamiliar technology?', category: 'situational' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 3,
      title: 'Containerization & Orchestration',
      description: 'Docker, Kubernetes, and container management',
      questions: [
        { id: 'do-003', title: 'Describe your experience with container orchestration', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'cc-003', title: 'Explain cloud-native application design principles', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-007', title: 'Describe a time when you had to learn something new quickly', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-003', title: 'How would you approach a project with unclear requirements?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 4,
      title: 'Monitoring & Incident Response',
      description: 'Observability, alerting, and handling production incidents',
      questions: [
        { id: 'do-004', title: 'How do you implement monitoring and observability?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'do-005', title: 'Explain your approach to incident management', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'st-001', title: 'How would you handle a production system outage?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-003', title: 'How do you handle tight deadlines?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 5,
      title: 'Cloud Infrastructure & Security',
      description: 'Cloud platforms, services, and security practices',
      questions: [
        { id: 'do-007', title: 'Describe your experience with cloud infrastructure', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'do-006', title: 'How do you manage secrets and sensitive configuration?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'do-009', title: 'Explain your approach to security in the DevOps pipeline', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 6,
      title: 'Database Operations & Scaling',
      description: 'Database management, migrations, and performance optimization',
      questions: [
        { id: 'do-008', title: 'How do you approach database operations and migrations?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'be-005', title: 'How do you optimize database performance?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'st-006', title: 'What would you do if you realized you made a mistake in production?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-004', title: 'Tell me about a time you had to work with a difficult team member', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 7,
      title: 'DevOps Culture & Best Practices',
      description: 'DevOps principles, team collaboration, and continuous improvement',
      questions: [
        { id: 'do-010', title: 'How do you balance speed and stability in DevOps practices?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'st-007', title: 'How would you convince your team to adopt a new technology?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-010', title: 'What would you do if you disagreed with a technical decision?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-010', title: 'Describe a time when you went above and beyond', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 15 },
      ],
      completed: false
    }
  ]
};