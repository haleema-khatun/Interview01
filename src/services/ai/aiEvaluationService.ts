import { TokenEstimator } from '../tokenEstimator';
import { AIProviderManager } from './aiProviderManager';
import { AIResponseParser } from './aiResponseParser';
import { MockEvaluationGenerator } from './mockEvaluationGenerator';
import { EvaluationRequest, EvaluationResponse } from './types';

export class AIEvaluationService {
  // Check if any API keys are available
  static hasApiKeys(): { groq: boolean; openai: boolean; gemini: boolean } {
    return AIProviderManager.hasApiKeys();
  }

  // Force a specific provider for testing or debugging
  static forceProvider(provider: 'groq' | 'openai' | 'gemini' | 'auto' | null) {
    AIProviderManager.forceProvider(provider);
  }

  // New method for generating raw content (not evaluation-specific)
  static async generateContentWithBestAvailable(prompt: string): Promise<string> {
    const availableKeys = this.hasApiKeys();
    
    console.log('🔑 Available API keys for content generation:', availableKeys);
    console.log('🚫 Failed providers:', Array.from(AIProviderManager.getFailedProviders()));
    
    // Get list of available providers in priority order (Groq -> OpenAI -> Gemini)
    const providerPriority: Array<{ name: 'groq' | 'openai' | 'gemini', available: boolean }> = [
      { name: 'groq', available: availableKeys.groq && AIProviderManager.isProviderAvailable('groq') },
      { name: 'openai', available: availableKeys.openai && AIProviderManager.isProviderAvailable('openai') },
      { name: 'gemini', available: availableKeys.gemini && AIProviderManager.isProviderAvailable('gemini') }
    ];
    
    const availableProviders = providerPriority.filter(p => p.available);
    
    console.log('✅ Available providers for content generation:', availableProviders.map(p => p.name));
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available. Please check your API keys configuration.');
    }
    
    // Try each available provider in order
    for (let i = 0; i < availableProviders.length; i++) {
      const provider = availableProviders[i];
      const remainingProviders = availableProviders.slice(i + 1).map(p => p.name);
      
      try {
        console.log(`🚀 Trying ${provider.name} for content generation (${i + 1}/${availableProviders.length})`);
        
        const content = await AIProviderManager.generateRawText(prompt, provider.name);
        console.log(`✅ Successfully generated content with ${provider.name}`);
        return content;
      } catch (error: any) {
        console.warn(`⚠️ ${provider.name} failed for content generation:`, error.message);
        
        // Show warning popup if this provider hit limits
        if (error.limitInfo) {
          AIProviderManager.showLimitWarning(error.limitInfo, remainingProviders);
        }
        
        // If this is the last provider, throw the error
        if (i === availableProviders.length - 1) {
          throw new Error(`All AI providers failed. Last error: ${error.message}`);
        }
        
        // Continue to next provider
        continue;
      }
    }
    
    throw new Error('All AI providers failed for content generation.');
  }

  // Auto-select best available AI service with intelligent switching
  static async evaluateWithBestAvailable(request: EvaluationRequest): Promise<EvaluationResponse> {
    const availableKeys = this.hasApiKeys();
    
    console.log('🔑 Available API keys:', availableKeys);
    console.log('📊 Rating mode:', request.ratingMode || 'lenient');
    console.log('📊 Evaluation type:', request.evaluationType || 'simple');
    console.log('🚫 Failed providers:', Array.from(AIProviderManager.getFailedProviders()));
    
    // Get list of available providers in priority order (Groq -> OpenAI -> Gemini)
    const providerPriority: Array<{ name: 'groq' | 'openai' | 'gemini', available: boolean }> = [
      { name: 'groq', available: availableKeys.groq && AIProviderManager.isProviderAvailable('groq') },
      { name: 'openai', available: availableKeys.openai && AIProviderManager.isProviderAvailable('openai') },
      { name: 'gemini', available: availableKeys.gemini && AIProviderManager.isProviderAvailable('gemini') }
    ];
    
    // If the user selected a specific provider in the UI, prioritize that one
    if (request.selectedProvider && request.selectedProvider !== 'auto') {
      // Move the selected provider to the front of the list
      const selectedIndex = providerPriority.findIndex(p => p.name === request.selectedProvider);
      if (selectedIndex !== -1) {
        const selected = providerPriority.splice(selectedIndex, 1)[0];
        providerPriority.unshift(selected);
        console.log(`🔄 Prioritizing user-selected provider: ${selected.name}`);
      }
    }
    
    const availableProviders = providerPriority.filter(p => p.available);
    
    console.log('✅ Available providers in priority order:', availableProviders.map(p => p.name));
    
    if (availableProviders.length === 0) {
      console.log('ℹ️ No API keys or all providers failed, using enhanced mock evaluation');
      return await MockEvaluationGenerator.generateEvaluation(request);
    }
    
    // Try each available provider in order
    for (let i = 0; i < availableProviders.length; i++) {
      const provider = availableProviders[i];
      const remainingProviders = availableProviders.slice(i + 1).map(p => p.name);
      
      try {
        console.log(`🚀 Trying ${provider.name} (${i + 1}/${availableProviders.length})`);
        
        switch (provider.name) {
          case 'groq':
            return await AIProviderManager.evaluateWithGroq(request);
          case 'openai':
            return await AIProviderManager.evaluateWithOpenAI(request);
          case 'gemini':
            return await AIProviderManager.evaluateWithGemini(request);
        }
      } catch (error: any) {
        console.warn(`⚠️ ${provider.name} failed:`, error.message);
        
        // Show warning popup if this provider hit limits
        if (error.limitInfo) {
          AIProviderManager.showLimitWarning(error.limitInfo, remainingProviders);
        }
        
        // If this is the last provider, throw the error
        if (i === availableProviders.length - 1) {
          // If all providers failed, fall back to mock
          console.log('❌ All providers failed, falling back to mock evaluation');
          return await MockEvaluationGenerator.generateEvaluation(request);
        }
        
        // Continue to next provider
        continue;
      }
    }
    
    // Fallback to mock if we somehow get here
    console.log('ℹ️ Fallback to mock evaluation');
    return await MockEvaluationGenerator.generateEvaluation(request);
  }

  // Get status of all providers
  static getProviderStatus(): { 
    groq: { available: boolean; hasKey: boolean; failed: boolean }; 
    openai: { available: boolean; hasKey: boolean; failed: boolean }; 
    gemini: { available: boolean; hasKey: boolean; failed: boolean }; 
  } {
    return AIProviderManager.getProviderStatus();
  }

  // Reset failed providers (for manual retry)
  static resetFailedProviders(): void {
    AIProviderManager.resetFailedProviders();
  }

  // For backward compatibility
  static mockEvaluation = MockEvaluationGenerator.generateEvaluation;
}