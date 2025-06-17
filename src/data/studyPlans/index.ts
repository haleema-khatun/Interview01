import { fullstackPlan } from './fullstack-plan';
import { behavioralPlan } from './behavioral-plan';
import { frontendPlan } from './frontend-plan';
import { dsaPlan } from './dsa-plan';
import { cybersecurityPlan } from './cybersecurity-plan';
import { devopsPlan } from './devops-plan';
import { cloudComputingPlan } from './cloud-computing-plan';
import { machineLearningPlan } from './machine-learning-plan';
import { backendPlan } from './backend-plan';

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'accelerated' | 'intensive' | 'comprehensive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  questionsCount: number;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  days: Array<{
    day: number;
    title: string;
    description: string;
    questions: Array<{
      id: string;
      title: string;
      category: 'behavioral' | 'technical' | 'situational';
      difficulty: 'easy' | 'medium' | 'hard';
      estimatedTime: number;
    }>;
    completed: boolean;
  }>;
}

export const allStudyPlans: StudyPlan[] = [
  fullstackPlan,
  behavioralPlan,
  frontendPlan,
  dsaPlan,
  cybersecurityPlan,
  devopsPlan,
  cloudComputingPlan,
  machineLearningPlan,
  backendPlan,
  {
    id: 'fullstack-intensive',
    title: 'Full Stack Software Engineer Intensive',
    description: 'Comprehensive 2-week deep dive into full-stack development with extensive practice and detailed feedback.',
    duration: '2 Weeks',
    type: 'intensive',
    difficulty: 'intermediate',
    topics: ['Frontend', 'Backend', 'Databases', 'System Design', 'DevOps', 'Behavioral'],
    questionsCount: 100,
    features: ['In-depth tutorials', 'Code reviews', 'System design workshops', 'Peer collaboration'],
    recommended: true,
    days: [] // Will be implemented later
  },
  {
    id: 'system-design-intensive',
    title: 'System Design Intensive',
    description: 'Focused 2-week system design preparation for senior engineering roles.',
    duration: '2 Weeks',
    type: 'intensive',
    difficulty: 'advanced',
    topics: ['Scalability', 'Load Balancing', 'Caching', 'Databases', 'Microservices'],
    questionsCount: 40,
    features: ['Design workshops', 'Case studies', 'Whiteboarding practice', 'Expert feedback'],
    days: [] // Will be implemented later
  },
  {
    id: 'leadership-intensive',
    title: 'Engineering Leadership Intensive',
    description: 'Specialized 2-week program for senior and staff engineer leadership interviews.',
    duration: '2 Weeks',
    type: 'intensive',
    difficulty: 'advanced',
    topics: ['Team Management', 'Technical Strategy', 'Mentoring', 'Decision Making'],
    questionsCount: 60,
    features: ['Leadership scenarios', 'Strategic thinking', 'Conflict resolution', 'Vision setting'],
    days: [] // Will be implemented later
  },
];

export const getStudyPlanById = (id: string): StudyPlan | undefined => {
  return allStudyPlans.find(plan => plan.id === id);
};

export const getStudyPlansByType = (type: string): StudyPlan[] => {
  if (type === 'all') return allStudyPlans;
  return allStudyPlans.filter(plan => plan.type === type);
};

export const getStudyPlansByDifficulty = (difficulty: string): StudyPlan[] => {
  if (difficulty === 'all') return allStudyPlans;
  return allStudyPlans.filter(plan => plan.difficulty === difficulty);
};