import { useCallback, useRef, useState } from 'react';

// Wraps the browser's Web Speech API. No simulated/fake transcript here — if the API isn't
// available or errors, `error` is set so the caller can tell the user plainly what happened
// instead of quietly putting words in their mouth.
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const start = useCallback((lang = 'en-US') => {
    setTranscript('');
    setError(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('unsupported');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event) => {
        setError(event.error || 'unknown');
      };

      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setError('unsupported');
    }
  }, []);

  const stop = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore — recognition may already be stopped
      }
      recognitionRef.current = null;
    }
  }, []);

  return { transcript, isListening, error, start, stop };
}
