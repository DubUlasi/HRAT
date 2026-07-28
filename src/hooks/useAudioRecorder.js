import { useCallback, useRef, useState } from 'react';

// Records the mic alongside speech recognition so the original audio can be saved with the
// complaint and played back later. `start()` returns a promise that resolves once the mic has
// actually been claimed (or failed) — callers can await it to sequence it around other mic
// consumers (like SpeechRecognition) instead of racing them.
export function useAudioRecorder() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startingRef = useRef(null);

  const start = useCallback(() => {
    setAudioUrl(null);
    setError(null);
    chunksRef.current = [];

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('unsupported');
      startingRef.current = Promise.resolve();
      return startingRef.current;
    }

    startingRef.current = (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          setAudioUrl(URL.createObjectURL(blob));
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
      } catch (err) {
        setError(err?.name === 'NotAllowedError' ? 'not-allowed' : 'unavailable');
      }
    })();

    return startingRef.current;
  }, []);

  const stop = useCallback(async () => {
    if (startingRef.current) {
      await startingRef.current;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
  }, []);

  const reset = useCallback(() => {
    setAudioUrl(null);
    setError(null);
  }, []);

  return { audioUrl, error, start, stop, reset };
}
