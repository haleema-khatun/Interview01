export const cloudComputingPlan = {
  id: 'cloud-computing-intensive',
  title: 'Cloud Computing Professional Intensive',
  description: 'Comprehensive 2-week cloud computing interview preparation covering major cloud platforms, architecture, security, and optimization.',
  duration: '2 Weeks',
  type: 'intensive' as const,
  difficulty: 'intermediate' as const,
  topics: ['Cloud Architecture', 'AWS/Azure/GCP', 'Serverless', 'Networking', 'Security', 'Cost Optimization'],
  questionsCount: 70,
  features: ['Multi-cloud scenarios', 'Architecture design', 'Cost optimization', 'Security best practices'],
  days: [
    {
      day: 1,
      title: 'Cloud Fundamentals',
      description: 'Core cloud concepts and service models',
      questions: [
        { id: 'cc-001', title: 'Compare and contrast the major cloud service models', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'cc-003', title: 'Explain cloud-native application design principles', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-006', title: 'How do you stay updated with new technologies?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 2,
      title: 'Cloud Architecture & High Availability',
      description: 'Designing resilient cloud systems',
      questions: [
        { id: 'cc-002', title: 'How do you design for high availability in the cloud?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'be-010', title: 'How do you design for scalability?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'bh-002', title: 'Describe a challenging project you worked on', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-003', title: 'How would you approach a project with unclear requirements?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 3,
      title: 'Cloud Cost Optimization',
      description: 'Strategies for efficient cloud resource usage',
      questions: [
        { id: 'cc-004', title: 'How do you approach cloud cost optimization?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'cc-005', title: 'Describe your experience with multi-cloud strategies', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'bh-009', title: 'How do you prioritize your work when everything seems urgent?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-005', title: 'How would you handle conflicting feedback from stakeholders?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
      ],
      completed: false
    },
    {
      day: 4,
      title: 'Cloud Security',
      description: 'Securing cloud infrastructure and applications',
      questions: [
        { id: 'cc-006', title: 'How do you implement security in cloud environments?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'cs-008', title: 'How would you secure a cloud environment?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'st-002', title: 'What would you do if you discovered a security vulnerability?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-003', title: 'How do you handle tight deadlines?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 5,
      title: 'Serverless & Modern Cloud Architectures',
      description: 'Event-driven and serverless computing models',
      questions: [
        { id: 'cc-007', title: 'Explain serverless architecture and its use cases', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'be-009', title: 'What is message queuing and when would you use it?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-007', title: 'Describe a time when you had to learn something new quickly', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-007', title: 'How would you convince your team to adopt a new technology?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 6,
      title: 'Cloud Networking & Storage',
      description: 'Cloud networking concepts and storage solutions',
      questions: [
        { id: 'cc-008', title: 'How do you manage data storage and databases in the cloud?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'cc-009', title: 'Describe your experience with cloud networking', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'be-006', title: 'What is caching and how do you implement it?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 7,
      title: 'Cloud Migration & Strategy',
      description: 'Approaches to cloud migration and adoption',
      questions: [
        { id: 'cc-010', title: 'How do you approach cloud migration projects?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'st-001', title: 'How would you handle a production system outage?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'st-006', title: 'What would you do if you realized you made a mistake in production?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-010', title: 'Describe a time when you went above and beyond', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 15 },
      ],
      completed: false
    }
  ]
};