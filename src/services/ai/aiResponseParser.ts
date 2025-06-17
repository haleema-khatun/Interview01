export class AIResponseParser {
  // Enhanced helper method to clean JSON response with better error handling
  static cleanJsonResponse(content: string): string {
    console.log('🧹 Cleaning JSON response...');
    
    // Remove any markdown code blocks
    let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Find the first opening brace and last closing brace to extract JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.warn('⚠️ No valid JSON object boundaries found');
      throw new Error('No valid JSON object found in response');
    }
    
    // Extract only the JSON object
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    
    // Fix common JSON issues
    cleaned = this.fixCommonJsonIssues(cleaned);
    
    console.log('✅ JSON cleaned successfully');
    return cleaned;
  }

  // Special method for Groq responses
  static cleanGroqJsonResponse(content: string): string {
    console.log('🧹 Cleaning Groq JSON response...');
    
    // Remove any markdown code blocks, more aggressively for Groq
    let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any text before the first { and after the last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.warn('⚠️ No valid JSON object boundaries found in Groq response');
      throw new Error('No valid JSON object found in Groq response');
    }
    
    // Extract only the JSON object
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    
    // Groq-specific fixes
    // Fix property names that aren't properly quoted
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
    
    // Fix trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing commas between properties
    cleaned = cleaned.replace(/}(\s*)"/g, '},$1"');
    cleaned = cleaned.replace(/](\s*)"/g, '],$1"');
    
    // Fix escaped quotes in string values
    cleaned = cleaned.replace(/"([^"\\]*)(\\")([^"\\]*)"/, '"$1\\\\"$3"');
    
    // Fix any additional text after the JSON object
    if (cleaned.indexOf('}') < cleaned.length - 1) {
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('}') + 1);
    }
    
    // Apply comprehensive JSON fixes
    cleaned = this.fixCommonJsonIssues(cleaned);
    
    console.log('✅ Groq JSON cleaned successfully');
    return cleaned;
  }

  // Special method for OpenAI responses
  static cleanOpenAIJsonResponse(content: string): string {
    console.log('🧹 Cleaning OpenAI JSON response...');
    
    // Remove any markdown code blocks
    let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any text before the first { and after the last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.warn('⚠️ No valid JSON object boundaries found in OpenAI response');
      throw new Error('No valid JSON object found in OpenAI response');
    }
    
    // Extract only the JSON object
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    
    // OpenAI-specific fixes
    // OpenAI usually returns well-formed JSON, but sometimes has issues with nested quotes
    cleaned = cleaned.replace(/\\"/g, '\\\\"'); // Double escape already escaped quotes
    
    // Fix trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    console.log('✅ OpenAI JSON cleaned successfully');
    return cleaned;
  }

  // Special method for Gemini responses which often have different formatting issues
  static cleanGeminiJsonResponse(content: string): string {
    console.log('🧹 Cleaning Gemini JSON response...');
    
    // Remove any markdown code blocks, more aggressively for Gemini
    let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any text before the first { and after the last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
      console.warn('⚠️ No valid JSON object boundaries found in Gemini response');
      throw new Error('No valid JSON object found in Gemini response');
    }
    
    // Extract only the JSON object
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    
    // Fix common JSON issues with more aggressive fixes for Gemini
    cleaned = this.fixCommonJsonIssues(cleaned);
    
    // Additional Gemini-specific fixes
    
    // Fix property names that aren't properly quoted
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
    
    // Gemini often has issues with nested arrays and objects
    // Fix missing commas in arrays
    cleaned = cleaned.replace(/]([^\s,}\]])/g, '],$1');
    
    // Fix missing commas in objects
    cleaned = cleaned.replace(/}([^\s,}\]])/g, '},$1');
    
    console.log('✅ Gemini JSON cleaned successfully');
    return cleaned;
  }

  // Helper method to fix common JSON formatting issues
  static fixCommonJsonIssues(jsonStr: string): string {
    // More robust approach to fix JSON issues
    let result = '';
    let inString = false;
    let escapeNext = false;
    let i = 0;
    
    while (i < jsonStr.length) {
      const char = jsonStr[i];
      
      if (escapeNext) {
        result += char;
        escapeNext = false;
        i++;
        continue;
      }
      
      if (char === '\\') {
        result += char;
        escapeNext = true;
        i++;
        continue;
      }
      
      if (char === '"') {
        if (!inString) {
          // Starting a string
          inString = true;
          result += char;
        } else {
          // Ending a string
          inString = false;
          result += char;
        }
        i++;
        continue;
      }
      
      if (inString) {
        // Inside a string - escape problematic characters
        if (char === '\n') {
          result += '\\n';
        } else if (char === '\r') {
          result += '\\r';
        } else if (char === '\t') {
          result += '\\t';
        } else if (char === '\b') {
          result += '\\b';
        } else if (char === '\f') {
          result += '\\f';
        } else {
          result += char;
        }
      } else {
        // Outside string - handle structural issues
        result += char;
      }
      
      i++;
    }
    
    // Fix trailing commas before closing braces or brackets
    result = result.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix missing commas between properties (basic heuristic)
    result = result.replace(/}(\s*)"/g, '},$1"');
    result = result.replace(/](\s*)"/g, '],$1"');
    
    // Ensure proper closing of truncated JSON
    const openBraces = (result.match(/{/g) || []).length;
    const closeBraces = (result.match(/}/g) || []).length;
    const openBrackets = (result.match(/\[/g) || []).length;
    const closeBrackets = (result.match(/\]/g) || []).length;
    
    // Add missing closing brackets
    for (let j = 0; j < (openBrackets - closeBrackets); j++) {
      result += ']';
    }
    
    // Add missing closing braces
    for (let j = 0; j < (openBraces - closeBraces); j++) {
      result += '}';
    }
    
    return result;
  }

  // Helper method to escape quotes within string values
  static escapeQuotesInStringValues(jsonStr: string): string {
    // Simple approach to escape quotes in string values
    let result = '';
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i];
      
      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        result += char;
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        if (!inString) {
          inString = true;
        } else {
          inString = false;
        }
      }
      
      result += char;
    }
    
    return result;
  }

  // Enhanced helper method to extract partial JSON and complete it
  static extractPartialJson(content: string): any | null {
    console.log('🔧 Attempting to extract partial JSON...');
    
    try {
      // First, try to determine which model the response is from
      let cleaned;
      
      if (content.includes('groq') || content.includes('llama')) {
        try {
          cleaned = this.cleanGroqJsonResponse(content);
        } catch (groqError) {
          console.log('⚠️ Groq-specific cleaning failed, trying OpenAI cleaning');
          try {
            cleaned = this.cleanOpenAIJsonResponse(content);
          } catch (openaiError) {
            console.log('⚠️ OpenAI cleaning failed, trying Gemini cleaning');
            cleaned = this.cleanGeminiJsonResponse(content);
          }
        }
      } else if (content.includes('openai') || content.includes('gpt')) {
        try {
          cleaned = this.cleanOpenAIJsonResponse(content);
        } catch (openaiError) {
          console.log('⚠️ OpenAI-specific cleaning failed, trying generic cleaning');
          cleaned = this.cleanJsonResponse(content);
        }
      } else if (content.includes('gemini') || content.includes('google')) {
        try {
          cleaned = this.cleanGeminiJsonResponse(content);
        } catch (geminiError) {
          console.log('⚠️ Gemini-specific cleaning failed, trying generic cleaning');
          cleaned = this.cleanJsonResponse(content);
        }
      } else {
        // Try all methods in sequence
        try {
          cleaned = this.cleanGroqJsonResponse(content);
        } catch (error1) {
          try {
            cleaned = this.cleanOpenAIJsonResponse(content);
          } catch (error2) {
            try {
              cleaned = this.cleanGeminiJsonResponse(content);
            } catch (error3) {
              cleaned = this.cleanJsonResponse(content);
            }
          }
        }
      }
      
      // Try to parse the cleaned content
      try {
        const parsed = JSON.parse(cleaned);
        console.log('✅ Successfully parsed cleaned JSON');
        return parsed;
      } catch (parseError) {
        console.log('⚠️ Cleaned JSON still invalid, attempting reconstruction...');
        
        // If that fails, try to reconstruct the JSON step by step
        return this.reconstructPartialJson(cleaned);
      }
    } catch (cleanError) {
      console.log('⚠️ JSON cleaning failed, attempting raw reconstruction...');
      
      // If cleaning fails, try to work with the raw content
      return this.reconstructPartialJson(content);
    }
  }

  // Helper method to reconstruct partial/malformed JSON
  static reconstructPartialJson(content: string): any | null {
    try {
      // Find JSON boundaries
      const jsonStart = content.indexOf('{');
      if (jsonStart === -1) {
        console.log('❌ No opening brace found');
        return null;
      }
      
      let jsonContent = content.substring(jsonStart);
      
      // Try to build a valid JSON object by parsing line by line
      const lines = jsonContent.split('\n');
      let reconstructed = '';
      let braceCount = 0;
      let bracketCount = 0;
      let inString = false;
      let escapeNext = false;
      
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex].trim();
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (escapeNext) {
            escapeNext = false;
            reconstructed += char;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            reconstructed += char;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
          }
          
          if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
          }
          
          reconstructed += char;
          
          // If we have a complete JSON structure, try to parse it
          if (braceCount === 0 && bracketCount === 0 && reconstructed.trim().endsWith('}')) {
            try {
              const testParse = JSON.parse(reconstructed.trim());
              console.log('✅ Successfully reconstructed JSON');
              return testParse;
            } catch (e) {
              // Continue building
            }
          }
        }
        
        // Add newline if not the last line
        if (lineIndex < lines.length - 1) {
          reconstructed += '\n';
        }
      }
      
      // If we reach here, try to complete the structure
      while (bracketCount > 0) {
        reconstructed += ']';
        bracketCount--;
      }
      
      while (braceCount > 0) {
        reconstructed += '}';
        braceCount--;
      }
      
      // Final attempt to parse
      try {
        const finalParsed = JSON.parse(reconstructed.trim());
        console.log('✅ Successfully completed and parsed JSON');
        return finalParsed;
      } catch (e) {
        console.log('❌ Final JSON reconstruction failed');
        
        // Last resort: try to extract a partial object with regex
        try {
          const partialMatch = reconstructed.match(/{[^{]*"clarity_score"[^}]*}/);
          if (partialMatch) {
            const partialJson = partialMatch[0];
            console.log('⚠️ Extracted partial JSON with regex:', partialJson);
            
            // Try to fix and parse this partial JSON
            const fixedPartial = this.fixCommonJsonIssues(partialJson);
            return JSON.parse(fixedPartial);
          }
        } catch (regexError) {
          console.log('❌ Regex extraction failed:', regexError);
        }
        
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error reconstructing partial JSON:', error);
      return null;
    }
  }

  // Helper method to validate and fix evaluation structure
  static validateAndFixEvaluation(evaluation: any): any {
    const defaultEvaluation = {
      clarity_score: 1,
      relevance_score: 1,
      critical_thinking_score: 1,
      thoroughness_score: 1,
      feedback_text: 'This answer appears to be completely irrelevant to the question asked. Please provide a proper response that directly addresses the question.',
      strengths: ['Answer was provided'],
      improvements: ['Answer the actual question asked', 'Stay on topic', 'Provide relevant information'],
      suggested_answer: 'A proper answer would directly address the question with relevant examples and clear reasoning.',
      key_points_missed: ['The entire question was not addressed', 'No relevant content provided'],
      interview_tips: ['Always read the question carefully', 'Stay focused on the topic', 'Provide specific examples'],
      detailed_breakdown: {
        clarity: {
          score: 1,
          feedback: 'Answer was not relevant to the question.',
          examples: ['Off-topic response', 'Did not address the question']
        },
        relevance: {
          score: 1,
          feedback: 'Answer was completely irrelevant.',
          examples: ['Wrong topic', 'No connection to question']
        },
        critical_thinking: {
          score: 1,
          feedback: 'No analytical thinking related to the question.',
          examples: ['No problem-solving shown', 'No relevant analysis']
        },
        thoroughness: {
          score: 1,
          feedback: 'Did not cover any aspects of the actual question.',
          examples: ['Incomplete response', 'Missing all key points']
        }
      }
    };

    // Merge with defaults to ensure all required fields exist
    const result = { ...defaultEvaluation, ...evaluation };

    // Validate and fix scores - be strict about relevance
    const scoreFields = ['clarity_score', 'relevance_score', 'critical_thinking_score', 'thoroughness_score'];
    scoreFields.forEach(field => {
      if (typeof result[field] !== 'number' || result[field] < 1 || result[field] > 10) {
        result[field] = 1;
      }
    });

    // If relevance score is very low (1-2), make other scores low too
    if (result.relevance_score <= 2) {
      result.clarity_score = Math.min(result.clarity_score, 2);
      result.critical_thinking_score = Math.min(result.critical_thinking_score, 2);
      result.thoroughness_score = Math.min(result.thoroughness_score, 2);
    }

    // Ensure arrays exist and have content
    ['strengths', 'improvements', 'key_points_missed', 'interview_tips'].forEach(field => {
      if (!Array.isArray(result[field]) || result[field].length === 0) {
        result[field] = defaultEvaluation[field];
      }
    });

    // Ensure detailed_breakdown exists and is properly structured
    if (!result.detailed_breakdown || typeof result.detailed_breakdown !== 'object') {
      result.detailed_breakdown = defaultEvaluation.detailed_breakdown;
    } else {
      ['clarity', 'relevance', 'critical_thinking', 'thoroughness'].forEach(category => {
        if (!result.detailed_breakdown[category]) {
          result.detailed_breakdown[category] = defaultEvaluation.detailed_breakdown[category];
        } else {
          // Validate score
          if (typeof result.detailed_breakdown[category].score !== 'number' || 
              result.detailed_breakdown[category].score < 1 || 
              result.detailed_breakdown[category].score > 10) {
            result.detailed_breakdown[category].score = 1;
          }
          
          // If main relevance is low, make breakdown scores low too
          if (result.relevance_score <= 2 && category !== 'relevance') {
            result.detailed_breakdown[category].score = Math.min(result.detailed_breakdown[category].score, 2);
          }
          
          // Ensure feedback exists
          if (!result.detailed_breakdown[category].feedback) {
            result.detailed_breakdown[category].feedback = defaultEvaluation.detailed_breakdown[category].feedback;
          }
          
          // Ensure examples array exists
          if (!Array.isArray(result.detailed_breakdown[category].examples)) {
            result.detailed_breakdown[category].examples = defaultEvaluation.detailed_breakdown[category].examples;
          }
        }
      });
    }

    // Ensure strings exist
    ['feedback_text', 'suggested_answer'].forEach(field => {
      if (typeof result[field] !== 'string' || result[field].trim() === '') {
        result[field] = defaultEvaluation[field];
      }
    });

    return result;
  }
}