import { EvaluationRequest, EvaluationResponse } from './types';

export class MockEvaluationGenerator {
  // Enhanced mock evaluation for demo purposes with strict relevance checking
  static async generateEvaluation(request: EvaluationRequest): Promise<EvaluationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const ratingMode = request.ratingMode || 'lenient';
    const evaluationType = request.evaluationType || 'simple';
    
    // Check if answer is relevant to question (simple keyword matching for demo)
    const questionWords = request.question.toLowerCase().split(' ').filter(word => word.length > 3);
    const answerWords = request.answer.toLowerCase().split(' ').filter(word => word.length > 3);
    
    // Calculate relevance based on common words
    const commonWords = questionWords.filter(word => answerWords.includes(word));
    const relevanceRatio = commonWords.length / Math.max(questionWords.length, 1);
    
    console.log('🔍 Mock evaluation relevance check:', {
      questionWords: questionWords.slice(0, 5),
      answerWords: answerWords.slice(0, 5),
      commonWords,
      relevanceRatio
    });
    
    let scores;
    let feedback;
    let strengths;
    let improvements;
    
    if (relevanceRatio < 0.1 || request.answer.trim().length < 10) {
      // Completely irrelevant or too short answer
      scores = {
        clarity_score: 1,
        relevance_score: 1,
        critical_thinking_score: 1,
        thoroughness_score: 1,
      };
      
      feedback = `Your answer appears to be completely irrelevant to the question asked. The question was about "${request.question.substring(0, 50)}..." but your response does not address this topic at all. In an interview, it's crucial to listen carefully to the question and provide a direct, relevant response. Please read the question again and provide an answer that specifically addresses what was asked.

When faced with a question you're unsure about, it's better to ask for clarification than to provide an unrelated answer. Interviewers value candidates who ensure they understand the question before responding. This demonstrates active listening and critical thinking skills.

For this particular question, you would want to focus on addressing the specific scenario, technology, or experience mentioned. Even if you don't have direct experience with the exact situation described, you can draw parallels to similar experiences or discuss your theoretical approach based on your knowledge.`;
      
      strengths = [
        'You provided a response',
        'Answer was submitted on time',
        'Text was readable'
      ];
      
      improvements = [
        'Read the question carefully and ensure your answer is relevant',
        'Address the specific topic mentioned in the question',
        'Provide examples and details related to the actual question asked',
        'If unsure, ask for clarification rather than giving an unrelated answer'
      ];
    } else if (relevanceRatio < 0.3) {
      // Partially relevant but mostly off-topic
      scores = {
        clarity_score: Math.max(1, Math.min(3, Math.round(2 + Math.random()))),
        relevance_score: Math.max(1, Math.min(3, Math.round(2 + Math.random()))),
        critical_thinking_score: Math.max(1, Math.min(3, Math.round(2 + Math.random()))),
        thoroughness_score: Math.max(1, Math.min(3, Math.round(2 + Math.random()))),
      };
      
      feedback = `Your answer shows some connection to the question but is largely off-topic. While you touched on a few relevant points, most of your response doesn't directly address what was asked. In interviews, staying focused on the specific question is crucial for demonstrating your listening skills and ability to provide targeted responses.

When answering interview questions, it's important to first identify the core elements the interviewer is looking for. For this question, they wanted to understand your experience, approach, or knowledge regarding "${request.question.substring(0, 50)}...". Your response only partially addressed this, focusing instead on tangential topics that weren't central to the question.

A more effective approach would be to structure your answer using the STAR method (Situation, Task, Action, Result) if it's a behavioral question, or to clearly outline your methodology if it's a technical question. This ensures you stay on topic while providing comprehensive information that directly answers what was asked.`;
      
      strengths = [
        'Some relevant points were mentioned',
        'Answer showed effort and thought',
        'Communication was generally clear'
      ];
      
      improvements = [
        'Focus more directly on the specific question asked',
        'Eliminate off-topic information that doesn\'t add value',
        'Structure your answer to directly address the main points',
        'Use specific examples that relate to the question'
      ];
    } else {
      // Relevant answer - use normal scoring
      const baseScore = ratingMode === 'tough' ? 5 + Math.random() * 3 : 6 + Math.random() * 3;
      scores = {
        clarity_score: Math.max(1, Math.min(10, Math.round(baseScore + (Math.random() - 0.5) * 2))),
        relevance_score: Math.max(1, Math.min(10, Math.round(baseScore + (Math.random() - 0.5) * 2))),
        critical_thinking_score: Math.max(1, Math.min(10, Math.round(baseScore + (Math.random() - 0.5) * 2))),
        thoroughness_score: Math.max(1, Math.min(10, Math.round(baseScore + (Math.random() - 0.5) * 2))),
      };
      
      const overall_score = Math.round((scores.clarity_score + scores.relevance_score + scores.critical_thinking_score + scores.thoroughness_score) / 4);
      
      feedback = `Your response demonstrates ${overall_score >= 7 ? 'strong' : overall_score >= 5 ? 'good' : 'developing'} interview skills. You provided relevant examples and showed clear communication abilities. The structure of your answer was logical and easy to follow. 

Your answer effectively addressed the key aspects of the question, showing good understanding of what was being asked. ${scores.clarity_score >= 7 ? 'Your communication was particularly strong, with clear articulation of your thoughts and a logical flow that makes it easy for the interviewer to follow.' : 'Your communication could be strengthened by focusing on a more structured approach with clearer transitions between ideas.'}

${scores.relevance_score >= 7 ? 'You did an excellent job staying on topic and addressing the specific question asked.' : 'While you addressed the question, you could improve by focusing more directly on what was specifically asked.'}

${scores.critical_thinking_score >= 7 ? 'Your critical thinking skills were evident in how you analyzed the situation and provided thoughtful insights.' : 'To demonstrate stronger critical thinking, consider exploring different perspectives or discussing potential implications of your approach.'}

${scores.thoroughness_score >= 7 ? 'Your answer was comprehensive, covering all key aspects of the question in appropriate detail.' : 'Your answer would benefit from more comprehensive coverage of all aspects of the question.'}

${ratingMode === 'tough' ? 'To excel in competitive interviews, consider adding more specific metrics, deeper technical insights, and stronger examples that demonstrate leadership and impact. Top-tier companies look for candidates who can quantify their achievements and clearly articulate their unique contributions.' : 'With some refinement in specific areas, you can significantly strengthen your interview performance. Focus on providing concrete examples with measurable outcomes whenever possible.'}`;
      
      strengths = [
        'Clear and structured communication style',
        'Provided relevant examples from experience',
        'Demonstrated good understanding of the topic',
        'Logical organization of ideas',
        'Addressed key aspects of the question'
      ];
      
      improvements = [
        'Add more specific metrics and quantifiable results',
        'Include more diverse examples from different contexts',
        'Expand on the long-term impact of your actions',
        'Consider addressing potential challenges or limitations',
        'Connect your answer more explicitly to the role you\'re applying for'
      ];
    }

    const overall_score = Math.round((scores.clarity_score + scores.relevance_score + scores.critical_thinking_score + scores.thoroughness_score) / 4);

    // Generate a model answer based on the question type
    let modelAnswer = '';
    
    // Detect question type for better model answer generation
    const questionLower = request.question.toLowerCase();
    
    if (questionLower.includes('tell me about yourself') || questionLower.includes('introduce yourself')) {
      // Introduction question
      modelAnswer = `I'm a senior software engineer with over 8 years of experience specializing in full-stack development. My technical expertise includes JavaScript, TypeScript, React, Node.js, and cloud infrastructure on AWS. 

Throughout my career, I've led the development of several high-impact projects. For example, at TechCorp, I architected and implemented a microservices-based e-commerce platform that increased transaction throughput by 300% while reducing operational costs by 25%. This project required close collaboration with product, design, and infrastructure teams, showcasing my ability to work effectively across disciplines.

I'm particularly passionate about creating scalable, maintainable systems and mentoring junior developers. In my current role, I've established coding standards and review processes that reduced production bugs by 40% and improved team velocity by 20% over six months.

I'm looking for opportunities to leverage my technical leadership skills in an innovative environment where I can continue to solve complex problems and drive meaningful business outcomes. My combination of technical depth, project leadership, and collaborative approach makes me well-suited for this role, where I can contribute immediately while continuing to grow my expertise.`;
    } 
    else if (questionLower.includes('weakness') || questionLower.includes('weaknesses')) {
      // Weakness question
      modelAnswer = `One area I've actively worked to improve is my tendency to get deeply focused on perfecting technical details, sometimes at the expense of meeting tight deadlines. I recognized this pattern early in my career when I spent too much time optimizing a database query that was already performing adequately, which put pressure on our release schedule.

To address this, I've implemented several strategies. First, I now explicitly define "good enough" criteria at the start of tasks, establishing clear boundaries for when to move on. Second, I've adopted timeboxing techniques, allocating specific time limits for optimization work. Third, I regularly check in with team members to ensure my priorities align with project needs.

This approach has significantly improved my effectiveness. For example, on a recent project with an aggressive timeline, I identified critical performance bottlenecks that needed optimization and less critical areas where we could accept "good enough" solutions initially. By prioritizing strategically, we launched on schedule while still delivering excellent performance in key user journeys.

I continue to refine this balance, as I believe attention to detail is valuable when applied judiciously. This experience has taught me that perfect is often the enemy of good, especially in fast-paced environments where iteration is key to success.`;
    }
    else if (questionLower.includes('challenge') || questionLower.includes('difficult') || questionLower.includes('obstacle')) {
      // Challenge/difficult situation question
      modelAnswer = `One significant challenge I faced was when our team was tasked with migrating a legacy monolithic application to a microservices architecture while maintaining uninterrupted service for our 2 million daily active users. The system had minimal documentation, and several key developers who built it had left the company.

I approached this methodically by first creating a comprehensive mapping of the existing system's functionality and data flows. I led a team of five engineers in this discovery phase, using code analysis tools and implementing extensive logging to understand undocumented behaviors. We identified 12 distinct domains that could be separated into microservices.

Next, I developed a phased migration strategy that allowed for incremental changes rather than a risky "big bang" approach. We built a service mesh architecture using Kubernetes and Istio that could route traffic between legacy and new components. For each microservice, we followed a process of building, testing with production data in shadow mode, and then gradually shifting traffic.

We encountered several unexpected challenges, including discovering hidden dependencies and dealing with inconsistent data models. I established a war room process for quickly addressing issues and implemented detailed monitoring dashboards to catch problems early.

The result was a successful migration completed over six months with zero significant customer-facing incidents. The new architecture reduced deployment times from days to minutes, improved system reliability by 30%, and enabled our team to deliver new features 40% faster. This experience taught me the importance of thorough planning, incremental changes, and robust monitoring when tackling complex technical challenges.`;
    }
    else if (questionLower.includes('leadership') || questionLower.includes('lead a team') || questionLower.includes('managed a team')) {
      // Leadership question
      modelAnswer = `I led a cross-functional team of 8 people (3 developers, 2 designers, 2 QA specialists, and a product analyst) to redesign our company's customer support platform that was struggling with scalability issues and poor user experience.

When I took over the project, it was already 2 months behind schedule, and team morale was low due to unclear requirements and technical challenges. I immediately organized a 2-day workshop to realign everyone on the project goals and constraints. During this session, we collaboratively redefined the MVP features and established clear success metrics: reducing average ticket resolution time by 30% and improving agent satisfaction scores.

I implemented several key changes to our workflow. First, I introduced twice-weekly stand-ups and a Kanban board to improve visibility and accountability. Second, I established "no-meeting Thursdays" to give developers uninterrupted focus time. Third, I created a technical decision log to document our architectural choices and trade-offs.

When we encountered a major technical roadblock with the real-time notification system, I facilitated a problem-solving session where we decided to adopt a message queue architecture instead of our original websocket approach. I personally took on researching the options and prototyping the solution to unblock the team.

The results exceeded expectations: we delivered the platform 2 weeks ahead of our revised schedule, achieved a 45% reduction in ticket resolution time, and improved agent satisfaction scores from 6.2 to 8.7 out of 10. The project was recognized by senior leadership as an example of effective project management, and two team members were later promoted based partly on their contributions to this initiative.

This experience reinforced my belief in transparent communication, clear goal-setting, and creating an environment where team members feel empowered to contribute their best work.`;
    }
    else if (questionLower.includes('technical') || questionLower.includes('technology') || questionLower.includes('programming') || questionLower.includes('coding')) {
      // Technical question
      modelAnswer = `To implement a scalable and efficient caching strategy for a high-traffic web application, I would take a multi-layered approach that balances performance, consistency, and operational complexity.

First, I'd analyze the application's data access patterns to identify which resources would benefit most from caching. This would involve profiling database queries, API calls, and user behavior to determine hot spots where caching would provide the greatest performance improvements.

For the implementation, I would establish a hierarchy of caches:

1. **Browser-level caching**: I'd implement proper HTTP cache headers (ETag, Cache-Control) for static assets and semi-static content, reducing network requests entirely for returning users.

2. **CDN caching**: For globally distributed applications, I'd leverage a CDN like Cloudflare or Fastly to cache static assets and potentially edge-cacheable API responses closer to users.

3. **Application-level caching**: I'd implement an in-memory cache like Redis with the following characteristics:
   - Time-based expiration tailored to each resource type
   - Cache-aside pattern for read operations
   - Write-through or write-behind patterns for updates
   - Distributed cache invalidation using pub/sub mechanisms

4. **Database query caching**: For complex or expensive queries, I'd implement result caching with appropriate invalidation strategies.

To handle cache consistency challenges, I would:
- Implement versioned cache keys that change when underlying data models change
- Use cache invalidation based on entity relationships (e.g., invalidate all user-related caches when user data changes)
- Establish background jobs to refresh cached data proactively for critical resources

For monitoring and optimization, I would:
- Track cache hit/miss ratios and latency metrics
- Set up alerts for unexpected cache behavior
- Regularly review and tune TTL values based on actual usage patterns

This approach has proven effective in my experience. For example, at my previous company, implementing a similar strategy reduced average API response times by 65% and database load by 40%, while maintaining data consistency requirements.`;
    }
    else {
      // Generic model answer for other question types
      modelAnswer = `Based on my experience, addressing this challenge requires a systematic approach that balances technical expertise with effective communication and stakeholder management.

When I encountered a similar situation at my previous company, I first ensured I thoroughly understood the requirements and constraints by consulting with key stakeholders and subject matter experts. This initial investment in clarity saved significant time later in the process and helped align expectations.

Next, I developed a comprehensive plan that broke down the complex challenge into manageable components. For each component, I identified potential risks, dependencies, and success criteria. This structured approach allowed me to prioritize effectively and allocate resources appropriately.

During implementation, I maintained transparent communication with all stakeholders through weekly progress reports and ad-hoc updates for critical developments. When we encountered unexpected technical obstacles—particularly with integrating legacy systems—I facilitated collaborative problem-solving sessions that brought together diverse perspectives from across the organization.

One specific example was when we discovered that our initial approach would have created significant performance issues at scale. Rather than proceeding with a suboptimal solution, I presented data-backed alternatives to leadership, clearly outlining the trade-offs. This resulted in a two-week timeline extension but ultimately delivered a solution that was 40% more efficient and significantly more maintainable.

The outcome exceeded expectations: we delivered a solution that not only met the immediate requirements but established a flexible foundation for future enhancements. User satisfaction increased by 35%, and the system has required minimal maintenance over the past 18 months.

This experience reinforced my belief in the importance of thorough planning, clear communication, and adaptability when tackling complex challenges. I would bring this same methodical yet flexible approach to similar situations in this role.`;
    }

    return {
      ...scores,
      overall_score,
      rating_mode: ratingMode,
      evaluation_type: evaluationType,
      feedback_text: feedback,
      strengths,
      improvements,
      suggested_answer: modelAnswer,
      key_points_missed: overall_score <= 3 ? [
        'The main topic of the question was not addressed',
        'No relevant examples or experiences were provided',
        'Answer did not demonstrate understanding of the question',
        'Failed to provide any specific details or context',
        'Did not show how your skills apply to the situation'
      ] : [
        'Specific metrics or quantifiable results to demonstrate impact',
        'Connection to the target role or company to show relevance',
        'Discussion of lessons learned or future applications of this experience',
        'Addressing potential follow-up questions or concerns proactively',
        'Demonstrating awareness of industry best practices or standards'
      ],
      interview_tips: overall_score <= 3 ? [
        'Always read the question carefully before answering',
        'Make sure your answer directly addresses what was asked',
        'If you don\'t understand the question, ask for clarification',
        'Practice active listening during interviews',
        'Prepare examples from your experience for common question types'
      ] : [
        'Use the STAR method (Situation, Task, Action, Result) for behavioral questions',
        'Always include specific numbers or metrics when possible to quantify your impact',
        'Practice connecting your examples to the job requirements to show relevance',
        'Prepare 5-7 strong stories that can be adapted to different question types',
        'End strong answers with insights or lessons learned to demonstrate reflection'
      ],
      detailed_breakdown: {
        clarity: {
          score: scores.clarity_score,
          feedback: scores.clarity_score <= 2 ? 'Answer was unclear and did not communicate effectively. Focus on organizing your thoughts before speaking and using a logical structure.' : 'Your communication was generally clear with good structure. Consider using more concise language and stronger transitions between points to make your answer even more impactful.',
          examples: scores.clarity_score <= 2 ? ['Off-topic response', 'Unclear communication', 'Disorganized structure'] : ['Good use of logical flow', 'Some sentences could be more concise', 'Transitions between points could be stronger']
        },
        relevance: {
          score: scores.relevance_score,
          feedback: scores.relevance_score <= 2 ? 'Answer was not relevant to the question asked. Make sure to address the specific question rather than providing generic information.' : 'You addressed the main question well. Ensure every part of your answer directly relates to what was asked and avoid tangential information that doesn\'t strengthen your response.',
          examples: scores.relevance_score <= 2 ? ['Wrong topic', 'No connection to question', 'Generic response'] : ['Main topic was well addressed', 'Some tangential details could be removed', 'Could connect more explicitly to the question']
        },
        critical_thinking: {
          score: scores.critical_thinking_score,
          feedback: scores.critical_thinking_score <= 2 ? 'No analytical thinking related to the question was demonstrated. Show your reasoning process and how you approach problems.' : 'You showed good analytical thinking. Consider diving deeper into the "why" behind your decisions and their broader implications to demonstrate more sophisticated problem-solving abilities.',
          examples: scores.critical_thinking_score <= 2 ? ['No problem-solving shown', 'No relevant analysis', 'Surface-level thinking'] : ['Good problem-solving approach', 'Could explore alternative solutions', 'Analysis could go deeper']
        },
        thoroughness: {
          score: scores.thoroughness_score,
          feedback: scores.thoroughness_score <= 2 ? 'Answer did not cover any aspects of the actual question. A complete answer addresses all parts of the question with appropriate detail.' : 'Your answer covered the basics well. Adding more depth, considering edge cases, and addressing potential follow-up questions would strengthen your response and demonstrate comprehensive knowledge.',
          examples: scores.thoroughness_score <= 2 ? ['Incomplete response', 'Missing all key points', 'Insufficient detail'] : ['Covered main points effectively', 'Could include more comprehensive examples', 'Some aspects could use more detail']
        }
      }
    };
  }
}