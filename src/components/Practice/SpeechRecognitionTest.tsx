import React, { useState, useEffect } from 'react';

// Add proper types for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onnomatch: (() => void) | null;
}

export const SpeechRecognitionTest: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setLogs(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
  };

  useEffect(() => {
    // Check browser support
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      setIsSupported(true);
      addLog('✅ Speech recognition is supported');
      
      // Initialize recognition
      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        addLog('🎤 Recording started');
        setIsRecording(true);
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let newTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            newTranscript += event.results[i][0].transcript;
          }
        }
        if (newTranscript) {
          setTranscript(prev => prev + ' ' + newTranscript);
          addLog(`📝 Transcript: "${newTranscript}"`);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        addLog(`❌ Error: ${event.error}`);
        if (event.message) {
          addLog(`📄 Error message: ${event.message}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        addLog('🛑 Recording ended');
        setIsRecording(false);
      };

      rec.onaudiostart = () => addLog('🔊 Audio capture started');
      rec.onaudioend = () => addLog('🔇 Audio capture ended');
      rec.onspeechstart = () => addLog('🗣️ Speech detected');
      rec.onspeechend = () => addLog('🤐 Speech ended');
      rec.onnomatch = () => addLog('❓ No speech match found');

      setRecognition(rec);
    } else {
      setIsSupported(false);
      addLog('❌ Speech recognition is NOT supported in this browser');
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      try {
        recognition.stop();
        addLog('🛑 Stopping recording...');
      } catch (e) {
        addLog('❌ Error stopping recording');
      }
    } else {
      try {
        recognition.start();
        addLog('🎤 Starting recording...');
      } catch (e) {
        addLog('❌ Error starting recording');
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    addLog('🧹 Transcript cleared');
  };

  if (isSupported === null) {
    return <div className="p-4">Checking browser support...</div>;
  }

  if (isSupported === false) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Speech Recognition Test</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            ❌ Speech recognition is not supported in this browser.
          </p>
          <p className="text-sm text-red-600 mt-2">
            Try using Chrome, Edge (Chromium), or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Speech Recognition Test</h2>
      
      {/* Status */}
      <div className="mb-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isRecording 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'
          }`}></div>
          {isRecording ? 'Recording' : 'Ready'}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={toggleRecording}
          className={`px-4 py-2 rounded-lg font-medium ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          onClick={clearTranscript}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium"
        >
          Clear Transcript
        </button>
      </div>

      {/* Transcript */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Transcript:</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[100px]">
          {transcript || <span className="text-gray-500">Start recording to see transcript...</span>}
        </div>
      </div>

      {/* Logs */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Debug Logs:</h3>
        <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
          {logs.length === 0 && (
            <span className="text-gray-500">No logs yet...</span>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Make sure you've granted microphone permissions</li>
          <li>• Speak clearly and at a normal volume</li>
          <li>• Network errors can occur due to firewall/proxy settings</li>
          <li>• Try refreshing the page if you get permission errors</li>
          <li>• Use Chrome or Edge for best compatibility</li>
        </ul>
      </div>
    </div>
  );
}; 