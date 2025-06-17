export const machineLearningPlan = {
  id: 'machine-learning-intensive',
  title: 'Machine Learning Engineer Intensive',
  description: 'Comprehensive 2-week ML interview preparation covering algorithms, feature engineering, deep learning, and MLOps.',
  duration: '2 Weeks',
  type: 'intensive' as const,
  difficulty: 'advanced' as const,
  topics: ['ML Algorithms', 'Feature Engineering', 'Model Evaluation', 'Deep Learning', 'NLP', 'MLOps'],
  questionsCount: 70,
  features: ['Algorithm deep dives', 'Model evaluation', 'Practical scenarios', 'System design'],
  days: [
    {
      day: 1,
      title: 'ML Fundamentals',
      description: 'Core machine learning concepts and algorithms',
      questions: [
        { id: 'ml-001', title: 'Explain the difference between supervised and unsupervised learning', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'ml-002', title: 'How do you handle overfitting and underfitting?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-006', title: 'How do you stay updated with new technologies?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 2,
      title: 'Feature Engineering & Model Evaluation',
      description: 'Data preparation and model assessment techniques',
      questions: [
        { id: 'ml-003', title: 'Explain the process of feature engineering', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'ml-004', title: 'How do you evaluate machine learning models?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-002', title: 'Describe a challenging project you worked on', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-003', title: 'How would you approach a project with unclear requirements?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 3,
      title: 'Deep Learning',
      description: 'Neural networks and deep learning architectures',
      questions: [
        { id: 'ml-005', title: 'Explain deep learning and neural network architectures', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'ml-008', title: 'How do you handle imbalanced datasets?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-007', title: 'Describe a time when you had to learn something new quickly', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-009', title: 'How would you handle working with unfamiliar technology?', category: 'situational' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 4,
      title: 'Natural Language Processing',
      description: 'Text processing and language models',
      questions: [
        { id: 'ml-007', title: 'Describe your experience with natural language processing', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'ml-009', title: 'Explain the concept of explainable AI', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'bh-009', title: 'How do you prioritize your work when everything seems urgent?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-003', title: 'How do you handle tight deadlines?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 5,
      title: 'ML Project Lifecycle',
      description: 'End-to-end machine learning project management',
      questions: [
        { id: 'ml-006', title: 'How do you approach a machine learning project end-to-end?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'ml-010', title: 'How do you deploy and monitor machine learning models in production?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'st-007', title: 'How would you convince your team to adopt a new technology?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-004', title: 'Tell me about a time you had to work with a difficult team member', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 6,
      title: 'ML System Design',
      description: 'Designing scalable ML systems and infrastructure',
      questions: [
        { id: 'be-004', title: 'Explain microservices architecture', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'be-010', title: 'How do you design for scalability?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'st-010', title: 'What would you do if you disagreed with a technical decision?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 7,
      title: 'ML Interview Simulation',
      description: 'Comprehensive ML interview practice',
      questions: [
        { id: 'ml-001', title: 'Explain the difference between supervised and unsupervised learning', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'ml-005', title: 'Explain deep learning and neural network architectures', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'ml-006', title: 'How do you approach a machine learning project end-to-end?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'st-005', title: 'How would you handle conflicting feedback from stakeholders?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
      ],
      completed: false
    }
  ]
};