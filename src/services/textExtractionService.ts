import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface TextExtractionResult {
  text: string;
  success: boolean;
  error?: string;
}

export class TextExtractionService {
  // Extract text from PDF files using PDF.js (browser-compatible)
  static async extractFromPDF(file: File): Promise<TextExtractionResult> {
    try {
      console.log('📄 Extracting text from PDF...');
      
      // Use PDF.js library for client-side PDF text extraction
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source to bundled worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      console.log('✅ PDF text extraction successful');
      return {
        text: fullText.trim(),
        success: true
      };
    } catch (error) {
      console.error('❌ PDF extraction error:', error);
      return {
        text: '',
        success: false,
        error: 'Failed to extract text from PDF. Please try converting to a text format or paste the content manually.'
      };
    }
  }

  // Extract text from DOC/DOCX files using mammoth.js
  static async extractFromDOC(file: File): Promise<TextExtractionResult> {
    try {
      console.log('📄 Extracting text from DOC/DOCX...');
      
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      console.log('✅ DOC text extraction successful');
      return {
        text: result.value.trim(),
        success: true
      };
    } catch (error) {
      console.error('❌ DOC extraction error:', error);
      return {
        text: '',
        success: false,
        error: 'Failed to extract text from DOC file. Please try converting to PDF or paste the content manually.'
      };
    }
  }

  // Main extraction method that handles different file types
  static async extractText(file: File): Promise<TextExtractionResult> {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    console.log(`🔍 Extracting text from file: ${file.name} (${fileType})`);
    
    try {
      // Handle PDF files
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return await this.extractFromPDF(file);
      }
      
      // Handle DOC/DOCX files
      if (fileType === 'application/msword' || 
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileName.endsWith('.doc') || 
          fileName.endsWith('.docx')) {
        return await this.extractFromDOC(file);
      }
      
      // Handle plain text files
      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        const text = await file.text();
        return {
          text: text.trim(),
          success: true
        };
      }
      
      // Unsupported file type
      return {
        text: '',
        success: false,
        error: 'Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.'
      };
      
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      return {
        text: '',
        success: false,
        error: 'Failed to extract text from file. Please try a different format or paste the content manually.'
      };
    }
  }

  // Clean and normalize extracted text
  static cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might interfere with AI processing
      .replace(/[^\w\s\-.,;:()\[\]{}'"@#$%&*+=<>?/\\|`~]/g, '')
      // Trim whitespace
      .trim();
  }

  // Validate extracted text quality
  static validateText(text: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (text.length < 100) {
      issues.push('Text seems too short for a complete resume');
    }
    
    if (text.length > 50000) {
      issues.push('Text is very long - consider using a more concise resume');
    }
    
    // Check for common resume sections
    const hasContact = /email|phone|@/.test(text.toLowerCase());
    const hasExperience = /experience|work|job|position|role/.test(text.toLowerCase());
    const hasSkills = /skills|technologies|programming|software/.test(text.toLowerCase());
    
    if (!hasContact) {
      issues.push('Contact information may be missing or unclear');
    }
    
    if (!hasExperience) {
      issues.push('Work experience section may be missing');
    }
    
    if (!hasSkills) {
      issues.push('Skills section may be missing');
    }
    
    return {
      isValid: issues.length < 3, // Allow some flexibility
      issues
    };
  }
}