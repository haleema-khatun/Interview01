export const dsaPlan = {
  id: 'dsa-comprehensive',
  title: 'Data Structures & Algorithms Comprehensive',
  description: 'Master DSA concepts with this comprehensive 1-month plan covering fundamental algorithms, data structures, and problem-solving techniques.',
  duration: '1 Month',
  type: 'comprehensive' as const,
  difficulty: 'advanced' as const,
  topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching'],
  questionsCount: 120,
  features: ['Daily coding challenges', 'Algorithm analysis', 'Time & space complexity', 'Interview patterns'],
  recommended: true,
  days: [
    {
      day: 1,
      title: 'Arrays & Strings Fundamentals',
      description: 'Master basic array and string manipulation techniques',
      questions: [
        { id: 'dsa-005', title: 'Solve the "Two Sum" problem', category: 'technical' as const, difficulty: 'easy' as const, estimatedTime: 15 },
        { id: 'dsa-009', title: 'Solve the "Valid Parentheses" problem', category: 'technical' as const, difficulty: 'easy' as const, estimatedTime: 15 },
        { id: 'dsa-001', title: 'Explain the time and space complexity of common sorting algorithms', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-007', title: 'Describe a time when you had to learn something new quickly', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 2,
      title: 'Linked Lists',
      description: 'Deep dive into linked list operations and algorithms',
      questions: [
        { id: 'dsa-002', title: 'Implement a function to reverse a linked list', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'dsa-003', title: 'How would you detect a cycle in a linked list?', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'bh-003', title: 'How do you handle tight deadlines?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-009', title: 'How would you handle working with unfamiliar technology?', category: 'situational' as const, difficulty: 'easy' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 3,
      title: 'Trees & Binary Search Trees',
      description: 'Learn tree traversal algorithms and BST operations',
      questions: [
        { id: 'dsa-004', title: 'Implement a binary search tree with basic operations', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'bh-002', title: 'Describe a challenging project you worked on', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-003', title: 'How would you approach a project with unclear requirements?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-010', title: 'Describe a time when you went above and beyond', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 4,
      title: 'Graphs & Graph Algorithms',
      description: 'Master graph representations and traversal algorithms',
      questions: [
        { id: 'dsa-007', title: 'Implement a graph and perform BFS and DFS traversals', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'bh-009', title: 'How do you prioritize your work when everything seems urgent?', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-007', title: 'How would you convince your team to adopt a new technology?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-006', title: 'How do you stay updated with new technologies?', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
      ],
      completed: false
    },
    {
      day: 5,
      title: 'Dynamic Programming',
      description: 'Learn DP approach to solve optimization problems',
      questions: [
        { id: 'dsa-006', title: 'Explain dynamic programming and solve a classic problem', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'bh-005', title: 'Describe a time when you failed at something', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'st-006', title: 'What would you do if you realized you made a mistake in production?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-004', title: 'Tell me about a time you had to work with a difficult team member', category: 'behavioral' as const, difficulty: 'medium' as const, estimatedTime: 15 },
      ],
      completed: false
    },
    {
      day: 6,
      title: 'Advanced Data Structures',
      description: 'Explore tries, LRU cache, and other complex data structures',
      questions: [
        { id: 'dsa-008', title: 'Design an LRU Cache', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'dsa-010', title: 'Implement a trie (prefix tree) data structure', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'st-010', title: 'What would you do if you disagreed with a technical decision?', category: 'situational' as const, difficulty: 'medium' as const, estimatedTime: 15 },
        { id: 'bh-008', title: 'Tell me about a time you disagreed with your manager', category: 'behavioral' as const, difficulty: 'hard' as const, estimatedTime: 20 },
      ],
      completed: false
    },
    {
      day: 7,
      title: 'Mock Interview & Final Review',
      description: 'Practice with a comprehensive DSA interview simulation',
      questions: [
        { id: 'dsa-001', title: 'Explain the time and space complexity of common sorting algorithms', category: 'technical' as const, difficulty: 'medium' as const, estimatedTime: 20 },
        { id: 'dsa-006', title: 'Explain dynamic programming and solve a classic problem', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'dsa-007', title: 'Implement a graph and perform BFS and DFS traversals', category: 'technical' as const, difficulty: 'hard' as const, estimatedTime: 30 },
        { id: 'bh-001', title: 'Tell me about yourself', category: 'behavioral' as const, difficulty: 'easy' as const, estimatedTime: 10 },
        { id: 'st-005', title: 'How would you handle conflicting feedback from stakeholders?', category: 'situational' as const, difficulty: 'hard' as const, estimatedTime: 20 },
      ],
      completed: false
    }
  ]
};