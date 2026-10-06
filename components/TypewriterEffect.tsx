'use client';

import { useState, useEffect } from 'react';

const words = ["UI/UX designer", "frontend developer", "mobile app developer"];

export default function TypewriterEffect() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleType = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 40 : 120);

      if (!isDeleting && text === fullText) {
        timer = setTimeout(() => setIsDeleting(true), 2000); // pause at full word
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        timer = setTimeout(handleType, 400); // pause before starting new word
      } else {
        timer = setTimeout(handleType, typingSpeed);
      }
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <div className="font-mono text-xl lg:text-2xl font-semibold mb-6 flex items-center h-8 fade-in d2">
      <span className="text-[#4ade80] mr-3">{'>'}</span>
      <span className="text-[#41c7ff]">{text}</span>
      <span className="animate-[blink_1s_infinite] text-[#eef0fb] ml-[2px] font-bold">_</span>
    </div>
  );
}
