import { frontendQuestions } from './frontend-ques';
import { backendQuestions } from './backend-ques';
import { behavioralQuestions } from './behavioral-ques';
import { situationalQuestions } from './situational-ques';
import { dsaQuestions } from './dsa-ques';
import { fullstackQuestions } from './fullstack';
import { cybersecurityQuestions } from './cybersecurity';
import { devopsQuestions } from './devops';
import { cloudComputingQuestions } from './cloud-computing';
import { machineLearningQuestions } from './machine-learning';

export type Question = {
  id: string;
  title: string;
  description: string;
  category: 'behavioral' | 'technical' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  companies?: string[]; // Company tags based on question content
};

// Smart company tag assignment based on question content and type
const addSmartCompanyTags = (questions: Question[]): Question[] => {
  return questions.map(question => {
    let companies: string[] = [];
    
    const title = question.title.toLowerCase();
    const description = question.description.toLowerCase();
    const tags = question.tags.join(' ').toLowerCase();
    const content = `${title} ${description} ${tags}`;
    
    // Frontend-specific companies
    if (content.includes('react') || content.includes('jsx') || content.includes('virtual dom')) {
      companies = ['Meta', 'Netflix', 'Airbnb', 'Uber', 'Discord', 'Shopify'];
    } else if (content.includes('vue') || content.includes('angular')) {
      companies = ['GitLab', 'Adobe', 'Upwork', 'Freelancer', 'BMW', 'Nintendo'];
    } else if (content.includes('javascript') || content.includes('js') || content.includes('frontend')) {
      companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Spotify', 'Twitter'];
    } else if (content.includes('css') || content.includes('flexbox') || content.includes('grid') || content.includes('responsive')) {
      companies = ['Figma', 'Adobe', 'Canva', 'Dribbble', 'Behance', 'Pinterest'];
    } else if (content.includes('performance') || content.includes('optimization') || content.includes('web vitals')) {
      companies = ['Google', 'Cloudflare', 'Fastly', 'Vercel', 'Netlify', 'Amazon'];
    }
    
    // Backend-specific companies
    else if (content.includes('database') || content.includes('sql') || content.includes('nosql')) {
      companies = ['Oracle', 'MongoDB', 'Redis', 'Snowflake', 'Databricks', 'Amazon', 'Google'];
    } else if (content.includes('api') || content.includes('rest') || content.includes('graphql')) {
      companies = ['Stripe', 'Twilio', 'SendGrid', 'Postman', 'Insomnia', 'GitHub'];
    } else if (content.includes('microservices') || content.includes('distributed') || content.includes('scalability')) {
      companies = ['Netflix', 'Uber', 'Lyft', 'DoorDash', 'Spotify', 'Twitter', 'LinkedIn'];
    } else if (content.includes('authentication') || content.includes('security') || content.includes('authorization')) {
      companies = ['Auth0', 'Okta', 'Firebase', 'AWS', 'Microsoft', 'CyberArk'];
    } else if (content.includes('caching') || content.includes('redis') || content.includes('memcached')) {
      companies = ['Redis', 'Amazon', 'Google', 'Microsoft', 'Cloudflare', 'Fastly'];
    } else if (content.includes('load balancing') || content.includes('infrastructure') || content.includes('devops')) {
      companies = ['AWS', 'Google Cloud', 'Microsoft Azure', 'DigitalOcean', 'Linode', 'Heroku'];
    }
    
    // DSA-specific companies
    else if (content.includes('algorithm') || content.includes('data structure') || content.includes('complexity')) {
      companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Bloomberg', 'Two Sigma', 'Citadel'];
    } else if (content.includes('dynamic programming') || content.includes('recursion')) {
      companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'ByteDance', 'Uber'];
    } else if (content.includes('graph') || content.includes('tree') || content.includes('linked list')) {
      companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'LinkedIn', 'Twitter', 'Snapchat'];
    }
    
    // Cybersecurity-specific companies
    else if (content.includes('security') || content.includes('breach') || content.includes('vulnerability')) {
      companies = ['CrowdStrike', 'Palo Alto Networks', 'FireEye', 'Cloudflare', 'Okta', 'SentinelOne'];
    } else if (content.includes('compliance') || content.includes('risk') || content.includes('governance')) {
      companies = ['Deloitte', 'EY', 'PwC', 'KPMG', 'RSA', 'OneTrust'];
    }
    
    // DevOps-specific companies
    else if (content.includes('devops') || content.includes('ci/cd') || content.includes('pipeline')) {
      companies = ['GitLab', 'GitHub', 'CircleCI', 'Jenkins', 'HashiCorp', 'Red Hat'];
    } else if (content.includes('kubernetes') || content.includes('container') || content.includes('docker')) {
      companies = ['Google', 'Red Hat', 'Docker', 'VMware', 'Rancher', 'SUSE'];
    }
    
    // Cloud-specific companies
    else if (content.includes('cloud') || content.includes('aws') || content.includes('azure') || content.includes('gcp')) {
      companies = ['AWS', 'Microsoft', 'Google', 'IBM', 'Oracle', 'Alibaba Cloud', 'DigitalOcean'];
    } else if (content.includes('serverless') || content.includes('lambda') || content.includes('functions')) {
      companies = ['AWS', 'Microsoft', 'Google', 'Netlify', 'Vercel', 'Cloudflare'];
    }
    
    // Machine Learning-specific companies
    else if (content.includes('machine learning') || content.includes('ai') || content.includes('deep learning')) {
      companies = ['Google', 'OpenAI', 'Meta', 'Microsoft', 'Amazon', 'Anthropic', 'Nvidia', 'DeepMind'];
    } else if (content.includes('nlp') || content.includes('natural language')) {
      companies = ['OpenAI', 'Google', 'Meta', 'Microsoft', 'Anthropic', 'Cohere', 'Hugging Face'];
    }
    
    // System Design & Architecture
    else if (content.includes('system design') || content.includes('architecture') || content.includes('high availability')) {
      companies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Uber', 'Twitter', 'LinkedIn'];
    }
    
    // Behavioral questions - company-specific focus
    else if (question.category === 'behavioral') {
      if (content.includes('leadership') || content.includes('management') || content.includes('team')) {
        companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Tesla', 'SpaceX'];
      } else if (content.includes('failure') || content.includes('mistake') || content.includes('conflict')) {
        companies = ['Amazon', 'Google', 'Microsoft', 'Meta', 'Netflix', 'Uber'];
      } else if (content.includes('innovation') || content.includes('creativity') || content.includes('new technology')) {
        companies = ['Apple', 'Google', 'Tesla', 'SpaceX', 'OpenAI', 'Anthropic'];
      } else if (content.includes('deadline') || content.includes('pressure') || content.includes('urgent')) {
        companies = ['Amazon', 'Meta', 'Netflix', 'Uber', 'DoorDash', 'Instacart'];
      } else if (content.includes('customer') || content.includes('client') || content.includes('user')) {
        companies = ['Amazon', 'Apple', 'Salesforce', 'Zendesk', 'Shopify', 'Square'];
      } else {
        companies = ['Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix', 'Tesla', 'Spotify'];
      }
    }
    
    // Situational questions - scenario-specific companies
    else if (question.category === 'situational') {
      if (content.includes('outage') || content.includes('production') || content.includes('incident')) {
        companies = ['Netflix', 'Uber', 'Lyft', 'DoorDash', 'Stripe', 'Zoom', 'Slack'];
      } else if (content.includes('security') || content.includes('vulnerability') || content.includes('breach')) {
        companies = ['CrowdStrike', 'Palo Alto Networks', 'Okta', 'Auth0', 'Microsoft', 'Google'];
      } else if (content.includes('stakeholder') || content.includes('client') || content.includes('feedback')) {
        companies = ['Salesforce', 'HubSpot', 'Zendesk', 'Intercom', 'Slack', 'Notion'];
      } else if (content.includes('technology') || content.includes('adoption') || content.includes('new tool')) {
        companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Adobe'];
      } else {
        companies = ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Tesla', 'Stripe', 'Shopify'];
      }
    }
    
    // Default fallback for technical questions without specific matches
    else if (question.category === 'technical' && companies.length === 0) {
      companies = ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Uber', 'Stripe'];
    }
    
    // Ensure we have at least some companies and limit to 8 max
    if (companies.length === 0) {
      companies = ['Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix'];
    }
    
    return {
      ...question,
      companies: companies.slice(0, 8) // Limit to 8 companies max
    };
  });
};

export const allQuestions: Question[] = [
  ...addSmartCompanyTags(frontendQuestions),
  ...addSmartCompanyTags(backendQuestions),
  ...addSmartCompanyTags(behavioralQuestions),
  ...addSmartCompanyTags(situationalQuestions),
  ...addSmartCompanyTags(dsaQuestions),
  ...addSmartCompanyTags(fullstackQuestions),
  ...addSmartCompanyTags(cybersecurityQuestions),
  ...addSmartCompanyTags(devopsQuestions),
  ...addSmartCompanyTags(cloudComputingQuestions),
  ...addSmartCompanyTags(machineLearningQuestions),
];

export const getQuestionsByCategory = (category: string): Question[] => {
  if (category === 'all') return allQuestions;
  return allQuestions.filter(q => q.category === category);
};

export const getQuestionsByDifficulty = (difficulty: string): Question[] => {
  if (difficulty === 'all') return allQuestions;
  return allQuestions.filter(q => q.difficulty === difficulty);
};

export const getQuestionsByCompany = (company: string): Question[] => {
  if (company === 'all') return allQuestions;
  return allQuestions.filter(q => q.companies?.includes(company));
};

export const getQuestionById = (id: string): Question | undefined => {
  // Handle custom questions
  if (id.startsWith('custom-')) {
    const customQuestion = localStorage.getItem('custom_question');
    if (customQuestion) {
      return JSON.parse(customQuestion);
    }
  }
  
  // Handle study plan questions
  if (id.startsWith('study-plan-day-')) {
    const dayData = localStorage.getItem('study_plan_day');
    if (dayData) {
      const day = JSON.parse(dayData);
      return {
        id: id,
        title: `${day.title} - Practice Session`,
        description: `Complete all ${day.questions.length} questions for Day ${day.day}: ${day.description}`,
        category: 'behavioral',
        difficulty: 'medium',
        tags: ['study-plan', 'comprehensive'],
        companies: ['Study Plan']
      };
    }
  }
  
  return allQuestions.find(q => q.id === id);
};

export const searchQuestions = (searchTerm: string): Question[] => {
  const term = searchTerm.toLowerCase();
  return allQuestions.filter(q => 
    q.title.toLowerCase().includes(term) ||
    q.description.toLowerCase().includes(term) ||
    q.tags.some(tag => tag.toLowerCase().includes(term)) ||
    q.companies?.some(company => company.toLowerCase().includes(term))
  );
};

// Get all unique companies
export const getAllCompanies = (): string[] => {
  const companies = new Set<string>();
  allQuestions.forEach(q => {
    q.companies?.forEach(company => companies.add(company));
  });
  return Array.from(companies).sort();
};

export {
  frontendQuestions,
  backendQuestions,
  behavioralQuestions,
  situationalQuestions,
  dsaQuestions,
  fullstackQuestions,
  cybersecurityQuestions,
  devopsQuestions,
  cloudComputingQuestions,
  machineLearningQuestions,
};