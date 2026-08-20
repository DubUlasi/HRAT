import { useCallback, useRef, useState } from 'react';

// Web Speech API locale codes — Pidgin has no dedicated speech-recognition locale, so it
// falls back to en-US. Shared by every mic-to-text entry point (VoiceReportModal, the typed
// wizard's inline mic) so they all pick the same locale for a given app language.
export const SPEECH_LOCALE_MAP = { en: 'en-US', ha: 'ha-NG', yo: 'yo-NG', ig: 'ig-NG', pcm: 'en-US' };

// Errors that mean the mic session is genuinely over and shouldn't be auto-resumed (permission
// denied, no mic hardware, browser blocked it). Everything else — most commonly 'no-speech',
// which Chrome fires after a few seconds of silence and then ends the whole session — gets
// silently restarted instead of surfaced, since from the user's side "I paused to think" isn't
// an error.
const FATAL_ERRORS = ['not-allowed', 'audio-capture', 'service-not-allowed'];

// Wraps the browser's Web Speech API. No simulated/fake transcript here — if the API isn't
// available or hits a fatal error, `error` is set so the caller can tell the user plainly what
// happened instead of quietly putting words in their mouth. Non-fatal session drops (silence
// timeouts are common with `continuous: true`) are recovered from automatically by restarting
// a fresh recognition session and stitching its results onto what was already captured, so a
// pause mid-sentence doesn't silently truncate the transcript.
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const finalizedRef = useRef('');
  const langRef = useRef('en-US');

  const buildRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langRef.current;

    recognition.onresult = (event) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalChunk += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (finalChunk) {
        finalizedRef.current = `${finalizedRef.current} ${finalChunk}`.trim();
      }
      setTranscript(`${finalizedRef.current} ${interim}`.trim());
    };

    recognition.onerror = (event) => {
      if (FATAL_ERRORS.includes(event.error)) {
        shouldListenRef.current = false;
        setError(event.error);
      }
      // Non-fatal errors are left for onend to react to (it decides whether to restart).
    };

    recognition.onend = () => {
      if (!shouldListenRef.current) {
        setIsListening(false);
        return;
      }
      // Browser ended the session on its own (silence timeout, etc.) — resume seamlessly on a
      // fresh recognition instance rather than dropping the user back to "not listening".
      const next = buildRecognition();
      if (!next) {
        setIsListening(false);
        return;
      }
      try {
        next.start();
        recognitionRef.current = next;
      } catch {
        setIsListening(false);
      }
    };

    return recognition;
  }, []);

  const start = useCallback((lang = 'en-US') => {
    setTranscript('');
    setError(null);
    finalizedRef.current = '';
    langRef.current = lang;

    const recognition = buildRecognition();
    if (!recognition) {
      setError('unsupported');
      return;
    }

    try {
      recognition.start();
      recognitionRef.current = recognition;
      shouldListenRef.current = true;
      setIsListening(true);
    } catch {
      setError('unsupported');
    }
  }, [buildRecognition]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
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
