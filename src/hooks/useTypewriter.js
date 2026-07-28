import { useEffect, useState } from 'react';

// Rotates through `messages` ({ badge, text }[]), typing each one out character by character
// and holding it before moving to the next.
export function useTypewriter(messages, { charDelay = 45, holdDuration = 6500 } = {}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    const fullText = messages[index]?.text || '';
    let timeoutId;

    if (text.length < fullText.length) {
      timeoutId = setTimeout(() => setText(fullText.slice(0, text.length + 1)), charDelay);
    } else {
      timeoutId = setTimeout(() => {
        setText('');
        setIndex((prev) => (prev + 1) % messages.length);
      }, holdDuration);
    }

    return () => clearTimeout(timeoutId);
  }, [text, index, messages, charDelay, holdDuration]);

  return { message: messages[index], text };
}
