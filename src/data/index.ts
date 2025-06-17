// This file serves as a secure data proxy to prevent direct access to question data
// It exports only the necessary functions to access data, not the raw data itself

import { allQuestions, getQuestionsByCategory, getQuestionsByDifficulty, getQuestionsByCompany, searchQuestions, getAllCompanies, getQuestionById } from './questions';
import { allStudyPlans, getStudyPlanById, getStudyPlansByType, getStudyPlansByDifficulty } from './studyPlans';

// Export only the functions, not the raw data
export {
  // Question-related functions
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  getQuestionsByCompany,
  searchQuestions,
  getAllCompanies,
  getQuestionById,
  
  // Study plan-related functions
  getStudyPlanById,
  getStudyPlansByType,
  getStudyPlansByDifficulty
};

// Export types but not the actual data
export type { Question } from './questions';
export type { StudyPlan } from './studyPlans';

// Export a secure count of questions and study plans
export const questionCount = allQuestions.length;
export const studyPlanCount = allStudyPlans.length;

// Export categories, difficulties, and types as constants
export const questionCategories = ['behavioral', 'technical', 'situational'];
export const questionDifficulties = ['easy', 'medium', 'hard'];
export const studyPlanTypes = ['accelerated', 'intensive', 'comprehensive'];
export const studyPlanDifficulties = ['beginner', 'intermediate', 'advanced'];

// Function to get questions by subject
export const getQuestionsBySubject = (subject: string): Question[] => {
  const subjectLower = subject.toLowerCase();
  
  switch (subjectLower) {
    case 'frontend':
      return allQuestions.filter(q => 
        q.tags.some(tag => 
          ['javascript', 'react', 'vue', 'angular', 'css', 'html', 'dom', 'frontend', 'ui', 'ux'].includes(tag.toLowerCase())
        ) || 
        q.id.startsWith('fe-')
      );
    
    case 'backend':
      return allQuestions.filter(q => 
        q.tags.some(tag => 
          ['backend', 'server', 'api', 'database', 'sql', 'nosql', 'node', 'express', 'django', 'spring'].includes(tag.toLowerCase())
        ) || 
        q.id.startsWith('be-')
      );
    
    case 'full stack':
      return allQuestions.filter(q => 
        q.tags.some(tag => 
          ['fullstack', 'full-stack', 'full stack', 'mern', 'mean', 'architecture'].includes(tag.toLowerCase())
        ) || 
        q.id.startsWith('fs-')
      );
    
    case 'data structures & algorithms':
      return allQuestions.filter(q => 
        q.tags.some(tag => 
          ['algorithm', 'data structure', 'complexity', 'big-o', 'sorting', 'searching', 'tree', 'graph', 'dynamic programming'].includes(tag.toLowerCase())
        ) || 
        q.id.startsWith('dsa-')
      );
    
    case 'cybersecurity':
      return allQuestions.filter(q => 
        q.tags.some(tag => 
          ['security', 'cybersecurity', 'encryption', 'authentication', 'authorization', 'vulnerability', 'threat', 'risk'].includes(tag.toLowerCase())
        ) || 
        q.id.startsWith('cs-')
      );
    
    case 'devops':
      return allQuestions.filter(q => 
        q.tags.some(tag => 
          ['devops', 'ci/cd', 'pipeline', 'docker', 'kubernetes', 'container', 'deployment', 'infrastructure'].includes(tag.toLowerCase())
        ) || 
        q.id.startsWith('do-')
      );
    
    case 'cloud computing':
      return allQuestions.filter(q => 
        q.tags.some(tag => 
          ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'lambda', 'iaas', 'paas', 'saas'].includes(tag.toLowerCase())
        ) || 
        q.id.startsWith('cc-')
      );
    
    case 'machine learning':
      return allQuestions.filter(q => 
        q.tags.some(tag => 
          ['machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning', 'neural network', 'data science'].includes(tag.toLowerCase())
        ) || 
        q.id.startsWith('ml-')
      );
    
    default:
      return allQuestions;
  }
};