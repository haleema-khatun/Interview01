export const cybersecurityPlan = {
  id: 'cybersecurity-intensive',
  title: 'Cybersecurity Professional Intensive',
  description: 'Comprehensive 2-week cybersecurity interview preparation covering security fundamentals, threat modeling, incident response, and compliance.',
  duration: '2 Weeks',
  type: 'intensive' as const,
  difficulty: 'advanced' as const,
  topics: ['Security Fundamentals', 'Threat Modeling', 'Incident Response', 'Compliance', 'Penetration Testing'],
  questionsCount: 70,
  features: ['Security scenarios', 'Incident response simulations', 'Compliance frameworks', 'Technical deep dives'],
  days: [
    {
      day: 1,
      title: 'Security Fundamentals',
      description: 'Core security concepts and defense strategies',
      questions: [
        { id: 'cs-001', title: 'Explain the concept of defense in depth', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'cs-007', title: 'Explain the concept of zero trust security', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'bh-006', title: 'How do you stay updated with new technologies?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 2,
      title: 'Web Application Security',
      description: 'OWASP Top 10 and secure coding practices',
      questions: [
        { id: 'cs-003', title: 'Explain the OWASP Top 10 and how to mitigate these vulnerabilities', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 25 },
        { id: 'cs-006', title: 'How do you implement secure coding practices?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-002', title: 'Describe a challenging project you worked on', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-009', title: 'How would you handle working with unfamiliar technology?', category: 'situational' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 3,
      title: 'Risk Assessment & Threat Modeling',
      description: 'Methodologies for security risk assessment',
      questions: [
        { id: 'cs-004', title: 'How do you perform a security risk assessment?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'st-002', title: 'What would you do if you discovered a security vulnerability?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-009', title: 'How do you prioritize your work when everything seems urgent?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-007', title: 'Describe a time when you had to learn something new quickly', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 4,
      title: 'Incident Response',
      description: 'Security breach handling and incident management',
      questions: [
        { id: 'cs-002', title: 'How would you respond to a security breach?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'st-001', title: 'How would you handle a production system outage?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-003', title: 'How do you handle tight deadlines?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 5,
      title: 'Penetration Testing',
      description: 'Ethical hacking and vulnerability assessment',
      questions: [
        { id: 'cs-005', title: 'Describe your experience with penetration testing', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'st-006', title: 'What would you do if you realized you made a mistake in production?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-004', title: 'Tell me about a time you had to work with a difficult team member', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-010', title: 'What would you do if you disagreed with a technical decision?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 6,
      title: 'Cloud Security',
      description: 'Securing cloud infrastructure and applications',
      questions: [
        { id: 'cs-008', title: 'How would you secure a cloud environment?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'cc-006', title: 'How do you implement security in cloud environments?', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 25 },
        { id: 'st-007', title: 'How would you convince your team to adopt a new technology?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
      ],
      completed: false
    },
    {
      day: 7,
      title: 'Compliance & Governance',
      description: 'Security frameworks and regulatory compliance',
      questions: [
        { id: 'cs-009', title: 'Describe your experience with security compliance frameworks', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'cs-010', title: 'How do you stay current with emerging security threats?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 15 },
        { id: 'st-005', title: 'How would you handle conflicting feedback from stakeholders?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
        { id: 'bh-010', title: 'Describe a time when you went above and beyond', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 15 },
      ],
      completed: false
    }
  ]
};